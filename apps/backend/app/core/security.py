import hashlib
import hmac
import base64
import json
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Hashes a password using SHA-256 with project secret key as salt."""
    return hmac.new(settings.SECRET_KEY.encode(), password.encode(), hashlib.sha256).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    return hmac.compare_digest(get_password_hash(plain_password), hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a base64 encoded JSON Web Token structure."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(subject), "exp": int(expire.timestamp())}
    
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature_input = f"{encoded_header}.{encoded_payload}"
    signature = hmac.new(settings.SECRET_KEY.encode(), signature_input.encode(), hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{signature_input}.{encoded_signature}"
