import os
import pickle
import face_recognition
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Create directories for storing face data
os.makedirs("face_data", exist_ok=True)
os.makedirs("encodings", exist_ok=True)

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

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "Server is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
