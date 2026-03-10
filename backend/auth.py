from functools import wraps
from flask import request, jsonify
import jwt
import os

# Ensure this secret matches the one in your app.py .env file
JWT_SECRET = os.getenv("JWT_SECRET", "your_shared_secret")

def voter_required(f):
    """
    Shortcut decorator specifically for voter access.
    Matches the logic used in your face recognition bypass.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify(success=True), 200

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify(success=False, message="Missing token"), 401

        token = auth_header.split(" ")[1]

        try:
            # Decode using standard PyJWT to read Flask-JWT-Extended tokens
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            
            if decoded.get("role") != "voter":
                return jsonify(success=False, message="Unauthorized"), 403
            
            # Attach to request for use in routes
            request.voter = decoded 
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify(success=False, message="Token expired"), 401
        except Exception as e:
            print(f"Voter Auth Error: {e}")
            return jsonify(success=False, message="Invalid token"), 401

    return wrapper

def roles_required(allowed_roles):
    """
    Flexible decorator for role-based access control.
    Supports single strings or lists of roles.
    """
    # Normalize input: if a string is passed, wrap it in a list
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # 1. Handle CORS Preflight
            if request.method == "OPTIONS":
                return jsonify(success=True), 200

            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify(success=False, message="Missing token"), 401

            token = auth_header.split(" ")[1]
            try:
                decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                
                # Use .get() everywhere. This PREVENTS the 'name' error.
                user_role = decoded.get("role")
                user_name = decoded.get("name", "Unknown") # If name is missing, use "Unknown"
                
                print(f"DEBUG: Token Decoded. Role: {user_role}, Name: {user_name}")

                if user_role not in allowed_roles:
                    return jsonify(success=False, message="Permission denied"), 403
                
                request.user = decoded 
                request.voter = decoded # Added to support cast_vote which expects request.voter
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return jsonify(success=False, message="Session expired"), 401
            except Exception as e:
                # Log the specific error to the server console for debugging
                print(f"Auth System Error Detail: {str(e)}")
                return jsonify(success=False, message="Invalid session"), 401
                
        return wrapper
    return decorator