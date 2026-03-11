import pytest
import json
import base64
from backend.app import app # Ensure your Flask app is exported as 'app'

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """
    Test the health endpoint of the Flask API.
    """
    rv = client.get('/api/health')
    assert rv.status_code == 200
    assert json.loads(rv.data) == {"status": "ok", "service": "flask-backend"}

def test_verify_document_missing_image(client):
    """
    Test OCR document scanning without sending an image file.
    """
    rv = client.post(
        '/api/verify-document', 
        data=json.dumps({}),
        content_type='application/json'
    )
    assert rv.status_code == 400
    response_data = json.loads(rv.data)
    assert 'message' in response_data
    assert response_data['success'] is False

def test_recognize_face_invalid_payload(client):
    """
    Test facial recognition with malformed base64 image data.
    """
    payload = {
        "image": "not-a-valid-base64-string",
        "phone": "+1234567890"
    }
    rv = client.post(
        '/api/recognize-face',
        data=json.dumps(payload),
        content_type='application/json'
    )
    assert rv.status_code in [400, 422, 500] 
    
def test_rate_limiting_registration(client):
    """
    Test Flask-Limiter for the OTP or Face endpoint.
    """
    # Assuming endpoint is limited to 5 requests per minute
    payload = {"phone": "+1234567890", "image": "valid-base-64"}
    
    for _ in range(5):
        client.post('/api/recognize-face', json=payload)
        
    # The 6th request should hit 429 Too Many Requests
    rv = client.post('/api/recognize-face', json=payload)
    assert rv.status_code == 429
    assert b"Too Many Requests" in rv.data
