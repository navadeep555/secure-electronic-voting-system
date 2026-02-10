from functools import wraps
from flask import request, jsonify
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "your_shared_secret")

def voter_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Let preflight OPTIONS request pass without auth
        if request.method == "OPTIONS":
            return jsonify(success=True), 200

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify(success=False, message="Missing token"), 403

        token = auth_header.split(" ")[1]

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            if decoded.get("role") != "voter":
                return jsonify(success=False, message="Unauthorized"), 403
            request.voter = decoded
        except jwt.ExpiredSignatureError:
            return jsonify(success=False, message="Token expired"), 403
        except Exception as e:
            print("JWT decode error:", e)
            return jsonify(success=False, message="Invalid token"), 403

        return f(*args, **kwargs)
    return wrapper
