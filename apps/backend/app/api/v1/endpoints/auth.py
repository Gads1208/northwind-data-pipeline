from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.security import create_access_token, verify_password, get_password_hash

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Mock in-memory admin user for instant demo
DEMO_USER = {
    "username": "admin@northwind.com",
    "password_hash": get_password_hash("admin123"),
    "name": "Arquiteto Sênior",
    "role": "Administrator"
}

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    if req.username == DEMO_USER["username"] or req.username == "admin":
        token = create_access_token(subject=DEMO_USER["username"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "username": DEMO_USER["username"],
                "name": DEMO_USER["name"],
                "role": DEMO_USER["role"]
            }
        }
    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
