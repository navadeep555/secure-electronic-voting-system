import os
import base64
import numpy as np
import face_recognition
import pickle
import random
import sqlite3
import easyocr
import difflib
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from datetime import datetime
from twilio.rest import Client
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend communication
CORS(app)

# --- Twilio Configuration (Loaded from .env) ---
TWILIO_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_SENDER = os.getenv('TWILIO_WHATSAPP_NUMBER') 

# Initialize Twilio Client
twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)

# --- File System & DB Setup ---
os.makedirs("face_data", exist_ok=True)
os.makedirs("encodings", exist_ok=True)

def init_db():
    conn = sqlite3.connect('voting_system.db')
    c = conn.cursor()
    # US 1.1 & 1.5: Added has_voted for duplicate prevention
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (user_id TEXT PRIMARY KEY, phone_number TEXT, has_voted INTEGER DEFAULT 0, otp TEXT)''')
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
        face_locations = face_recognition.face_locations(image_array, model="hog")
        if not face_locations: return None, None
        face_encodings = face_recognition.face_encodings(image_array, face_locations)
        return (face_encodings[0], face_locations[0]) if face_encodings else (None, None)

face_system = FaceRecognitionSystem()

# ============ API ENDPOINTS ============

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

        # 1. Flexible Keyword Check
        keywords = ["ELECTION", "VOTER", "INDIA", "COMMISSION", "ELECTOR", "ELECTLON", "IDENTITY"]
        is_voter_id = any(k in extracted_text for k in keywords)
        
        # 2. Fuzzy Name Match
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
        user_id = data.get("userId") 
        phone = data.get("phoneNumber", "0000000000")
        face_images = data.get("faceImages", [])
        
        if not user_id or not face_images:
            return jsonify({"success": False, "message": "Data missing"}), 400

        encodings = []
        for img_b64 in face_images:
            img_arr = face_system.base64_to_image(img_b64)
            if img_arr is not None:
                enc, _ = face_system.get_face_encoding(img_arr)
                if enc is not None: 
                    encodings.append(enc)

        if len(encodings) < 1:
            return jsonify({"success": False, "message": "No face detected in images."}), 400

        face_system.known_encodings[user_id] = encodings
        face_system.save_encodings()
        
        conn = sqlite3.connect('voting_system.db')
        conn.execute("INSERT OR REPLACE INTO users (user_id, phone_number, has_voted) VALUES (?, ?, 0)", (user_id, phone))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Registration successful"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    data = request.json
    base64_image = data.get("faceImage")
    img_array = face_system.base64_to_image(base64_image)
    test_encoding, _ = face_system.get_face_encoding(img_array)
    
    if test_encoding is None:
        return jsonify({"success": False, "message": "No face detected"}), 400

    best_match_id = None
    min_dist = 0.6 
    
    for user_id, user_encodings in face_system.known_encodings.items():
        distances = face_recognition.face_distance(user_encodings, test_encoding)
        if np.min(distances) < min_dist:
            min_dist = np.min(distances)
            best_match_id = user_id

    if best_match_id:
        # US 1.5 Check: Check if they already voted before even sending OTP
        conn = sqlite3.connect('voting_system.db')
        user = conn.execute("SELECT has_voted FROM users WHERE user_id=?", (best_match_id,)).fetchone()
        conn.close()
        
        if user and user[0] == 1:
            return jsonify({"success": False, "message": "You have already cast your vote."}), 403
            
        return jsonify({"success": True, "userId": best_match_id})
    return jsonify({"success": False, "message": "Face not recognized"}), 401

@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    user_id = data.get("userId")
    
    conn = sqlite3.connect('voting_system.db')
    user = conn.execute("SELECT phone_number FROM users WHERE user_id=?", (user_id,)).fetchone()
    
    if not user: 
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404
        
    otp = str(random.randint(100000, 999999))
    conn.execute("UPDATE users SET otp=? WHERE user_id=?", (otp, user_id))
    conn.commit()
    conn.close()

    try:
        twilio_client.messages.create(
            from_=TWILIO_SENDER,
            body=f"Your SecureVote OTP is: {otp}",
            to=f"whatsapp:{user[0]}" 
        )
        return jsonify({"success": True, "message": "OTP sent"})
    except Exception as e:
        return jsonify({"success": False, "message": f"Twilio Error: {str(e)}"}), 500

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    user_id = data.get("userId")
    entered_otp = data.get("otp")
    conn = sqlite3.connect('voting_system.db')
    db_res = conn.execute("SELECT otp FROM users WHERE user_id=?", (user_id,)).fetchone()
    conn.close()
    
    if db_res and db_res[0] == entered_otp:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid OTP"}), 401

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "Online", "timestamp": datetime.now().isoformat()})

if __name__ == "__main__":
    app.run(debug=True, port=5001, host="0.0.0.0")