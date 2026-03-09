import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_security_status():
    print("\n--- Testing Security Status ---")
    try:
        response = requests.get(f"{BASE_URL}/security-status")
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

def test_failed_login():
    print("\n--- Simulating Failed Login (Face Mismatch) ---")
    payload = {
        "userId": "nonexistent_user",
        "faceImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAcontent"
    }
    response = requests.post(f"{BASE_URL}/recognize-face", json=payload)
    print(f"Status: {response.status_code}")
    print(response.json())

def test_unauthorized_access():
    print("\n--- Simulating Unauthorized Access ---")
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    print(f"Status: {response.status_code}")
    print(response.json())

def test_bruteforce():
    print("\n--- Simulating Brute Force (5 Failed Logins) ---")
    for i in range(5):
        test_failed_login()
        time.sleep(1)
    test_security_status()

if __name__ == "__main__":
    # Note: Assumes server is running locally on port 5000
    test_security_status()
    test_failed_login()
    test_unauthorized_access()
    # test_bruteforce() # Uncomment to test brute force detection
