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

# --- Security Configuration ---
def hash_data(data):
    if not data: return None
    return hashlib.sha256(data.encode()).hexdigest()

# --- File System & DB Setup ---
os.makedirs("encodings", exist_ok=True)
os.makedirs("face_data", exist_ok=True)

def init_db():
    conn = sqlite3.connect('voting_system.db')
    c = conn.cursor()
    
    # Identity Table (Hashed)
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (user_id_hash TEXT PRIMARY KEY, phone_hash TEXT, has_voted INTEGER DEFAULT 0, otp TEXT)''')
    
    # Results Table (Anonymous Separation)
    c.execute('''CREATE TABLE IF NOT EXISTS results 
                 (candidate_id TEXT PRIMARY KEY, candidate_name TEXT, vote_count INTEGER DEFAULT 0)''')
    
    # Seed candidates if empty
    c.execute("SELECT COUNT(*) FROM results")
    if c.fetchone()[0] == 0:
        candidates = [
            ('1', 'Sarah Mitchell'), 
            ('2', 'James Anderson'), 
            ('3', 'Maria Santos'), 
            ('4', 'Robert Chen')
        ]
        c.executemany("INSERT INTO results VALUES (?, ?, 0)", candidates)
        
    conn.commit()
    conn.close()

init_db()

# Initialize OCR Reader
reader = easyocr.Reader(['en']) 

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
        # Using model="hog" for speed/working compatibility
        face_locations = face_recognition.face_locations(image_array, model="hog")
        if not face_locations: return None
        encodings = face_recognition.face_encodings(image_array, face_locations)
        return encodings[0] if encodings else None

face_system = FaceRecognitionSystem()

# ============ SECURE API ENDPOINTS ============

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    try:
        data = request.json
        img_b64 = data.get("documentImage")
        expected_name = data.get("fullName", "").upper().strip()

        if not img_b64 or not expected_name:
            return jsonify({"success": False, "message": "Missing image or name"}), 400

        img_arr = face_system.base64_to_image(img_b64)
        ocr_result = reader.readtext(img_arr)
        extracted_text = " ".join([text[1] for text in ocr_result]).upper()

        # 1. Flexible Keyword Check (Matches your working version)
        keywords = ["ELECTION", "VOTER", "INDIA", "COMMISSION", "ELECTOR", "IDENTITY"]
        is_voter_id = any(k in extracted_text for k in keywords)
        
        # 2. Fuzzy Name Match (Matches your working version)
        name_parts = [p for p in expected_name.split() if len(p) > 2]
        ocr_words = extracted_text.split()
        
        name_match = False
        for part in name_parts:
            close_matches = difflib.get_close_matches(part, ocr_words, n=1, cutoff=0.6)
            if close_matches or part in extracted_text:
                name_match = True
                break

        if not is_voter_id:
            return jsonify({"success": False, "message": "Document not recognized as Voter ID"}), 400
        
        if not name_match:
            return jsonify({"success": False, "message": "Name mismatch on document"}), 400

        return jsonify({"success": True, "message": "Document Verified!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/register-face", methods=["POST"])
def register_face():
    try:
        data = request.json
        user_id_hash = hash_data(data.get("userId")) 
        phone_hash = hash_data(data.get("phoneNumber", "0000000000"))
        face_images = data.get("faceImages", [])
        
        if not user_id_hash or not face_images:
            return jsonify({"success": False, "message": "Data missing"}), 400

        encodings = []
        for img_b64 in face_images:
            img_arr = face_system.base64_to_image(img_b64)
            if img_arr is not None:
                enc = face_system.get_face_encoding(img_arr)
                if enc is not None: 
                    encodings.append(enc)

        if len(encodings) < 1:
            return jsonify({"success": False, "message": "No face detected in images."}), 400

        face_system.known_encodings[user_id_hash] = encodings
        face_system.save_encodings()
        
        conn = sqlite3.connect('voting_system.db')
        conn.execute("INSERT OR REPLACE INTO users (user_id_hash, phone_hash, has_voted) VALUES (?, ?, 0)", 
                     (user_id_hash, phone_hash))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Secure Registration successful"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    data = request.json
    base64_image = data.get("faceImage")
    img_array = face_system.base64_to_image(base64_image)
    test_encoding = face_system.get_face_encoding(img_array)
    
    if test_encoding is None:
        return jsonify({"success": False, "message": "No face detected"}), 400

    best_match_hash = None
    min_dist = 0.6 
    
    for uid_hash, user_encodings in face_system.known_encodings.items():
        distances = face_recognition.face_distance(user_encodings, test_encoding)
        if np.min(distances) < min_dist:
            min_dist = np.min(distances)
            best_match_hash = uid_hash

    if best_match_hash:
        conn = sqlite3.connect('voting_system.db')
        user = conn.execute("SELECT has_voted FROM users WHERE user_id_hash=?", (best_match_hash,)).fetchone()
        conn.close()
        
        if user and user[0] == 1:
            return jsonify({"success": False, "message": "You have already cast your vote."}), 403
            
        return jsonify({"success": True, "userIdHash": best_match_hash})
    
    return jsonify({"success": False, "message": "Face not recognized"}), 401

@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    user_id_hash = request.json.get("userIdHash")
    otp = str(random.randint(100000, 999999))
    
    conn = sqlite3.connect('voting_system.db')
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET otp=? WHERE user_id_hash=?", (otp, user_id_hash))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404
        
    conn.commit()
    conn.close()

    # Returning OTP directly for Demo (Twilio Removed)
    return jsonify({"success": True, "message": "OTP Generated", "debug_otp": otp})

@app.route("/api/cast-vote", methods=["POST"])
def cast_vote():
    data = request.json
    uid_hash = data.get("userIdHash")
    candidate_id = data.get("candidateId")

    conn = sqlite3.connect('voting_system.db')
    c = conn.cursor()
    try:
        # Atomic check: mark as voted and clear OTP
        c.execute("UPDATE users SET has_voted = 1, otp = NULL WHERE user_id_hash = ? AND has_voted = 0", (uid_hash,))
        
        if c.rowcount == 0:
            return jsonify({"success": False, "message": "Invalid session or already voted"}), 403

        # Update candidate tally (Anonymous separation)
        c.execute("UPDATE results SET vote_count = vote_count + 1 WHERE candidate_id = ?", (candidate_id,))
        
        conn.commit()
        return jsonify({"success": True, "message": "Vote recorded anonymously"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/admin/results", methods=["GET"])
def get_results():
    conn = sqlite3.connect('voting_system.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM results")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"id": r[0], "name": r[1], "votes": r[2]} for r in rows])

if __name__ == "__main__":
    app.run(debug=True, port=5001, host="0.0.0.0")