import os
import json
import base64
import numpy as np
import face_recognition
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from datetime import datetime
import pickle

app = Flask(__name__)
CORS(app)

# Create directories for storing face data
os.makedirs("face_data", exist_ok=True)
os.makedirs("encodings", exist_ok=True)

class FaceRecognitionSystem:
    def __init__(self):
        self.known_encodings = {}  # {user_id: [encoding1, encoding2, encoding3, encoding4]}
        self.known_names = []
        self.load_encodings()
    
    def load_encodings(self):
        """Load previously saved face encodings"""
        try:
            with open("encodings/face_encodings.pkl", "rb") as f:
                self.known_encodings = pickle.load(f)
            self.known_names = list(self.known_encodings.keys())
            print(f"✅ Loaded {len(self.known_names)} users' face encodings")
        except FileNotFoundError:
            print("📝 No existing encodings found. Starting fresh.")
            self.known_encodings = {}
            self.known_names = []
    
    def save_encodings(self):
        """Save face encodings to disk"""
        with open("encodings/face_encodings.pkl", "wb") as f:
            pickle.dump(self.known_encodings, f)
        print("💾 Face encodings saved")
    
    def base64_to_image(self, base64_string):
        """Convert base64 string to PIL Image"""
        try:
            # Remove data URI prefix if present
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
            
            # Decode base64
            img_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(img_data))
            return np.array(img)
        except Exception as e:
            print(f"❌ Error converting base64 to image: {e}")
            return None
    
    def get_face_encoding(self, image_array):
        """Extract face encoding from image array"""
        try:
            # Find faces in the image
            face_locations = face_recognition.face_locations(image_array, model="hog")
            
            if not face_locations:
                print("⚠️ No face found in image")
                return None, None
            
            # Get encoding for the first (and hopefully only) face
            face_encodings = face_recognition.face_encodings(image_array, face_locations)
            
            if not face_encodings:
                print("⚠️ Could not encode face")
                return None, None
            
            return face_encodings[0], face_locations[0]
        except Exception as e:
            print(f"❌ Error encoding face: {e}")
            return None, None
    
    def register_user(self, user_id, face_images):
        """
        Register a user with their 4 biometric face images
        face_images: list of 4 base64 image strings [front, left, right, up]
        """
        try:
            encodings = []
            valid_faces = 0
            
            for idx, base64_img in enumerate(face_images):
                print(f"🔍 Processing stage {idx + 1} face...")
                
                # Convert base64 to image
                img_array = self.base64_to_image(base64_img)
                if img_array is None:
                    print(f"⚠️ Could not process stage {idx + 1}")
                    continue
                
                # Extract face encoding
                encoding, location = self.get_face_encoding(img_array)
                if encoding is None:
                    print(f"⚠️ No valid face in stage {idx + 1}")
                    continue
                
                encodings.append(encoding)
                valid_faces += 1
                print(f"✅ Stage {idx + 1} face encoded successfully")
            
            if valid_faces < 2:
                return {
                    "success": False,
                    "message": f"Need at least 2 valid face images. Got {valid_faces}"
                }
            
            # Store encodings for this user
            self.known_encodings[user_id] = encodings
            self.known_names.append(user_id)
            self.save_encodings()
            
            return {
                "success": True,
                "message": f"✅ User registered successfully with {valid_faces} valid face images",
                "valid_faces": valid_faces,
                "total_stages": len(face_images)
            }
        
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return {
                "success": False,
                "message": f"Registration failed: {str(e)}"
            }
    
    def recognize_face(self, base64_image, tolerance=0.6):
        """
        Recognize a face from a single image
        tolerance: lower = stricter matching (0.6 is default, 0.5 is stricter)
        """
        try:
            print("🔍 Attempting face recognition...")
            
            # Convert base64 to image
            img_array = self.base64_to_image(base64_image)
            if img_array is None:
                return {"success": False, "message": "Could not process image"}
            
            # Get face encoding from the test image
            test_encoding, _ = self.get_face_encoding(img_array)
            if test_encoding is None:
                return {"success": False, "message": "No face detected in image"}
            
            # If no users registered, return empty
            if not self.known_encodings:
                return {
                    "success": False,
                    "message": "No registered users in database"
                }
            
            # Compare against all known encodings
            best_match_name = None
            best_match_distance = float('inf')
            match_details = {}
            
            for user_id, user_encodings in self.known_encodings.items():
                # Compare test encoding against all this user's encodings
                distances = face_recognition.face_distance(user_encodings, test_encoding)
                min_distance = np.min(distances)
                
                match_details[user_id] = {
                    "min_distance": float(min_distance),
                    "avg_distance": float(np.mean(distances)),
                    "stages_matched": int(np.sum(distances < tolerance))
                }
                
                # Track best match
                if min_distance < best_match_distance:
                    best_match_distance = min_distance
                    best_match_name = user_id
            
            # Determine if it's a match
            is_match = best_match_distance < tolerance
            
            result = {
                "success": is_match,
                "message": f"{'✅ Face matched!' if is_match else '❌ Face not recognized'} Distance: {best_match_distance:.4f}",
                "matched_user": best_match_name if is_match else None,
                "distance": float(best_match_distance),
                "tolerance": tolerance,
                "all_matches": match_details
            }
            
            if is_match:
                print(f"✅ Recognized user: {best_match_name}")
            else:
                print(f"❌ Could not recognize face. Closest match: {best_match_name} (distance: {best_match_distance:.4f})")
            
            return result
        
        except Exception as e:
            print(f"❌ Recognition error: {e}")
            return {
                "success": False,
                "message": f"Recognition failed: {str(e)}"
            }

# Initialize recognition system
face_system = FaceRecognitionSystem()

# ============ API ENDPOINTS ============

@app.route("/api/register-face", methods=["POST"])
def register_face():
    """Register a new user with 4 biometric faces"""
    try:
        data = request.json
        user_id = data.get("userId")
        face_images = data.get("faceImages", [])  # List of 4 base64 images
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing userId"}), 400
        
        if len(face_images) != 4:
            return jsonify({
                "success": False,
                "message": f"Expected 4 face images, got {len(face_images)}"
            }), 400
        
        result = face_system.register_user(user_id, face_images)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():
    """Recognize a user from a single face image"""
    try:
        data = request.json
        base64_image = data.get("faceImage")
        tolerance = data.get("tolerance", 0.6)
        
        if not base64_image:
            return jsonify({"success": False, "message": "Missing faceImage"}), 400
        
        result = face_system.recognize_face(base64_image, tolerance)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route("/api/verify-document", methods=["POST"])
def verify_document():
    """Verify a Voter ID document and check name match"""
    try:
        data = request.json
        base64_image = data.get("documentImage")
        expected_name = data.get("name")
        
        expected_dob = data.get("dob")
        
        if not base64_image or not expected_name or not expected_dob:
            return jsonify({"success": False, "message": "Missing image, name, or DOB"}), 400
            
        print(f"🔍 Verifying document for: {expected_name}, DOB: {expected_dob}")
        
        # Convert base64 to image
        img_array = face_system.base64_to_image(base64_image)
        if img_array is None:
            return jsonify({"success": False, "message": "Invalid image format"}), 400
            
        # Run OCR
        import easyocr
        import re
        from datetime import datetime
        
        reader = easyocr.Reader(['en']) 
        result = reader.readtext(img_array)
        
        extracted_text = " ".join([text[1] for text in result]).upper()
        print(f"📝 Extracted text: {extracted_text}")
        
        # 1. Check if it's a real Voter ID (Basic Keyword Check)
        keywords = ["ELECTION", "COMMISSION", "INDIA", "ELECTOR", "IDENTITY", "CARD", "EPIC", "VOTER"]
        keyword_matches = [k for k in keywords if k in extracted_text]
        
        is_valid_id = len(keyword_matches) >= 2 # At least 2 keywords must match
        
        # 2. Check Name Match
        input_name = expected_name.upper().strip()
        name_parts = input_name.split()
        
        name_match = False
        if input_name in extracted_text:
            name_match = True
        else:
            if len(name_parts) >= 2:
                if name_parts[0] in extracted_text and name_parts[-1] in extracted_text:
                    name_match = True

        # 3. Check DOB Match
        # expected_dob comes as YYYY-MM-DD from HTML date input
        dob_match = False
        try:
            # Parse input DOB
            dob_obj = datetime.strptime(expected_dob, "%Y-%m-%d")
            
            # Formats to look for in OCR text
            # DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
            date_patterns = [
                dob_obj.strftime("%d/%m/%Y"),
                dob_obj.strftime("%d-%m-%Y"),
                dob_obj.strftime("%d.%m.%Y"),
                # Sometimes spaces instead of separators
                dob_obj.strftime("%d %m %Y"),
                # Year only check (fallback) if full date fails? Maybe too lenient. Let's stick to full date first.
            ]
            
            print(f"📅 Looking for DOB patterns: {date_patterns}")
            
            # Simple substring search for these patterns
            for pattern in date_patterns:
                if pattern in extracted_text:
                    dob_match = True
                    break
                    
            # Regex search for the specific date if simple match fails (handles spacing issues)
            if not dob_match:
                # Construct regex: DD followed by separator followed by MM...
                d, m, y = dob_obj.strftime("%d"), dob_obj.strftime("%m"), dob_obj.strftime("%Y")
                # pattern: d \D? m \D? y (digits with optional non-digit separator)
                regex_pattern = f"{d}[\\/\\-\\.\\s]+{m}[\\/\\-\\.\\s]+{y}"
                if re.search(regex_pattern, extracted_text):
                    dob_match = True

        except Exception as e:
            print(f"⚠️ Date parsing error: {e}")
            # Don't fail the whole request on date parse error alone, but dob_match will be False

        
        if not is_valid_id:
            return jsonify({
                "success": False, 
                "message": "Could not verify this as a valid Voter ID card. Please ensure the image is clear."
            })
            
        if not name_match:
            return jsonify({
                "success": False, 
                "message": f"Name mismatch. Expected '{expected_name}' but could not find it clearly on the document."
            })

        if not dob_match:
             return jsonify({
                "success": False, 
                "message": f"Date of Birth mismatch. Expected '{expected_dob}' (or similar format) on the document."
            })
            
        return jsonify({
            "success": True,
            "message": "✅ Document (Name & DOB) verified successfully!",
            "extracted_text": extracted_text[:100] + "..." 
        })
    
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return jsonify({
            "success": False,
            "message": f"Verification error: {str(e)}"
        }), 500

@app.route("/api/users", methods=["GET"])
def get_users():
    """Get list of registered users"""
    try:
        users = []
        for user_id in face_system.known_names:
            num_encodings = len(face_system.known_encodings.get(user_id, []))
            users.append({
                "userId": user_id,
                "encodingsCount": num_encodings
            })
        
        return jsonify({
            "success": True,
            "total_users": len(users),
            "users": users
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "✅ Face Recognition + Document Verification Server is Running",
        "registered_users": len(face_system.known_names),
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("🚀 Starting Face & Document Verification Server...")
    print("📍 Server running on http://localhost:5001")
    print("⚠️  Make sure to install dependencies: pip install -r requirements.txt")
    app.run(debug=True, port=5001, host="0.0.0.0")
