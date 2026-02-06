

import os
import base64
import numpy as np
import face_recognition
import pickle
import random
import sqlite3
import easyocr
import hashlib
import traceback
import time

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_PATH = "voting_system.db"
OTP_EXPIRY_SECONDS = 120   # 2 minutes

# =======================
# DATABASE & UTILITIES
# =======================

def hash_data(data):
    if not data:
        return None
    return hashlib.sha256(data.encode()).hexdigest()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id_hash TEXT PRIMARY KEY,
            phone_hash TEXT,
            has_voted INTEGER DEFAULT 0,
            otp TEXT,
            otp_time INTEGER
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS results (
            candidate_id TEXT PRIMARY KEY,
            candidate_name TEXT,
            vote_count INTEGER DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()


init_db()
reader = easyocr.Reader(["en"], gpu=False)

# =======================
# FACE RECOGNITION ENGINE
# =======================

class FaceRecognitionSystem:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.encodings_dir = os.path.join(self.base_dir, "encodings")
        self.encodings_path = os.path.join(self.encodings_dir, "face_encodings.pkl")
        self.known_encodings = {}
        self.load_encodings()

    def load_encodings(self):
        if os.path.exists(self.encodings_path):
            with open(self.encodings_path, "rb") as f:
                self.known_encodings = pickle.load(f)

    def save_encodings(self):
        os.makedirs(self.encodings_dir, exist_ok=True)
        with open(self.encodings_path, "wb") as f:
            pickle.dump(self.known_encodings, f)

    def base64_to_image(self, base64_string):
        try:
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]

            img_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(img_data)).convert("RGB")
            return np.ascontiguousarray(np.array(img))
        except Exception as e:
            print("Image decode error:", e)
            return None

    def get_face_encoding(self, image_array):
        try:
            locations = face_recognition.face_locations(image_array, model="hog")
            if not locations:
                return None
            encodings = face_recognition.face_encodings(image_array, locations)
            return encodings[0] if encodings else None
        except Exception as e:
            print("Encoding error:", e)
            return None


face_system = FaceRecognitionSystem()

# =======================
# HEALTH CHECK
# =======================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "registered_users": len(face_system.known_encodings)
    })


# =======================
# REGISTRATION
# =======================

@app.route("/api/register-face", methods=["POST"])
def register_face():
    try:
        data = request.json
        user_id = data.get("userId")
        face_images = data.get("faceImages", [])

        if not user_id or len(face_images) < 2:
            return jsonify({"success": False, "message": "Invalid registration data"}), 400

        uid_hash = hash_data(user_id)
        phone_hash = hash_data(data.get("phoneNumber"))

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        if cur.execute("SELECT 1 FROM users WHERE user_id_hash=?", (uid_hash,)).fetchone():
            conn.close()
            return jsonify({"success": False, "message": "User already registered"}), 400

        encodings = []
        for img in face_images:
            arr = face_system.base64_to_image(img)
            enc = face_system.get_face_encoding(arr)
            if enc is not None:
                encodings.append(enc)

        if len(encodings) < 2:
            return jsonify({"success": False, "message": "Biometric capture insufficient"}), 400

        face_system.known_encodings[uid_hash] = encodings
        face_system.save_encodings()

        cur.execute(
            "INSERT INTO users (user_id_hash, phone_hash) VALUES (?, ?)",
            (uid_hash, phone_hash)
        )

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Registration successful"})

    except Exception:
        print(traceback.format_exc())
        return jsonify({"success": False, "message": "Registration failed"}), 500


# =======================
# FACE VERIFY + OTP
# =======================

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    print("🔥 recognize-face ROUTE ENTERED")

    data = request.get_json(force=True, silent=True)
    print("📦 DATA:", data)

    return jsonify({
        "success": True,
        "message": "TEST RESPONSE WORKING",
        "debug_otp": "111111"
    }), 200

# =======================
# OTP VERIFICATION
# =======================

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    uid_hash = data.get("userIdHash")
    entered_otp = str(data.get("otp"))

    if not uid_hash or not entered_otp:
        return jsonify({"success": False}), 400

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    row = cur.execute(
        "SELECT otp, otp_time FROM users WHERE user_id_hash=?",
        (uid_hash,)
    ).fetchone()

    if not row:
        conn.close()
        return jsonify({"success": False}), 401

    stored_otp, otp_time = row

    if time.time() - otp_time > OTP_EXPIRY_SECONDS:
        cur.execute(
            "UPDATE users SET otp=NULL, otp_time=NULL WHERE user_id_hash=?",
            (uid_hash,)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": False, "message": "OTP expired"}), 401

    if stored_otp != entered_otp:
        conn.close()
        return jsonify({"success": False}), 401

    cur.execute(
        "UPDATE users SET otp=NULL, otp_time=NULL WHERE user_id_hash=?",
        (uid_hash,)
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True})


# =======================
# DOCUMENT VERIFICATION
# =======================

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    try:
        img_b64 = request.json.get("documentImage")
        img = face_system.base64_to_image(img_b64)
        ocr = reader.readtext(img)
        text = " ".join([t[1] for t in ocr]).upper()

        if "ELECTION" in text or "INDIA" in text:
            return jsonify({"success": True})

        return jsonify({"success": False}), 400

    except Exception:
        return jsonify({"success": False}), 500


# =======================
# APP ENTRY
# =======================

if __name__ == "__main__":
    app.run(debug=True, port=5001)
