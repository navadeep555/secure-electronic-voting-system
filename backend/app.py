import os
import base64
import numpy as np
import face_recognition
import pickle
import random
import sqlite3
import easyocr
import hashlib
import time
import jwt
import datetime
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

# Ensure auth.py exists in the same directory
from auth import voter_required   

# =======================
# APP SETUP
# =======================

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:8080"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "voting_system.db")

JWT_SECRET = os.getenv("JWT_SECRET", "your_shared_secret")
OTP_EXPIRY_SECONDS = 120

print("✅ Flask Secret Loaded")

# =======================
# UTILS
# =======================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def compute_hash(data_string):
    """US2.4: Generates SHA-256 integrity hashes for the ballot chain."""
    return hashlib.sha256(data_string.encode()).hexdigest()

# =======================
# DATABASE INIT
# =======================

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id_hash TEXT PRIMARY KEY,
            phone_hash TEXT,
            role TEXT CHECK(role IN ('admin','voter')) NOT NULL,
            otp TEXT,
            otp_time INTEGER,
            is_verified INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS elections (
            election_id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            start_time INTEGER,
            end_time INTEGER,
            status TEXT CHECK(status IN ('DRAFT','ACTIVE', 'PAUSED', 'CLOSED')),
            created_by TEXT,
            created_at INTEGER
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

    # US 1.6 & 2.1: This table tracks WHO has voted without linking it to the ballot
    c.execute("""
        CREATE TABLE IF NOT EXISTS election_voters (
            election_id TEXT,
            user_id_hash TEXT,
            has_voted INTEGER DEFAULT 0,
            PRIMARY KEY (election_id, user_id_hash)
        )
    """)

    # US 2.4 & 2.6: Blockchain-style ledger. Note: 'voter_id' is REMOVED for anonymity.
    c.execute("""
        CREATE TABLE IF NOT EXISTS votes (
            vote_id TEXT PRIMARY KEY,
            election_id TEXT,
            candidate_id TEXT, 
            timestamp INTEGER,
            previous_hash TEXT,
            block_hash TEXT
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database Initialized with Secure Ledger")

init_db()

# =======================
# FACE RECOGNITION ENGINE
# =======================

reader = easyocr.Reader(["en"], gpu=False)

class FaceRecognitionSystem:
    def __init__(self):
        self.path = os.path.join("encodings", "face_encodings.pkl")
        self.known = {}
        self.load()

    def load(self):
        if os.path.exists(self.path):
            with open(self.path, "rb") as f:
                self.known = pickle.load(f)

    def save(self):
        os.makedirs("encodings", exist_ok=True)
        with open(self.path, "wb") as f:
            pickle.dump(self.known, f)

    def base64_to_image(self, b64):
        try:
            # 1. Handle Data URI prefix
            if "," in b64:
                b64 = b64.split(",")[1]
            
            # 2. Fix potential character corruption
            b64 = b64.replace(" ", "+").strip()

            # 3. Fix padding
            missing_padding = len(b64) % 4
            if missing_padding:
                b64 += '=' * (4 - missing_padding)

            img_data = base64.b64decode(b64)
            return Image.open(BytesIO(img_data)).convert("RGB")
        except Exception as e:
            print(f"❌ Critical Decoding Failure: {e}")
            return None

    def decode(self, b64):
        # We wrap this in a try/except to catch the ValueError from above
        try:
            img = self.base64_to_image(b64)
            return np.array(img)
        except:
            return None

    def encode(self, img_array):
        if img_array is None: return None
        locs = face_recognition.face_locations(img_array)
        encs = face_recognition.face_encodings(img_array, locs)
        return encs[0] if encs else None

face_system = FaceRecognitionSystem()

# =======================
# USER & AUTH ROUTES (EPIC 1)
# =======================

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    """US1.2: Identity Verification using OCR."""
    try:
        img_b64 = request.json.get("documentImage")
        pil_img = face_system.base64_to_image(img_b64)
        # Convert PIL to numpy for EasyOCR
        img_np = np.array(pil_img)
        ocr_result = reader.readtext(img_np)
        text = " ".join([t[1] for t in ocr_result]).upper()

        # Simple rule-based verification
        if "ELECTION" in text or "INDIA" in text or "IDENTITY" in text:
            return jsonify({"success": True, "message": "Document verified"})

        return jsonify({"success": False, "message": "Invalid Document"}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": "Verification Failed"}), 500

@app.route("/api/register-face", methods=["POST"])
def register_face():
    data = request.json
    uid = data.get("userId")
    phone = data.get("phoneNumber")
    
    # Check for plural (from your TS code) or singular
    face_images = data.get("faceImages")
    face_image_single = data.get("faceImage")

    # US1.1: Logic to extract exactly one image even if the frontend sends a list
    img_data = None
    if face_images and isinstance(face_images, list) and len(face_images) > 0:
        img_data = face_images[0]  # Take the first image only
    elif face_image_single:
        img_data = face_image_single

    if not img_data:
        return jsonify(success=False, message="No face image provided"), 400

    # Clean and Decode
    arr = face_system.decode(img_data)
    if arr is None:
        return jsonify(success=False, message="Invalid image data. Please retry."), 400
        
    enc = face_system.encode(arr)
    if enc is None:
        return jsonify(success=False, message="No face detected. Ensure good lighting."), 400

    # US1.3: Store biometric template
    face_system.known[uid] = [enc]
    face_system.save()

    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO users (user_id_hash, phone_hash, role) VALUES (?, ?, 'voter')",
        (uid, phone)
    )
    conn.commit()
    conn.close()

    return jsonify(success=True, message="Biometric registration successful (1-stage)")

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    data = request.json
    uid, img_b64 = data.get("userId"), data.get("faceImage")
    
    if uid not in face_system.known:
        return jsonify(success=False, message="User not registered"), 401

    img_arr = face_system.decode(img_b64)
    enc = face_system.encode(img_arr)

    if enc is None or min(face_recognition.face_distance(face_system.known[uid], enc)) > 0.6:
        return jsonify(success=False, message="Face mismatch"), 401

    otp = str(random.randint(100000, 999999))
    conn = get_db()
    conn.execute("UPDATE users SET otp=?, otp_time=? WHERE user_id_hash=?", (otp, int(time.time()), uid))
    conn.commit()
    conn.close()
    print(f"OTP for {uid}: {otp}")
    return jsonify(success=True, userIdHash=uid)

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    uid, otp = data["userIdHash"], str(data["otp"])
    conn = get_db()
    row = conn.execute("SELECT otp, otp_time, role FROM users WHERE user_id_hash=?", (uid,)).fetchone()

    if not row or row['otp'] != otp or (time.time() - row['otp_time'] > OTP_EXPIRY_SECONDS):
        return jsonify(success=False, message="Invalid/Expired OTP"), 401

    token = jwt.encode({
        "userId": uid, "role": row['role'], "exp": int(time.time()) + 3600
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify(success=True, token=token, role=row['role'])

# =======================
# VOTING ROUTES (EPIC 2)
# =======================
@app.route("/api/elections", methods=["GET"])
def get_all_elections():
    conn = get_db()
    rows = conn.execute("""
        SELECT e.*, 
        (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count 
        FROM elections e
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    
    # Convert rows to dicts and ensure candidate_count is an actual integer
    data = []
    for row in rows:
        item = dict(row)
        item['candidate_count'] = int(item['candidate_count']) # Force Integer
        data.append(item)
    
    return jsonify(data)


@app.route("/api/voter/cast-vote", methods=["POST", "OPTIONS"])
@voter_required
def cast_vote():
    if request.method == "OPTIONS": return "", 200
    
    data = request.json
    eid = data.get("election_id")
    cid = data.get("candidate_id")
    salt_pin = data.get("pin") # The salt provided by the user
    voter_id = request.voter["userId"]

    conn = get_db()
    
    # 1. DOUBLE VOTING CHECK (Still essential)
    voter_check = conn.execute(
        "SELECT has_voted FROM election_voters WHERE election_id=? AND user_id_hash=?", 
        (eid, voter_id)
    ).fetchone()
    
    if voter_check and voter_check['has_voted']:
        conn.close()
        return jsonify(success=False, message="Already voted"), 403

    # 2. BLOCKCHAIN HASHING WITH SALT
    last_v = conn.execute("SELECT block_hash FROM votes ORDER BY timestamp DESC LIMIT 1").fetchone()
    prev_h = last_v['block_hash'] if last_v else "0"
    
    vid = str(uuid.uuid4())
    ts = int(time.time())
    
    # US2.4: Salted Hash. We add salt_pin to the string before hashing.
    # This makes the block_hash unique and dependent on the voter's private salt.
    curr_h = compute_hash(f"{vid}{eid}{cid}{ts}{prev_h}{salt_pin}")

    try:
        conn.execute("INSERT INTO votes VALUES (?, ?, ?, ?, ?, ?)", 
                     (vid, eid, cid, ts, prev_h, curr_h))
        
        conn.execute("UPDATE election_voters SET has_voted = 1 WHERE election_id=? AND user_id_hash=?", 
                     (eid, voter_id))
        
        conn.commit()
        
        # We return a receipt based on the salted ID
        return jsonify(success=True, receipt=compute_hash(f"{vid}{salt_pin}"))
    finally:
        conn.close()

# =======================
# ADMIN ROUTES (EPIC 3)
# =======================

@app.route("/api/admin/elections", methods=["GET", "POST", "OPTIONS"])
def admin_elections_handler():
    """Handles both fetching list and quick creation."""
    if request.method == "OPTIONS":
        return "", 200
        
    conn = get_db()
    
    # POST: Create a new election
    if request.method == "POST":
        data = request.json
        eid = str(uuid.uuid4())
        conn.execute("INSERT INTO elections VALUES (?, ?, ?, ?, ?, 'ACTIVE', 'admin', ?)", 
                     (eid, data["title"], data["description"], data["start_time"], data["end_time"], int(time.time())))
        conn.commit()
        conn.close()
        return jsonify(success=True)
    
    # GET: Fetch elections WITH the candidate count
    # This ensures {election.candidate_count} is populated in React
    rows = conn.execute("""
        SELECT e.*, 
        (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count 
        FROM elections e
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    
    data = []
    for row in rows:
        d = dict(row)
        d['candidate_count'] = int(d.get('candidate_count', 0)) # Force Integer
        data.append(d)
        
    return jsonify(data)
@app.route("/api/admin/setup-election", methods=["POST", "OPTIONS"])
def admin_setup_election():
    """US3.2: Create and configure new election events."""
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json
    try:
        # Convert date strings from frontend (e.g., "10-02-2026") to timestamps
        # Note: Adjust format '%d-%m-%Y' if your frontend sends 'YYYY-MM-DD'
        start_ts = int(time.mktime(time.strptime(data["startDate"], "%Y-%m-%d")))
        end_ts = int(time.mktime(time.strptime(data["endDate"], "%Y-%m-%d")))
        
        eid = str(uuid.uuid4())
        conn = get_db()
        conn.execute("""
            INSERT INTO elections (election_id, title, description, start_time, end_time, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'DRAFT', ?)
        """, (eid, data["title"], data["description"], start_ts, end_ts, int(time.time())))
        conn.commit()
        conn.close()
        
        return jsonify(success=True, election_id=eid)
    except Exception as e:
        print(f"❌ Election Creation Error: {e}")
        return jsonify(success=False, message=str(e)), 500
    
@app.route("/api/admin/login", methods=["POST", "OPTIONS"])
def admin_login():
    # Handle CORS pre-flight
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # US3.1: Admin Authentication logic
    if username == "admin" and password == "admin123":
        now = int(time.time())
        token = jwt.encode({
            "userId": "admin_root",
            "role": "admin",
            "iat": now,
            "exp": now + 86400  # 24 hour expiry
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({
            "success": True, 
            "token": token, 
            "role": "admin"
        })
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/api/admin/elections/<eid>/status", methods=["PATCH"])
def toggle_election(eid):
    """US3.6: Emergency pause/close control."""
    status = request.json.get("status")
    conn = get_db()
    conn.execute("UPDATE elections SET status=? WHERE election_id=?", (status, eid))
    conn.commit()
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

        # 1. Safety Check: Don't allow ACTIVE status if there are no candidates
        if next_status == "ACTIVE":
            count_row = conn.execute(
                "SELECT COUNT(*) FROM candidates WHERE election_id = ?", (election_id,)
            ).fetchone()
            if count_row[0] < 2:
                return jsonify(success=False, message="Add at least 2 candidates before starting."), 400

        # 2. Perform the Update
        cursor = conn.execute(
            "UPDATE elections SET status = ? WHERE election_id = ?",
            (next_status, election_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify(success=False, message="Election not found"), 404

        return jsonify(success=True, message=f"Election is now {next_status}")
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    finally:
        conn.close()

@app.route("/api/admin/add-candidate", methods=["POST", "OPTIONS"])
def add_candidate():
    if request.method == "OPTIONS": return "", 200
    data = request.json
    eid, name, party = data.get("electionId"), data.get("name"), data.get("party")
    
    try:
        conn = get_db()
        # Generates a unique ID for the candidate
        cid = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO candidates (candidate_id, election_id, name, party) VALUES (?, ?, ?, ?)",
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
    voter_hashes = data.get("voterHashes") # This is an array of userIdHashes

    if not eid or not voter_hashes:
        return jsonify(success=False, message="Missing electionId or voter list"), 400

    try:
        conn = get_db()
        # INSERT OR IGNORE prevents errors if you accidentally add the same voter twice
        for v_hash in voter_hashes:
            conn.execute("""
                INSERT OR IGNORE INTO election_voters (election_id, user_id_hash, has_voted) 
                VALUES (?, ?, 0)
            """, (eid, v_hash))
            
        conn.commit()
        return jsonify(success=True, message=f"Authorized {len(voter_hashes)} voters.")
    except Exception as e:
        print(f"❌ Voter Registration Error: {e}")
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
        # Fetch users who are registered as 'voter'
        rows = conn.execute("""
            SELECT user_id_hash, phone_hash, role, is_verified 
            FROM users 
            WHERE role = 'voter'
        """).fetchall()
        conn.close()
        
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify(success=False, message=str(e)), 500
    
@app.route("/api/voter/elections/<eid>/candidates", methods=["GET"])
def get_election_candidates(eid):
    conn = get_db()
    rows = conn.execute(
        "SELECT candidate_id, name, party FROM candidates WHERE election_id = ?", 
        (eid,)
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/voter/elections", methods=["GET"])
@voter_required
def get_voter_available_elections():
    try:
        voter_id = request.voter.get("userId") 
        conn = get_db()
        
        # Use start_time and end_time to match your CREATE TABLE statement
        query = """
            SELECT e.election_id, e.title, e.description, e.status, 
                   e.start_time, e.end_time 
            FROM elections e
            JOIN election_voters ev ON e.election_id = ev.election_id
            WHERE ev.user_id_hash = ? AND ev.has_voted = 0
        """
        
        elections = conn.execute(query, (voter_id,)).fetchall()
        conn.close()
        
        return jsonify([dict(row) for row in elections]), 200

    except Exception as e:
        print(f"❌ SERVER CRASH: {str(e)}") 
        return jsonify(success=False, message="Internal Server Error"), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)