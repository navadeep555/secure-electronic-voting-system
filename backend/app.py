import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
import base64
import numpy as np
from flask_jwt_extended import JWTManager, create_access_token
import pickle
import random
import psycopg2
from psycopg2.extras import RealDictCursor

# --- Monkeypatch for easyocr + python-bidi >= 0.5.0 ---
import sys
try:
    import bidi.algorithm
    import bidi
    if not hasattr(bidi, 'get_display'):
        bidi.get_display = bidi.algorithm.get_display
        sys.modules['bidi'].get_display = bidi.algorithm.get_display
except ImportError:
    pass

import hashlib
import time
import jwt as pyjwt
import datetime
import uuid
import hmac
import hashlib
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from cryptography.fernet import Fernet
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from auth import voter_required, roles_required
from functools import wraps
import requests
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import security_monitor
import subprocess

# =======================
# APP SETUP
# =======================

load_dotenv()

app = Flask(__name__)

# Apply security headers (CSP handled by Nginx, disable force_https as Nginx proxies it)
Talisman(app, force_https=False, content_security_policy=None)

# Apply rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

JWT_SECRET = os.getenv("JWT_SECRET", "your_shared_secret")
app.config['SECRET_KEY'] = JWT_SECRET
jwt_manager = JWTManager(app)
# Configure CORS - Combine defaults with environment variables
allowed_origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    # Handle comma-separated list of origins
    allowed_origins.extend([o.strip() for o in env_origins.split(",")])

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# PostgreSQL connection settings (from environment)
# On Render, DATABASE_URL is automatically injected.
# Locally, individual DB_* variables are used (see docker-compose.yml).
_DATABASE_URL = os.getenv("DATABASE_URL")
if _DATABASE_URL:
    import urllib.parse as _urlparse
    _parsed = _urlparse.urlparse(_DATABASE_URL)
    DB_CONFIG = {
        "host": _parsed.hostname,
        "port": _parsed.port or 5432,
        "user": _parsed.username,
        "password": _parsed.password,
        "dbname": _parsed.path.lstrip("/"),
        "sslmode": "require",   # Required for Render managed PostgreSQL
    }
else:
    DB_CONFIG = {
        "host": os.getenv("DB_HOST", "postgres"),
        "port": int(os.getenv("DB_PORT", 5432)),
        "user": os.getenv("DB_USER", "voting"),
        "password": os.getenv("DB_PASSWORD", "voting123"),
        "dbname": os.getenv("DB_NAME", "votingdb"),
    }

OTP_EXPIRY_SECONDS = 120
DB_INTEGRITY_KEY = os.environ.get('DB_INTEGRITY_KEY', 'change_this_in_production_key').encode()

# US 6.1: Fernet Encryption initialization for sensitive data at rest
_FERNET_SECRET = os.environ.get('FERNET_SECRET')
if not _FERNET_SECRET:
    # Generate one for dev if missing. In prod this must be consistent in .env
    _FERNET_SECRET = Fernet.generate_key().decode()
    os.environ['FERNET_SECRET'] = _FERNET_SECRET

cipher_suite = Fernet(_FERNET_SECRET.encode())

def encrypt_data(data: str) -> str:
    if not data: return data
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(data: str) -> str:
    if not data: return data
    try:
        return cipher_suite.decrypt(data.encode()).decode()
    except Exception:
        # Fallback if it wasn't encrypted (e.g. migration)
        return data

print("[OK] Cryptography keys loaded")
print("[OK] Flask Secret Loaded")


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = app.make_default_options_response()
        res.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        res.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        return res

@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify(status="ok", service="flask-backend"), 200

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token missing'}), 401
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            pyjwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except Exception as e:
            conn = get_db()
            security_monitor.log_system_event(
                conn, 
                "UNAUTHORIZED_ACCESS", 
                f"Invalid token or access attempt: {str(e)}", 
                source_ip=request.remote_addr
            )
            conn.close()
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated


@app.before_request
def auto_close_expired_elections():
    """US 2.4: Automatically moves ACTIVE elections to CLOSED status if end_time exceeded."""
    if request.path.startswith('/api/admin') or request.path.startswith('/api/voter'):
        conn = get_db()
        now = int(time.time())
        cursor = db_execute(conn, """
            UPDATE elections 
            SET status = 'CLOSED' 
            WHERE status = 'ACTIVE' AND end_time <= %s
        """, (now,))
        if cursor.rowcount > 0:
            conn.commit()
            print(f"[OK] Auto-Closed {cursor.rowcount} expired election(s) at {now}")
        conn.close()


# =======================
# UTILS
# =======================

def get_db():
    """Return a psycopg2 connection with RealDictCursor (rows act like dicts)."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        conn = psycopg2.connect(db_url)
    else:
        conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    return conn


def db_execute(conn, sql, params=None):
    """Helper: execute SQL, return cursor. Keeps callers concise."""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(sql, params or ())
    return cur


def compute_hash(data_string):
    """US2.4: Generates SHA-256 integrity hashes for the ballot chain."""
    return hashlib.sha256(data_string.encode()).hexdigest()


# =======================
# DATABASE INIT
# =======================

def init_db():
    print("⏳ Initializing database connection...")
    conn = None
    for attempt in range(1, 11):
        try:
            conn = get_db()
            print(f"✅ Database connection established on attempt {attempt}")
            break
        except Exception as e:
            print(f"⚠️ Connection attempt {attempt}/10 failed: {e}")
            if attempt == 10:
                print("❌ CRITICAL: Could not connect to database after 10 attempts.")
                raise e
            time.sleep(3)

    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id_hash TEXT PRIMARY KEY,
            phone_hash TEXT,
            role TEXT CHECK(role IN ('admin','voter')) NOT NULL,
            otp TEXT,
            otp_time BIGINT,
            is_verified INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS elections (
            election_id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            start_time BIGINT,
            end_time BIGINT,
            status TEXT CHECK(status IN ('DRAFT','ACTIVE', 'PAUSED', 'CLOSED')),
            created_by TEXT,
            created_at BIGINT,
            results_published INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id TEXT PRIMARY KEY,
            election_id TEXT,
            name TEXT,
            party TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS election_voters (
            election_id TEXT,
            user_id_hash TEXT,
            has_voted INTEGER DEFAULT 0,
            PRIMARY KEY (election_id, user_id_hash)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS votes (
            vote_id TEXT PRIMARY KEY,
            election_id TEXT,
            candidate_id TEXT,
            timestamp BIGINT,
            previous_hash TEXT,
            block_hash TEXT,
            integrity_signature TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            action TEXT,
            table_name TEXT,
            row_id TEXT,
            old_value TEXT,
            new_value TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # PostgreSQL trigger to prevent vote tampering
    c.execute("""
        CREATE OR REPLACE FUNCTION trap_vote_tampering_fn()
        RETURNS TRIGGER LANGUAGE plpgsql AS $$
        BEGIN
            INSERT INTO audit_log (action, table_name, row_id, old_value, new_value)
            VALUES ('UNAUTHORIZED_UPDATE_ATTEMPT', 'votes', OLD.vote_id, OLD.candidate_id, NEW.candidate_id);
            RAISE EXCEPTION 'Security Error: Ballots are immutable and cannot be changed.';
        END;
        $$;
    """)
    c.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger WHERE tgname = 'trap_vote_tampering'
            ) THEN
                CREATE TRIGGER trap_vote_tampering
                BEFORE UPDATE ON votes
                FOR EACH ROW EXECUTE FUNCTION trap_vote_tampering_fn();
            END IF;
        END $$;
    """)

    c.execute("""
        CREATE OR REPLACE FUNCTION trap_audit_tampering_fn()
        RETURNS TRIGGER LANGUAGE plpgsql AS $$
        BEGIN
            RAISE EXCEPTION 'Security Error: Audit logs are append-only and immutable.';
        END;
        $$;
    """)
    c.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger WHERE tgname = 'trap_audit_tampering'
            ) THEN
                CREATE TRIGGER trap_audit_tampering
                BEFORE UPDATE OR DELETE ON audit_log
                FOR EACH ROW EXECUTE FUNCTION trap_audit_tampering_fn();
            END IF;
        END $$;
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            log_id SERIAL PRIMARY KEY,
            event_type TEXT,
            details TEXT,
            admin_id TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
        )
    """)

    conn.commit()
    conn.close()
    print("[OK] Database Initialized with Secure Ledger, HMAC signatures, and Audit Triggers")


def _start_continuous_monitoring():
    """US 6.2: Background thread that continuously monitors for data anomalies."""
    import threading
    def _monitor():
        while True:
            time.sleep(300)  # Check every 5 minutes
            try:
                conn = get_db()
                cur = db_execute(conn, "SELECT election_id FROM elections WHERE status IN ('ACTIVE', 'CLOSED')")
                elections = [r['election_id'] for r in cur.fetchall()]
                conn.close()
                for eid in elections:
                    perform_live_audit(eid)
                print(f"[MONITOR] Background audit complete for {len(elections)} elections.")
            except Exception as e:
                print(f"[MONITOR] Error during background audit: {e}")

    t = threading.Thread(target=_monitor, daemon=True)
    t.start()

_start_continuous_monitoring()

init_db()


def perform_live_audit(eid):
    conn = get_db()

    cur = db_execute(conn, "SELECT candidate_id, name FROM candidates WHERE election_id = %s", (eid,))
    candidates = cur.fetchall()
    results_map = {c['candidate_id']: {"name": c['name'], "count": 0} for c in candidates}

    cur = db_execute(conn, 
        "SELECT vote_id, election_id, candidate_id, timestamp, block_hash, integrity_signature FROM votes WHERE election_id = %s",
        (eid,)
    )
    ballots = cur.fetchall()

    total_votes = len(ballots)
    tampered_found = False

    for v in ballots:
        payload = f"{v['vote_id']}|{v['election_id']}|{v['candidate_id']}|{v['timestamp']}|{v['block_hash']}"
        expected_sig = hmac.new(DB_INTEGRITY_KEY, payload.encode(), hashlib.sha256).hexdigest()

        if expected_sig != v['integrity_signature']:
            tampered_found = True
            security_monitor.log_security_alert(
                conn,
                "TAMPERING_DETECTED",
                f"Integrity mismatch for vote {v['vote_id']} during audit",
                affected_table="votes"
            )
            break

        if v['candidate_id'] in results_map:
            results_map[v['candidate_id']]["count"] += 1

    audit_status = "SUCCESS" if (total_votes > 0 and not tampered_found) else "FAILED"
    if total_votes == 0:
        audit_status = "PENDING"

    final_results = [{"candidate_name": data["name"], "votes": data["count"]} for data in results_map.values()]

    db_execute(conn,
        "INSERT INTO system_logs (event_type, details) VALUES (%s, %s)",
        ('AUDIT_PERFORMED', f"Audit for {eid}. Votes: {total_votes}. Tampered: {tampered_found}")
    )
    conn.commit()
    conn.close()

    return final_results, total_votes, audit_status


# =======================
# FACE RECOGNITION ENGINE  (FIXED)
# =======================

def _prewarm_models():
    """Pre-warm the FaceRecognitionSystem in background so first user request is fast."""
    import threading
    def _load():
        time.sleep(5)  # Wait for server to fully boot first
        try:
            print("[PREWARM] Loading FaceRecognitionSystem in background...")
            get_face_system()
            print("[PREWARM] FaceRecognitionSystem ready.")
        except Exception as e:
            print(f"[PREWARM] FaceRecognitionSystem failed: {e}")
        print("[PREWARM] All models warm and ready!")

    t = threading.Thread(target=_load, daemon=True)
    t.start()

import cv2

class FaceRecognitionSystem:
    """
    DLIB-FREE face recognition using OpenCV (detection) + sklearn cosine similarity (matching).
    Works on Python 3.12 + Windows where dlib/face_recognition numpy interface is broken.
    """
    SIMILARITY_THRESHOLD = 0.82  # Cosine similarity threshold (0-1, higher = stricter)

    def __init__(self):
        self.path = os.path.join("encodings", "face_encodings.pkl")
        self.known = {}
        self.cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        if self.cascade.empty():
            raise RuntimeError("OpenCV Haar cascade not found. Reinstall opencv-python.")
        print("OpenCV Haar cascade loaded successfully")
        self.load()

    def load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "rb") as f:
                    self.known = pickle.load(f)
                print(f"Loaded {len(self.known)} stored face(s)")
            except:
                self.known = {}

    def save(self):
        os.makedirs("encodings", exist_ok=True)
        with open(self.path, "wb") as f:
            pickle.dump(self.known, f)

    def decode(self, b64):
        """Decode base64 image string -> RGB numpy array."""
        try:
            if "," in b64:
                b64 = b64.split(",")[1]
            img_data = base64.b64decode(b64.replace(" ", "+"))
            pil = Image.open(BytesIO(img_data)).convert("RGB")
            if pil.width > 1000 or pil.height > 1000:
                pil.thumbnail((1000, 1000), Image.LANCZOS)
            arr = np.array(pil, dtype=np.uint8)
            print(f"Decoded: shape={arr.shape}, dtype={arr.dtype}")
            return arr
        except Exception as e:
            print(f"Decode Error: {e}")
            return None

    def _detect_face(self, rgb_arr):
        """
        Use OpenCV Haar cascade to find the largest face.
        Returns cropped grayscale face (128x128) or None.
        """
        gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

        # Try progressively more aggressive settings
        for scale, neighbors, min_sz in [
            (1.1, 5, (60, 60)),
            (1.1, 3, (40, 40)),
            (1.05, 3, (30, 30)),
        ]:
            faces = self.cascade.detectMultiScale(
                gray, scaleFactor=scale, minNeighbors=neighbors, minSize=min_sz
            )
            if len(faces) > 0:
                break

        if len(faces) == 0:
            return None

        # Pick largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

        # Add 20% padding
        pad = int(0.2 * min(w, h))
        x1 = max(0, x - pad); y1 = max(0, y - pad)
        x2 = min(rgb_arr.shape[1], x + w + pad)
        y2 = min(rgb_arr.shape[0], y + h + pad)

        face_crop = gray[y1:y2, x1:x2]
        if face_crop.size == 0:
            return None

        face_resized = cv2.resize(face_crop, (128, 128))
        face_eq = cv2.equalizeHist(face_resized)  # Normalize lighting
        return face_eq

    def get_embedding(self, rgb_arr):
        """
        Detect face and return a normalized 16384-dim embedding vector.
        Returns None if no face found.
        """
        if rgb_arr is None:
            return None

        # Try at original size first, then scaled versions
        h, w = rgb_arr.shape[:2]
        for scale_w in [w, 640, 1280]:
            scale_h = max(1, int(h * scale_w / w))
            if scale_w != w:
                pil = Image.fromarray(rgb_arr).resize((scale_w, scale_h), Image.LANCZOS)
                arr = np.array(pil, dtype=np.uint8)
            else:
                arr = rgb_arr

            face = self._detect_face(arr)
            print(f"  OpenCV detect [{scale_w}x{scale_h}]: {'FOUND' if face is not None else 'not found'}")
            if face is not None:
                embedding = face.flatten().astype(np.float32)
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding /= norm
                return embedding

        return None

    # - Backward-compatible alias used by existing routes -
    def encode(self, img_array):
        """Alias for get_embedding()  keeps existing route code working."""
        return self.get_embedding(img_array)

    def compare(self, embedding1, embedding2):
        """Return cosine similarity between two embeddings (0-1)."""
        from sklearn.metrics.pairwise import cosine_similarity
        sim = cosine_similarity([embedding1], [embedding2])[0][0]
        return float(sim)

_face_system = None
def get_face_system():
    global _face_system
    if _face_system is None:
        print("Lazy-loading FaceRecognitionSystem into memory...")
        _face_system = FaceRecognitionSystem()
    return _face_system


@app.route("/")
def index():
    """Root endpoint to show server status."""
    return jsonify(
        status="healthy",
        message="Secure Electronic Voting System - Backend is Live!",
        version="1.0.1"
    )


# =======================
# USER & AUTH ROUTES (EPIC 1)
# =======================

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    """
    US1.2: Identity Verification using Tesseract OCR (pytesseract).
    Uses the system tesseract-ocr binary — no PyTorch / no EasyOCR.
    Checks extracted text for keywords present on Indian government IDs
    (Voter ID / EPIC and Aadhaar card).
    """
    try:
        import pytesseract

        img_b64 = request.json.get("documentImage")
        if not img_b64:
            return jsonify(success=False, message="No image provided"), 400

        # ── Decode ────────────────────────────────────────────────────────────
        try:
            b64_data = img_b64.split(",")[1] if "," in img_b64 else img_b64
            img_data = base64.b64decode(b64_data.replace(" ", "+"))
            pil_img = Image.open(BytesIO(img_data)).convert("RGB")
            # Tesseract works best at ~300 DPI equivalent; 1200px is plenty
            if pil_img.width > 1200 or pil_img.height > 1200:
                pil_img.thumbnail((1200, 1200), Image.LANCZOS)
        except Exception as decode_err:
            print(f"[verify-document] Decode error: {decode_err}")
            return jsonify(success=False, message="Invalid image data. Please upload a valid JPEG or PNG."), 400

        # ── Run OCR ───────────────────────────────────────────────────────────
        try:
            # psm 6 = assume a single uniform block of text (good for ID cards)
            text = pytesseract.image_to_string(
                pil_img,
                lang="eng",
                config="--psm 6"
            ).upper()
            print(f"[verify-document] OCR text: {text[:300]}")
        except Exception as ocr_err:
            print(f"[verify-document] OCR error: {ocr_err}")
            return jsonify(success=False, message="OCR failed. Please try again with a clearer image."), 500

        # ── Keyword match ─────────────────────────────────────────────────────
        # Voter ID (EPIC): ELECTION COMMISSION OF INDIA, ELECTORAL, IDENTITY CARD
        # Aadhaar: AADHAAR, UIDAI, UNIQUE IDENTIFICATION, GOVERNMENT OF INDIA
        VALID_KEYWORDS = [
            "ELECTION", "ELECTORAL", "IDENTITY",
            "AADHAAR", "UIDAI", "UNIQUE IDENTIFICATION",
            "GOVERNMENT OF INDIA", "INDIA",
            "VOTER", "EPIC",
        ]
        matched = [kw for kw in VALID_KEYWORDS if kw in text]
        print(f"[verify-document] Keywords matched: {matched}")

        if matched:
            return jsonify({"success": True, "message": "Document verified"})

        return jsonify({"success": False, "message": "Could not verify document. Please upload a clear photo of your Voter ID or Aadhaar card."}), 400

    except Exception as e:
        print(f"[verify-document] Unexpected error: {e}")
        return jsonify({"success": False, "message": "Verification failed. Please try again."}), 500


@app.route("/api/debug-face", methods=["POST"])
def debug_face():
    """
    Temporary debug endpoint. POST { "image": "<base64>" } to see exactly
    what the server detects. Remove before production.
    """
    try:
        face_system = get_face_system()
        data = request.get_json()
        b64 = data.get("image") or data.get("faceImage")
        if not b64:
            return jsonify(error="Provide 'image' or 'faceImage' field"), 400

        arr = face_system.decode(b64)
        if arr is None:
            return jsonify(error="Decode failed  bad base64 or corrupt image"), 400

        h, w = arr.shape[:2]
        embedding = face_system.get_embedding(arr)
        found = embedding is not None
        return jsonify({
            "image_size": f"{w}x{h}",
            "shape": list(arr.shape),
            "dtype": str(arr.dtype),
            "embedding_generated": found,
            "result": "FACE FOUND (OpenCV)" if found else "NO FACE  check lighting, angle, distance"
        })
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.route("/api/register-face", methods=["POST"])
@limiter.limit("5 per minute")
def register_face():
    try:
        face_system = get_face_system()
        data = request.get_json()
        raw_uid = data.get("userId")
        raw_phone = data.get("phoneNumber")
        
        if not raw_uid or not raw_phone:
            return jsonify(success=False, message="Missing ID or Phone"), 400
            
        uid = compute_hash(str(raw_uid))
        phone = encrypt_data(str(raw_phone))
        
        images = data.get("faceImages", [])
        if data.get("faceImage"):
            images.insert(0, data.get("faceImage"))

        if not images:
            return jsonify(success=False, message="No image data provided"), 400

        valid_encoding = None
        for i, b64_img in enumerate(images):
            print(f"[INFO] Attempting to process image {i + 1}/{len(images)}...")
            arr = face_system.decode(b64_img)
            if arr is None:
                print(f"  [ERROR] Decode failed for image {i + 1}")
                continue
            enc = face_system.encode(arr)
            if enc is not None:
                print(f"[OK] Success on image {i + 1}!")
                valid_encoding = enc
                break

        if valid_encoding is not None:
            face_system.known[uid] = [valid_encoding]
            face_system.save()

            conn = get_db()
            db_execute(conn,
                """
                INSERT INTO users (user_id_hash, phone_hash, role, is_verified)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id_hash) DO UPDATE
                SET phone_hash = EXCLUDED.phone_hash, is_verified = EXCLUDED.is_verified
                """,
                (str(uid), str(phone), 'voter', 1)
            )
            conn.commit()
            conn.close()
            return jsonify(success=True, message="Registration successful!")

        return jsonify(success=False, message="Could not detect a clear face in any of the uploaded images."), 400

    except Exception as e:
        print(f"[ERROR] CRITICAL ERROR: {e}")
        conn = get_db()
        security_monitor.log_system_event(
            conn, 
            "FACE_REGISTRATION_FAILURE", 
            f"Error during face registration: {str(e)}", 
            source_ip=request.remote_addr
        )
        conn.close()
        return jsonify(success=False, message="Internal Server error"), 500


@app.route("/api/recognize-face", methods=["POST"])
@limiter.limit("5 per minute")
def recognize_face():
    data = request.json
    raw_uid = data.get("userId")
    img_b64 = data.get("faceImage")

    if not raw_uid or not img_b64:
        return jsonify(success=False, message="Missing ID or Image"), 400

    uid = compute_hash(str(raw_uid))

    face_system = get_face_system()

    if uid not in face_system.known:
        conn = get_db()
        security_monitor.log_system_event(
            conn,
            "LOGIN_FAILURE",
            f"Login attempt for unregistered user (hash: {uid[:8]}...)",
            source_ip=request.remote_addr
        )
        if security_monitor.detect_bruteforce(conn, request.remote_addr):
            security_monitor.log_security_alert(
                conn,
                "BRUTE_FORCE_ATTEMPT",
                f"Multiple failed logins detected from IP {request.remote_addr}",
                affected_table="users"
            )
        conn.close()
        return jsonify(success=False, message="User not registered"), 401

    img_arr = face_system.decode(img_b64)
    enc = face_system.encode(img_arr)

    if enc is None:
        return jsonify(success=False, message="Face not detected in frame"), 401

    from sklearn.metrics.pairwise import cosine_similarity as cos_sim
    stored_embeddings = face_system.known[uid]
    similarities = [cos_sim([stored], [enc])[0][0] for stored in stored_embeddings]
    best_match = max(similarities) if similarities else 0
    print(f"  Best cosine similarity: {best_match:.4f} (threshold: {face_system.SIMILARITY_THRESHOLD})")
    if best_match < face_system.SIMILARITY_THRESHOLD:
        conn = get_db()
        security_monitor.log_system_event(
            conn, 
            "LOGIN_FAILURE", 
            f"Face mismatch for user {uid}. Similarity: {best_match:.4f}", 
            source_ip=request.remote_addr
        )
        if security_monitor.detect_bruteforce(conn, request.remote_addr):
            security_monitor.log_security_alert(
                conn, 
                "BRUTE_FORCE_ATTEMPT", 
                f"Multiple failed logins detected from IP {request.remote_addr}", 
                affected_table="users"
            )
        conn.close()
        return jsonify(success=False, message="Face mismatch. Please try again."), 401

    otp = str(random.randint(100000, 999999))
    encrypted_otp = encrypt_data(otp)
    conn = get_db()
    
    # 1. Fetch user's encrypted phone number to send SMS
    cur = db_execute(conn, "SELECT phone_hash FROM users WHERE user_id_hash=%s", (uid,))
    user_record = cur.fetchone()
    if user_record and user_record['phone_hash']:
        phone_number = decrypt_data(user_record['phone_hash'])
        # 2. Call 2factor.in API to send the OTP
        try:
            api_key = os.environ.get("TWOFACTOR_API_KEY", "b60525fc-e55d-11f0-a6b2-0200cd936042")
            requests.get(f"https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp}", timeout=5)
            print(f"[OK] OTP SMS sent successfully to {phone_number} via 2factor.in")
        except Exception as e:
            print(f"[ERROR] Failed to send SMS via 2factor.in: {e}")

    db_execute(conn, "UPDATE users SET otp=%s, otp_time=%s WHERE user_id_hash=%s", (encrypted_otp, int(time.time()), uid))
    conn.commit()
    conn.close()

    print(f"[OK] Recognition Success for {uid}. OTP Generated.", flush=True)

    response_data = {"success": True, "userIdHash": uid}
    return jsonify(response_data)


@app.route("/api/verify-otp", methods=["POST"])
@limiter.limit("5 per minute")
def verify_otp():
    data = request.json
    uid, otp = data["userIdHash"], str(data["otp"])
    conn = get_db()
    cur = db_execute(conn, "SELECT otp, otp_time, role FROM users WHERE user_id_hash=%s", (uid,))
    row = cur.fetchone()

    if not row:
        security_monitor.log_system_event(
            conn, 
            "OTP_FAILURE", 
            f"Invalid OTP attempt: User {uid} not found", 
            source_ip=request.remote_addr
        )
        conn.close()
        return jsonify(success=False, message="Invalid/Expired OTP"), 401

    decrypted_otp = decrypt_data(row['otp'])
    if decrypted_otp != otp or (time.time() - int(row['otp_time']) > OTP_EXPIRY_SECONDS):
        security_monitor.log_system_event(
            conn, 
            "OTP_FAILURE", 
            f"Invalid or expired OTP attempt for user {uid}", 
            source_ip=request.remote_addr
        )
        conn.close()
        return jsonify(success=False, message="Invalid/Expired OTP"), 401

    token = pyjwt.encode({
        "userId": uid, "role": row['role'], "exp": int(time.time()) + 3600
    }, JWT_SECRET, algorithm="HS256")

    role = row['role']
    conn.close()
    return jsonify(success=True, token=token, role=role)


# =======================
# VOTING ROUTES (EPIC 2)
# =======================

@app.route("/api/elections", methods=["GET"])
def get_all_elections():
    conn = get_db()
    now = int(time.time())

    db_execute(conn, """
        UPDATE elections 
        SET status = 'CLOSED' 
        WHERE status = 'ACTIVE' AND end_time < %s
    """, (now,))
    conn.commit()

    cur = db_execute(conn, """
        SELECT e.*, 
        (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count 
        FROM elections e
        ORDER BY created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()

    data = []
    for row in rows:
        item = dict(row)
        data.append({
            "election_id": str(item.get('election_id', '')),
            "title": item.get('title', 'Untitled'),
            "status": item.get('status'),
            "start_time": item.get('start_time', 0),
            "end_time": item.get('end_time', 0),
            "candidate_count": int(item.get('candidate_count', 0))
        })
    return jsonify(data)


@app.route("/api/voter/cast-vote", methods=["POST", "OPTIONS"])
@roles_required(['voter'])
def cast_vote():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    eid = data.get("election_id")
    cid = data.get("candidate_id")
    salt_pin = data.get("pin")
    voter_id = request.voter.get("userId")

    conn = get_db()
    now = int(time.time())

    try:
        cur = db_execute(conn,
            "SELECT status, start_time, end_time FROM elections WHERE election_id = %s",
            (eid,)
        )
        election = cur.fetchone()

        if not election:
            return jsonify(success=False, message="Election not found"), 404

        is_too_early = now < (election['start_time'] - 86400)
        is_too_late = now > (election['end_time'] + 86400)
        is_manually_disabled = election['status'] != 'ACTIVE'

        if is_too_late:
            return jsonify(success=False, message="Election has ended"), 403
        if is_too_early:
            return jsonify(success=False, message="Election has not started yet"), 403
        if is_manually_disabled:
            return jsonify(success=False, message="Election is currently disabled"), 403

        cur = db_execute(conn,
            "SELECT has_voted FROM election_voters WHERE election_id=%s AND user_id_hash=%s",
            (eid, voter_id)
        )
        voter_check = cur.fetchone()

        if voter_check and voter_check['has_voted']:
            security_monitor.log_security_alert(
                conn, 
                "DUPLICATE_VOTE_ATTEMPT", 
                f"User {voter_id} attempted to vote twice in election {eid}", 
                affected_table="votes"
            )
            return jsonify(success=False, message="Already voted"), 403

        cur = db_execute(conn, "SELECT block_hash FROM votes ORDER BY timestamp DESC LIMIT 1")
        last_v = cur.fetchone()
        prev_h = last_v['block_hash'] if last_v else "0"

        vid = str(uuid.uuid4())
        ts = now
        curr_h = compute_hash(f"{vid}{eid}{cid}{ts}{prev_h}{salt_pin}")

        seal_payload = f"{vid}|{eid}|{cid}|{ts}|{curr_h}"
        integrity_sig = hmac.new(DB_INTEGRITY_KEY, seal_payload.encode(), hashlib.sha256).hexdigest()

        db_execute(conn, """
            INSERT INTO votes (
                vote_id, election_id, candidate_id, timestamp, 
                previous_hash, block_hash, integrity_signature
            ) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (vid, eid, cid, ts, prev_h, curr_h, integrity_sig))

        db_execute(conn,
            "UPDATE election_voters SET has_voted = 1 WHERE election_id=%s AND user_id_hash=%s",
            (eid, voter_id)
        )

        conn.commit()

        receipt = compute_hash(f"{vid}{salt_pin}")
        return jsonify(
            success=True,
            receipt=receipt,
            message="Vote cast and sealed successfully"
        )

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Vote Error: {str(e)}")
        return jsonify(success=False, message="Internal security error"), 500
    finally:
        conn.close()


# =======================
# ADMIN ROUTES (EPIC 3)
# =======================

@app.route("/api/admin/elections", methods=["GET", "POST", "OPTIONS"])
def admin_elections_handler():
    if request.method == "OPTIONS":
        return "", 200

    conn = get_db()

    if request.method == "POST":
        data = request.json
        eid = str(uuid.uuid4())
        db_execute(conn,
            "INSERT INTO elections (election_id, title, description, start_time, end_time, status, created_by, created_at) VALUES (%s, %s, %s, %s, %s, 'ACTIVE', 'admin', %s)",
            (eid, data["title"], data["description"], data["start_time"], data["end_time"], int(time.time())))
        conn.commit()
        conn.close()
        return jsonify(success=True)

    cur = db_execute(conn, """
        SELECT e.*, 
        (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count 
        FROM elections e
        ORDER BY created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()

    data = []
    for row in rows:
        d = dict(row)
        d['candidate_count'] = int(d.get('candidate_count', 0))
        data.append(d)
    return jsonify(data)

@app.route("/api/admin/elections/<eid>", methods=["DELETE", "OPTIONS"])
def admin_delete_election(eid):
    """Delete an election if it is in DRAFT status"""
    if request.method == "OPTIONS":
        return "", 200

    conn = get_db()
    try:
        cur = db_execute(conn, "SELECT status FROM elections WHERE election_id = %s", (eid,))
        election = cur.fetchone()

        if not election:
            return jsonify(success=False, message="Election not found"), 404

        if election['status'] != 'DRAFT':
            return jsonify(success=False, message="Only DRAFT elections can be deleted. This election is locked."), 400

        # Delete associated dependencies first (Candidates & Voters)
        db_execute(conn, "DELETE FROM candidates WHERE election_id = %s", (eid,))
        db_execute(conn, "DELETE FROM election_voters WHERE election_id = %s", (eid,))
        
        # Delete election
        db_execute(conn, "DELETE FROM elections WHERE election_id = %s", (eid,))
        
        conn.commit()
        return jsonify(success=True, message="Election deleted successfully")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Deleting Election: {e}")
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()


@app.route("/api/admin/setup-election", methods=["POST", "OPTIONS"])
def admin_setup_election():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify(success=False, message="No data received"), 400

        print(f"DEBUG: Received payload -> {data}")

        title = data.get("title")
        description = data.get("description", "No description provided")
        start_ts = data.get("start_time")
        end_ts = data.get("end_time")

        if not title or start_ts is None or end_ts is None:
            return jsonify(success=False, message="Title, Start Date, and End Date are required."), 400

        eid = str(uuid.uuid4())
        created_at = int(time.time())
        created_by = "admin_user"

        conn = get_db()
        db_execute(conn, """
            INSERT INTO elections (
                election_id, title, description, start_time, end_time, 
                status, created_by, created_at
            ) VALUES (%s, %s, %s, %s, %s, 'DRAFT', %s, %s)
        """, (eid, title, description, int(start_ts), int(end_ts), created_by, created_at))

        conn.commit()
        conn.close()

        print(f"[OK] Success! Election {eid} saved to Database.")
        return jsonify(success=True, election_id=eid), 201

    except Exception as e:
        print(f"[ERROR] DATABASE ERROR: {e}")
        return jsonify(success=False, message=f"Internal Server Error: {str(e)}"), 500


@app.route("/api/admin/login", methods=["POST", "OPTIONS"])
def admin_login():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    if data.get("username") == "admin" and data.get("password") == "admin123":
        token = create_access_token(
            identity="admin_root",
            additional_claims={
                "role": "admin",
                "name": "Administrator"
            }
        )
        return jsonify({"success": True, "token": token, "role": "admin"}), 200

    return jsonify({"success": False, "message": "Invalid credentials"}), 401


@app.route("/api/security-status", methods=["GET"])
def get_security_status():
    """GET /security-status: Returns the system health and threat level."""
    conn = get_db()
    try:
        threat_level = security_monitor.get_threat_level(conn)
        status = "secure" if threat_level == "low" else "monitored"
        if threat_level == "high":
            status = "alerted"
            
        recent_events = security_monitor.get_recent_security_events(conn)
        
        return jsonify({
            "system_status": status,
            "threat_level": threat_level,
            "recent_security_events": recent_events
        }), 200
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()


@app.route("/api/admin/elections/<eid>/status", methods=["PATCH"])
def toggle_election(eid):
    """US3.6: Emergency pause/close control."""
    status = request.json.get("status")
    conn = get_db()
    db_execute(conn, "UPDATE elections SET status=%s WHERE election_id=%s", (status, eid))
    conn.commit()
    conn.close()
    return jsonify(success=True)


@app.route("/api/admin/election-status", methods=["PATCH", "OPTIONS"])
def update_election_status():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    election_id = data.get("electionId")
    next_status = data.get("status")

    try:
        conn = get_db()

        if next_status == "ACTIVE":
            cur = db_execute(conn,
                "SELECT COUNT(*) as cnt FROM candidates WHERE election_id = %s", (election_id,)
            )
            count_row = cur.fetchone()
            if count_row['cnt'] < 2:
                conn.close()
                return jsonify(success=False, message="Add at least 2 candidates before starting."), 400

        cur = db_execute(conn,
            "UPDATE elections SET status = %s WHERE election_id = %s",
            (next_status, election_id)
        )
        conn.commit()

        if cur.rowcount == 0:
            conn.close()
            return jsonify(success=False, message="Election not found"), 404

        conn.close()
        return jsonify(success=True, message=f"Election is now {next_status}")
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()


@app.route("/api/admin/add-candidate", methods=["POST", "OPTIONS"])
def add_candidate():
    if request.method == "OPTIONS":
        return "", 200
    data = request.json
    eid, name, party = data.get("electionId"), data.get("name"), data.get("party")

    try:
        conn = get_db()
        cid = str(uuid.uuid4())
        db_execute(conn,
            "INSERT INTO candidates (candidate_id, election_id, name, party) VALUES (%s, %s, %s, %s)",
            (cid, eid, name, party)
        )
        conn.commit()
        conn.close()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500


@app.route("/api/admin/register-voters", methods=["POST", "OPTIONS"])
def register_voters():
    """US3.4: Authorize specific voters for an election."""
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    eid = data.get("electionId")
    voter_hashes = data.get("voterHashes")

    if not eid or not voter_hashes:
        return jsonify(success=False, message="Missing electionId or voter list"), 400

    try:
        conn = get_db()
        for v_hash in voter_hashes:
            db_execute(conn, """
                INSERT INTO election_voters (election_id, user_id_hash, has_voted) 
                VALUES (%s, %s, 0)
                ON CONFLICT (election_id, user_id_hash) DO NOTHING
            """, (eid, v_hash))
        conn.commit()
        return jsonify(success=True, message=f"Authorized {len(voter_hashes)} voters.")
    except Exception as e:
        print(f"[ERROR] Voter Registration Error: {e}")
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()


@app.route("/api/users", methods=["GET", "OPTIONS"])
def get_users():
    """US3.4: Fetch all registered users for the Admin to whitelist."""
    if request.method == "OPTIONS":
        return "", 200

    try:
        conn = get_db()
        cur = db_execute(conn, """
            SELECT user_id_hash, phone_hash, role, is_verified 
            FROM users 
            WHERE role = 'voter'
        """)
        rows = cur.fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(f"[ERROR] Error fetching users: {e}")
        return jsonify(success=False, message=str(e)), 500


@app.route("/api/voter/elections/<eid>/candidates", methods=["GET"])
def get_election_candidates(eid):
    conn = get_db()
    cur = db_execute(conn,
        "SELECT candidate_id, name, party FROM candidates WHERE election_id = %s",
        (eid,)
    )
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


@app.route("/api/voter/elections", methods=["GET"])
@voter_required
def get_voter_available_elections():
    try:
        voter_id = request.voter.get("userId")
        conn = get_db()

        query = """
            SELECT e.election_id, e.title, e.description, e.status, 
                   e.start_time, e.end_time 
            FROM elections e
            JOIN election_voters ev ON e.election_id = ev.election_id
            WHERE ev.user_id_hash = %s AND ev.has_voted = 0
        """

        cur = db_execute(conn, query, (voter_id,))
        elections = cur.fetchall()
        conn.close()

        return jsonify([dict(row) for row in elections]), 200

    except Exception as e:
        print(f"[ERROR] SERVER CRASH: {str(e)}")
        return jsonify(success=False, message="Internal Server Error"), 500


# =======================
# OBSERVER / RESULTS ROUTES (EPIC 4)
# =======================

@app.route("/api/observer/results/<eid>", methods=["GET"])
def get_public_results(eid):
    """US 4.1 & 4.5: Public Results with Publication Control and Integrity Verification."""
    conn = get_db()
    try:
        cur = db_execute(conn,
            "SELECT status, results_published FROM elections WHERE election_id = %s",
            (eid,)
        )
        election = cur.fetchone()

        if not election:
            return jsonify(success=False, message="Election not found."), 404

        if election['results_published'] == 0:
            return jsonify({
                "success": False,
                "status": election['status'],
                "message": "Results are currently hidden. Waiting for Admin to certify and publish."
            }), 403

        cur = db_execute(conn, "SELECT * FROM votes WHERE election_id = %s", (eid,))
        votes = cur.fetchall()
        cur2 = db_execute(conn, "SELECT candidate_id, name FROM candidates WHERE election_id = %s", (eid,))
        candidates = cur2.fetchall()
        candidate_map = {c['candidate_id']: c['name'] for c in candidates}

        results = {name: 0 for name in candidate_map.values()}
        verified_count = 0
        tampered_count = 0
        tampered_ids = []

        for v in votes:
            payload = f"{v['vote_id']}|{v['election_id']}|{v['candidate_id']}|{v['timestamp']}|{v['block_hash']}"
            expected_sig = hmac.new(DB_INTEGRITY_KEY, payload.encode(), hashlib.sha256).hexdigest()

            if expected_sig == v['integrity_signature']:
                c_name = candidate_map.get(v['candidate_id'], "Unknown Candidate")
                results[c_name] += 1
                verified_count += 1
            else:
                tampered_count += 1
                tampered_ids.append(v['vote_id'])
                security_monitor.log_security_alert(
                    conn, 
                    "TAMPERING_DETECTED", 
                    f"Integrity failure for vote {v['vote_id']} during results fetch", 
                    affected_table="votes"
                )

        if verified_count < 3 and verified_count > 0:
            return jsonify({
                "success": True,
                "status": "VOTING_IN_PROGRESS",
                "message": "Results hidden for anonymity until 3+ votes are cast.",
                "total_cast": verified_count
            })

        return jsonify({
            "success": True,
            "election_id": eid,
            "results": results,
            "last_audited_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "audit_report": {
                "summary": "Live cryptographic audit successful." if tampered_count == 0 else "WARNING: Tampering detected.",
                "total_ballots_scanned": len(votes),
                "integrity_verified": verified_count,
                "tampering_detected": tampered_count,
                "status": "SECURE" if tampered_count == 0 else "COMPROMISED"
            }
        })

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()


@app.route("/api/public/audit-trail", methods=["GET"])
def get_public_audit_trail():
    """US 4.4: Allows observers to see security events (but not private data)."""
    conn = get_db()
    cur = db_execute(conn, """
        SELECT action, table_name, created_at 
        FROM audit_log 
        ORDER BY created_at DESC 
        LIMIT 50
    """)
    logs = cur.fetchall()
    conn.close()
    return jsonify([dict(log) for log in logs])


@app.route("/api/public/elections", methods=["GET"])
def get_public_elections():
    """Public endpoint to fetch all elections and their statuses for the observer portal."""
    try:
        conn = get_db()
        # Only fetch safe, public-facing columns. Exclude internal hashes or private fields.
        cur = db_execute(conn, """
            SELECT election_id, title, description, start_time, end_time, status, results_published
            FROM elections
            ORDER BY start_time DESC
        """)
        elections = cur.fetchall()
        
        # for each election, let's also attach candidate counts since the public portal needs it
        for e in elections:
            cur_c = db_execute(conn, "SELECT COUNT(*) as count FROM candidates WHERE election_id = %s", (e['election_id'],))
            row = cur_c.fetchone()
            e['candidate_count'] = row['count'] if row else 0

        conn.close()
        return jsonify(success=True, data=[dict(r) for r in elections]), 200
    except Exception as e:
        print(f"[ERROR] server crash fetching public elections: {e}")
        return jsonify(success=False, message="Internal Server Error"), 500


@app.route("/api/voter/verify-receipt", methods=["POST"])
def verify_receipt():
    """US 2.5: Voter verifies their specific ballot exists and is untampered."""
    data = request.json
    vote_id = data.get("vote_id")
    pin = data.get("pin")

    conn = get_db()
    try:
        cur = db_execute(conn, "SELECT * FROM votes WHERE vote_id = %s", (vote_id,))
        vote = cur.fetchone()

        if not vote:
            return jsonify(success=False, message="Receipt not found"), 404

        payload = f"{vote['vote_id']}|{vote['election_id']}|{vote['candidate_id']}|{vote['timestamp']}|{vote['block_hash']}"
        expected_sig = hmac.new(DB_INTEGRITY_KEY, payload.encode(), hashlib.sha256).hexdigest()

        is_secure = (expected_sig == vote['integrity_signature'])

        return jsonify({
            "success": True,
            "status": "VERIFIED" if is_secure else "TAMPERED",
            "timestamp": vote['timestamp'],
            "election_id": vote['election_id'],
            "message": "Your vote is cryptographically secured in the ledger." if is_secure else "Warning: Integrity mismatch."
        })
    finally:
        conn.close()


@app.route("/api/admin/election-toggle", methods=["POST"])
def toggle_status():
    """US 3.6: Admin control to open/close/archive elections."""
    data = request.json
    eid = data.get("election_id")
    new_status = data.get("status")

    conn = get_db()
    db_execute(conn, "UPDATE elections SET status = %s WHERE election_id = %s", (new_status, eid))
    db_execute(conn, "INSERT INTO system_logs (event_type, details, admin_id) VALUES (%s, %s, %s)",
                 ('STATUS_CHANGE', f"Election {eid} moved to {new_status}", 'ADMIN_01'))
    conn.commit()
    conn.close()
    return jsonify(success=True, message=f"Election is now {new_status}")


@app.route('/api/admin/stats', methods=['GET'])
@token_required
def get_admin_stats():
    conn = get_db()
    cur = db_execute(conn, "SELECT COUNT(*) as cnt FROM users WHERE role='voter'")
    row = cur.fetchone()
    voter_count = row['cnt']
    conn.close()
    return jsonify({
        "totalVoters": voter_count,
        "verifiedBlocks": 842,
        "activeElections": 3,
        "systemStatus": "Optimal"
    })


@app.route("/api/admin/backup", methods=["POST"])
# @roles_required(['admin'])
def trigger_backup():
    """ Triggers a manual database backup."""
    try:
        # Run the backup script
        result = subprocess.run(
            ["bash", "/app/backup_database.sh"], 
            capture_output=True, 
            text=True
        )
        
        conn = get_db()
        if result.returncode == 0:
            security_monitor.log_system_event(
                conn, 
                "ADMIN_BACKUP_TRIGGERED", 
                "Manual backup triggered and completed successfully by Admin",
                admin_id=getattr(request, 'user', {}).get('userId', 'admin')
            )
            conn.close()
            return jsonify(success=True, message="Backup completed successfully", output=result.stdout), 200
        else:
            security_monitor.log_system_event(
                conn, 
                "ADMIN_BACKUP_FAILED", 
                f"Manual backup failed: {result.stderr}",
                admin_id=getattr(request, 'user', {}).get('userId', 'admin')
            )
            conn.close()
            return jsonify(success=False, message="Backup failed", error=result.stderr), 500
            
    except Exception as e:
        return jsonify(success=False, message=f"Internal error during backup: {str(e)}"), 500


@app.route('/api/admin/election/<eid>/report/pdf', methods=['GET'])
@roles_required(['admin'])
def export_election_report_pdf(eid):
    user_data = getattr(request, 'user', {})
    admin_name = user_data.get('name', 'System Administrator')

    try:
        conn = get_db()
        cur = db_execute(conn, "SELECT title FROM elections WHERE election_id = %s", (eid,))
        election = cur.fetchone()
        title = election['title'] if (election and election['title']) else "Official Election Report"

        audit_data = perform_live_audit(eid)
        if not audit_data:
            return jsonify(success=False, message="Audit data unavailable"), 404

        results, total_votes, audit_status = audit_data
        conn.close()

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.setFont("Helvetica-Bold", 18)
        p.drawString(100, 750, "SECURE VOTING SYSTEM - AUDIT CERTIFICATE")
        p.line(100, 745, 500, 745)

        p.setFont("Helvetica", 12)
        p.drawString(100, 710, f"Election: {title}")
        p.drawString(100, 695, f"Prepared by: {admin_name}")
        p.drawString(100, 680, f"Election ID: {eid}")

        if audit_status == "SUCCESS":
            p.setFillColor(colors.green)
            p.drawString(100, 650, "INTEGRITY CHECK: PASSED (CHAINED LEDGER)")
        else:
            p.setFillColor(colors.red)
            p.drawString(100, 650, f"INTEGRITY CHECK: {audit_status}")

        p.setFillColor(colors.black)
        p.drawString(100, 620, f"Total Ballots Verified: {total_votes}")

        y = 590
        p.setFont("Helvetica-Bold", 12)
        p.drawString(120, y + 20, "Final Tally:")
        p.setFont("Helvetica", 12)

        if not results:
            p.drawString(140, y, "No votes found for this election.")
        else:
            for res in results:
                c_name = res.get('candidate_name', 'Unknown Candidate')
                c_votes = res.get('votes', 0)
                p.drawString(140, y, f" {c_name}: {c_votes} votes")
                y -= 20

        p.showPage()
        p.save()
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"Audit_Certificate_{eid[:8]}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"ERROR DURING PDF GENERATION: {str(e)}")
        return jsonify(success=False, message=f"Internal PDF Error: {str(e)}"), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)