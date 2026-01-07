import os
import pickle
import face_recognition
import easyocr
import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
CORS(app)

# Create directories for storing face data and logs
os.makedirs("face_data", exist_ok=True)
os.makedirs("encodings", exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Configure logging with rotation
handler = RotatingFileHandler('logs/app.log', maxBytes=10000000, backupCount=3)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Application started')

class FaceRecognitionSystem:
    """
    Face Recognition System for Voter Authentication
    
    This class handles all face recognition operations including:
    - Loading and saving face encodings
    - Image preprocessing and conversion
    - Face encoding extraction
    - Face recognition and matching
    
    Attributes:
        known_encodings (dict): Dictionary mapping user IDs to their face encodings
        known_names (list): List of registered user IDs
    """
    
    def __init__(self):
        """Initialize the face recognition system and load existing encodings"""
        self.known_encodings = {}
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
        """
        Convert base64 encoded string to numpy image array
        
        Args:
            base64_string (str): Base64 encoded image string (with or without data URI prefix)
            
        Returns:
            numpy.ndarray: Image array in RGB format, or None if conversion fails
        """
        import base64
        from io import BytesIO
        from PIL import Image
        
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            img_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(img_data))
            return np.array(img)
        except Exception as e:
            print(f"❌ Error converting base64 to image: {e}")
            return None
    
    def get_face_encoding(self, image_array):
        """
        Extract face encoding from image array (Encoding Operation)
        
        This method handles the encoding phase - extracting facial features
        into a numerical representation that can be compared.
        
        Args:
            image_array (numpy.ndarray): Image array in RGB format
            
        Returns:
            numpy.ndarray: 128-dimensional face encoding, or None if no face found
        """
        try:
            face_locations = face_recognition.face_locations(image_array, model="hog")
            
            if not face_locations:
                print("⚠️ No face found in image")
                return None
            
            face_encodings = face_recognition.face_encodings(image_array, face_locations)
            
            if not face_encodings:
                print("⚠️ Could not encode face")
                return None
            
            return face_encodings[0]
        except Exception as e:
            print(f"❌ Error encoding face: {e}")
            return None
    
    def recognize_face(self, base64_image, tolerance=0.6):
        """
        Recognize a face from a single image (Recognition Operation)
        
        This method handles the recognition phase - comparing a test face
        against all known encodings to find a match.
        
        Args:
            base64_image (str): Base64 encoded image containing a face
            tolerance (float): Distance threshold for matching (default: 0.6)
                              Lower values = stricter matching
                              
        Returns:
            dict: Recognition result containing:
                - success (bool): Whether a match was found
                - message (str): Human-readable result message
                - matched_user (str|None): User ID if matched
                - distance (float): Best match distance
                - tolerance (float): Threshold used
        """
        try:
            print("🔍 Attempting face recognition...")
            
            # Convert base64 to image
            img_array = self.base64_to_image(base64_image)
            if img_array is None:
                return {"success": False, "message": "Could not process image"}
            
            # Get face encoding from the test image
            test_encoding = self.get_face_encoding(img_array)
            if test_encoding is None:
                return {"success": False, "message": "No face detected in image"}
            
            # If no users registered, return empty
            if not self.known_encodings:
                return {
                    "success": False,
                    "message": "No registered users in database"
                }
            
            # Compare against all known encodings using face_recognition.compare_faces()
            best_match_name = None
            best_match_distance = float('inf')
            
            for user_id, user_encodings in self.known_encodings.items():
                # Calculate face distance
                distances = face_recognition.face_distance(user_encodings, test_encoding)
                min_distance = np.min(distances)
                
                # Track best match
                if min_distance < best_match_distance:
                    best_match_distance = min_distance
                    best_match_name = user_id
            
            # Determine if it's a match based on distance threshold (0.6)
            is_match = best_match_distance < tolerance
            
            result = {
                "success": is_match,
                "message": f"{'✅ Face matched!' if is_match else '❌ Face not recognized'}",
                "matched_user": best_match_name if is_match else None,
                "distance": float(best_match_distance),
                "tolerance": tolerance
            }
            
            if is_match:
                print(f"✅ Recognized user: {best_match_name}")
            else:
                print(f"❌ Could not recognize face. Distance: {best_match_distance:.4f}")
            
            return result
        
        except Exception as e:
            print(f"❌ Recognition error: {e}")
            return {
                "success": False,
                "message": f"Recognition failed: {str(e)}"
            }

# Initialize recognition system
face_system = FaceRecognitionSystem()

# Initialize EasyOCR reader
print("🔄 Initializing EasyOCR reader...")
reader = easyocr.Reader(['en'], gpu=False)
print("✅ EasyOCR reader initialized")

def preprocess_image(image_data):
    """Preprocess image for better OCR results"""
    # Convert base64 to numpy array
    import base64
    from io import BytesIO
    from PIL import Image
    
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes))
    img_array = np.array(img)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Apply thresholding
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return thresh

def clean_text(text):
    """Remove special characters and clean text for better matching"""
    import re
    # Remove special characters but keep spaces and alphanumeric
    cleaned = re.sub(r'[^a-zA-Z0-9\s/\-.]', '', text)
    return cleaned.strip()

from functools import wraps

def validate_request(required_fields):
    """Decorator to validate JSON request fields"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({"success": False, "message": "Content-Type must be application/json"}), 400
            
            data = request.get_json()
            missing = [field for field in required_fields if field not in data]
            
            if missing:
                return jsonify({
                    "success": False, 
                    "message": f"Missing required fields: {', '.join(missing)}"
                }), 400
                
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/api/verify_document', methods=['POST'])
@validate_request(['image'])
def verify_document():
    """Document verification with regex patterns for DOB and keyword validation"""
    import re
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        # Preprocess image
        processed_img = preprocess_image(image_data)
        
        # Extract text using OCR
        results = reader.readtext(processed_img)
        extracted_text = ' '.join([text[1] for text in results])
        cleaned_text = clean_text(extracted_text).upper()
        
        app.logger.info(f"Extracted text: {cleaned_text}")
        
        # Keyword validation for "ELECTION COMMISSION"
        keywords = ["ELECTION", "COMMISSION"]
        keyword_found = all(keyword in cleaned_text for keyword in keywords)
        
        if not keyword_found:
            return jsonify({
                "success": False,
                "error": "Document does not appear to be a valid Voter ID",
                "text": extracted_text
            }), 400
        
        # Regex patterns for DOB (DD/MM/YYYY, DD-MM-YYYY)
        dob_patterns = [
            r'\b(\d{2})[/-](\d{2})[/-](\d{4})\b',  # DD/MM/YYYY or DD-MM-YYYY
            r'\b(\d{2})\.(\d{2})\.(\d{4})\b',       # DD.MM.YYYY
        ]
        
        dob_found = None
        for pattern in dob_patterns:
            match = re.search(pattern, extracted_text)
            if match:
                dob_found = match.group(0)
                break
        
        return jsonify({
            "success": True,
            "text": extracted_text,
            "cleaned_text": cleaned_text,
            "dob": dob_found,
            "keywords_validated": keyword_found,
            "message": "Document verified successfully"
        })
    
    except Exception as e:
        app.logger.error(f"Document verification error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/recognize_face', methods=['POST'])
@validate_request(['faceImage'])
def recognize_face():
    """Recognize a user from a single face image"""
    try:
        data = request.get_json()
        base64_image = data.get('faceImage')
        tolerance = data.get('tolerance', 0.6)
        
        if not base64_image:
            return jsonify({"success": False, "message": "Missing faceImage"}), 400
        
        result = face_system.recognize_face(base64_image, tolerance)
        return jsonify(result)
    
    except Exception as e:
        app.logger.error(f"Face recognition error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "Server is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
