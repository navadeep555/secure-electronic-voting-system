import os
import base64
import numpy as np
import face_recognition
import pickle
import random
import sqlite3
import easyocr
import difflib
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- 1. Security & Hashing ---
def hash_data(data):
    """Protects PII by converting it to a SHA-256 hash (US 1.5)"""
    if not data: return None
    return hashlib.sha256(data.encode()).hexdigest()

# --- 2. Database & File System Setup ---
os.makedirs("encodings", exist_ok=True)

def init_db():
    conn = sqlite3.connect('voting_system.db')
    c = conn.cursor()
    # Identity Table: Decoupled from choice
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (user_id_hash TEXT PRIMARY KEY, phone_hash TEXT, has_voted INTEGER DEFAULT 0, otp TEXT)''')
    # Results Table: Anonymous tally
    c.execute('''CREATE TABLE IF NOT EXISTS results 
                 (candidate_id TEXT PRIMARY KEY, candidate_name TEXT, vote_count INTEGER DEFAULT 0)''')
    
    # Seed candidates for testing
    c.execute("SELECT COUNT(*) FROM results")
    if c.fetchone()[0] == 0:
        candidates = [('1', 'Sarah Mitchell'), ('2', 'James Anderson'), ('3', 'Maria Santos'), ('4', 'Robert Chen')]
        c.executemany("INSERT INTO results VALUES (?, ?, 0)", candidates)
    conn.commit()
    conn.close()

init_db()
reader = easyocr.Reader(['en']) 

# --- 3. Biometric Engine ---
class FaceRecognitionSystem:
    def __init__(self):
        self.known_encodings = {}  
        self.load_encodings()
    
    def load_encodings(self):
        try:
            if os.path.exists("encodings/face_encodings.pkl"):
                with open("encodings/face_encodings.pkl", "rb") as f:
                    self.known_encodings = pickle.load(f)
        except Exception as e:
            print(f"Error loading encodings: {e}")
    
    def save_encodings(self):
        with open("encodings/face_encodings.pkl", "wb") as f:
            pickle.dump(self.known_encodings, f)

    def base64_to_image(self, base64_string):
        try:
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
            img_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(img_data))
            return np.array(img.convert('RGB'))
        except Exception: 
            return None

    def get_face_encoding(self, image_array):
        """Extract face encoding using HOG model for speed on standard hardware"""
        try:
            face_locations = face_recognition.face_locations(image_array, model="hog")
            if not face_locations:
                return None, None
            encodings = face_recognition.face_encodings(image_array, face_locations)
            return (encodings[0], face_locations[0]) if encodings else (None, None)
        except Exception as e:
            print(f"Error encoding face: {e}")
            return None, None

face_system = FaceRecognitionSystem()

# --- 4. API Endpoints ---

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    """OCR Document verification with Fuzzy Name matching (US 1.2)"""
    try:
        data = request.json
        img_b64 = data.get("documentImage")
        expected_name = data.get("fullName", "").upper().strip()

        img_arr = face_system.base64_to_image(img_b64)
        ocr_result = reader.readtext(img_arr)
        extracted_text = " ".join([text[1] for text in ocr_result]).upper()

        # Check for Voter ID Keywords
        keywords = ["ELECTION", "VOTER", "INDIA", "COMMISSION", "IDENTITY"]
        is_voter_id = any(k in extracted_text for k in keywords)
        
        # Fuzzy match name parts
        name_parts = [p for p in expected_name.split() if len(p) > 2]
        name_match = any(difflib.get_close_matches(p, extracted_text.split(), n=1, cutoff=0.6) or p in extracted_text for p in name_parts)

        if not is_voter_id:
            return jsonify({"success": False, "message": "Document not recognized as Voter ID"}), 400
        if not name_match:
            return jsonify({"success": False, "message": "Name mismatch on document"}), 400

        return jsonify({"success": True, "message": "Document Verified!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/register-face", methods=["POST"])
def register_face():
    """Register user with 4-stage biometric images (US 1.1)"""
    try:
        data = request.json
        user_id_hash = hash_data(data.get("userId")) 
        phone_hash = hash_data(data.get("phoneNumber", "0000000000"))
        face_images = data.get("faceImages", []) # Expecting list of 4 base64 images
        
        encodings = []
        for img_b64 in face_images:
            img_arr = face_system.base64_to_image(img_b64)
            if img_arr is not None:
                enc, _ = face_system.get_face_encoding(img_arr)
                if enc is not None: encodings.append(enc)

        if len(encodings) < 2:
            return jsonify({"success": False, "message": f"Need at least 2 valid angles. Got {len(encodings)}"}), 400

        face_system.known_encodings[user_id_hash] = encodings
        face_system.save_encodings()
        
        conn = sqlite3.connect('voting_system.db')
        conn.execute("INSERT OR REPLACE INTO users (user_id_hash, phone_hash, has_voted) VALUES (?, ?, 0)", 
                     (user_id_hash, phone_hash))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Registration successful"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    """Login with face match and Duplicate Check (US 1.4)"""
    data = request.json
    img_array = face_system.base64_to_image(data.get("faceImage"))
    test_encoding, _ = face_system.get_face_encoding(img_array)
    
    if test_encoding is None:
        return jsonify({"success": False, "message": "No face detected"}), 400

    best_match_hash = None
    min_dist = 0.6 # Tolerance threshold
    
    for uid_hash, user_encodings in face_system.known_encodings.items():
        distances = face_recognition.face_distance(user_encodings, test_encoding)
        if np.min(distances) < min_dist:
            min_dist = np.min(distances)
            best_match_hash = uid_hash

    if best_match_hash:
        conn = sqlite3.connect('voting_system.db')
        user = conn.execute("SELECT has_voted FROM users WHERE user_id_hash=?", (best_match_hash,)).fetchone()
        
        # US 1.4: Prevent Double Voting
        if user and user[0] == 1:
            conn.close()
            return jsonify({"success": False, "message": "Already voted"}), 403
            
        otp = str(random.randint(100000, 999999))
        conn.execute("UPDATE users SET otp=? WHERE user_id_hash=?", (otp, best_match_hash))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "userIdHash": best_match_hash, "debug_otp": otp})
    
    return jsonify({"success": False, "message": "Face not recognized"}), 401

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    uid_hash = data.get("userIdHash")
    entered_otp = str(data.get("otp"))

    conn = sqlite3.connect('voting_system.db')
    db_res = conn.execute("SELECT otp FROM users WHERE user_id_hash=?", (uid_hash,)).fetchone()
    conn.close()

    if db_res and db_res[0] == entered_otp:
        return jsonify({"success": True, "message": "Access Granted"})
    return jsonify({"success": False, "message": "Invalid OTP"}), 401

@app.route("/api/cast-vote", methods=["POST"])
def cast_vote():
    """Atomic transaction to mark user as voted and increment tally (US 1.6)"""
    data = request.json
    uid_hash = data.get("userIdHash")
    candidate_id = data.get("candidateId")

    conn = sqlite3.connect('voting_system.db')
    c = conn.cursor()
    try:
        # Mark voter as done
        c.execute("UPDATE users SET has_voted = 1, otp = NULL WHERE user_id_hash = ? AND has_voted = 0", (uid_hash,))
        if c.rowcount == 0:
            return jsonify({"success": False, "message": "Vote already recorded"}), 403

        # Increment anonymous tally
        c.execute("UPDATE results SET vote_count = vote_count + 1 WHERE candidate_id = ?", (candidate_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Vote cast anonymously"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/admin/results", methods=["GET"])
def get_results():
    conn = sqlite3.connect('voting_system.db')
    rows = conn.execute("SELECT * FROM results").fetchall()
    conn.close()
    return jsonify([{"id": r[0], "name": r[1], "votes": r[2]} for r in rows])

if __name__ == "__main__":
    app.run(debug=True, port=5001, host="0.0.0.0")