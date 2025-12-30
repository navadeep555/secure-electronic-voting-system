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
    def __init__(self):
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

@app.route('/api/verify_document', methods=['POST'])
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


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "Server is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
