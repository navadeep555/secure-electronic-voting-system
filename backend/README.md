# Face Recognition Backend

This is the Python backend for facial recognition using `face_recognition` library with Flask. It handles:

1. **Face Training**: Takes 4 biometric images and creates unique face encodings
2. **Face Encoding Storage**: Stores face embeddings in a pickle file database
3. **Face Recognition**: Recognizes users from single face images in real-time

## Features

- ✅ Real-time face detection using dlib's CNN model
- ✅ Face encoding generation (128-dimensional face embeddings)
- ✅ Persistent storage of face encodings
- ✅ REST API for registration and recognition
- ✅ CORS enabled for cross-origin requests
- ✅ Base64 image support
- ✅ Configurable tolerance for matching accuracy

## Setup

### Prerequisites

- Python 3.8+
- macOS/Linux (Windows requires additional setup for dlib)

### Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Make setup script executable
chmod +x setup.sh

# 3. Run setup script
./setup.sh

# 4. Activate virtual environment
source venv/bin/activate

# 5. Start the server
python app.py
```

## Usage

### 1. Register a User (Training Phase)

```bash
curl -X POST http://localhost:5000/api/register-face \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123456789012",
    "faceImages": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "✅ User registered successfully with 4 valid face images",
  "valid_faces": 4,
  "total_stages": 4
}
```

### 2. Recognize a User (Authentication Phase)

```bash
curl -X POST http://localhost:5000/api/recognize-face \
  -H "Content-Type: application/json" \
  -d '{
    "faceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "tolerance": 0.6
  }'
```

**Response (Match):**
```json
{
  "success": true,
  "message": "✅ Face matched! Distance: 0.4521",
  "matched_user": "123456789012",
  "distance": 0.4521,
  "tolerance": 0.6
}
```

**Response (No Match):**
```json
{
  "success": false,
  "message": "❌ Face not recognized. Distance: 0.7234",
  "matched_user": null,
  "distance": 0.7234,
  "tolerance": 0.6
}
```

### 3. Get Registered Users

```bash
curl http://localhost:5000/api/users
```

**Response:**
```json
{
  "success": true,
  "total_users": 5,
  "users": [
    {
      "userId": "123456789012",
      "encodingsCount": 4
    }
  ]
}
```

### 4. Health Check

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "✅ Face Recognition Server is Running",
  "registered_users": 1,
  "timestamp": "2025-12-24T19:30:45.123456"
}
```

## How It Works

### Face Encoding
- Takes a face image and extracts a 128-dimensional embedding
- Uses dlib's CNN-based face detector and landmark detection
- Creates a unique "face fingerprint" for each person

### Registration (Training)
1. Receives 4 biometric images (front, left, right, up angles)
2. Detects faces in each image
3. Generates face encodings for each valid face
4. Stores encodings in `encodings/face_encodings.pkl`
5. Requires minimum 2 valid face images

### Recognition (Authentication)
1. Receives a single test image
2. Generates face encoding from test image
3. Compares against all stored encodings
4. Uses Euclidean distance to find closest match
5. Returns match if distance < tolerance (default 0.6)

### Distance Tolerance Guide
- **0.4** - Very strict (high false negatives)
- **0.5** - Strict (recommended for high security)
- **0.6** - Normal (default, good balance)
- **0.7** - Lenient (high false positives)

## File Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── setup.sh              # Setup script
├── README.md             # This file
├── face_data/            # Stores captured face images (optional)
├── encodings/            # Stores face encodings
│   └── face_encodings.pkl  # Serialized face encodings database
└── venv/                 # Virtual environment (created during setup)
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/register-face` | Register user with 4 face images |
| POST | `/api/recognize-face` | Recognize user from single image |
| GET | `/api/users` | List all registered users |
| GET | `/api/health` | Server health check |

## Troubleshooting

### "No face found in image"
- Ensure the image has a clear, front-facing face
- Check lighting conditions
- Face should be at least 50x50 pixels
- Try different angles

### "Could not encode face"
- dlib failed to detect face landmarks
- Try with different image angles
- Improve image lighting

### "No registered users in database"
- First register users using `/api/register-face`
- Check that `encodings/face_encodings.pkl` exists

### Connection refused
- Ensure backend is running: `python app.py`
- Check port 5000 is not in use: `lsof -i :5000`
- Try different port in app.py: `app.run(port=5001)`

### Import errors
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

## Advanced Configuration

### Changing Port
Edit `app.py`:
```python
if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Change 5000 to desired port
```

### Changing Tolerance
Pass custom tolerance in recognition request:
```json
{
  "faceImage": "...",
  "tolerance": 0.5
}
```

### Disabling Debug Mode
Edit `app.py`:
```python
app.run(debug=False, port=5000)  # Set debug=False for production
```

## Security Considerations

⚠️ **Important for Production:**

1. **Database Security**: Encrypt `encodings/face_encodings.pkl`
2. **API Authentication**: Add JWT tokens
3. **Rate Limiting**: Implement rate limiting on endpoints
4. **HTTPS**: Use SSL/TLS certificates
5. **Input Validation**: Validate base64 image sizes
6. **Data Privacy**: Comply with GDPR/data protection laws
7. **Liveness Detection**: Add anti-spoofing measures
8. **Backup**: Regular backup of face encodings database

## Performance Tips

- Face detection is CPU-intensive
- Consider using GPU (CUDA) for better performance
- Batch processing multiple recognitions
- Cache frequently used encodings
- Use smaller images (1280x720) instead of high-res
- Implement request queuing for high load

## License

This backend is part of SecureVote Identity system.

## Support

For issues or questions, refer to the main project documentation.
