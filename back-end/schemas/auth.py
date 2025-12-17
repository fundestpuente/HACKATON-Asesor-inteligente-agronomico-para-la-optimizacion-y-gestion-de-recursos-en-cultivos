from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# ===== ESQUEMAS DE AUTENTICACIÓN =====

class UserRegister(BaseModel):
    """Esquema para registro de usuario"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    """Esquema para login de usuario"""
    username: str
    password: str

class Token(BaseModel):
    """Esquema para respuesta de token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Datos extraídos del token"""
    user_id: Optional[int] = None
    username: Optional[str] = None

class UserResponse(BaseModel):
    """Respuesta con datos del usuario"""
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    """Esquema para actualizar usuario"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class ChangePassword(BaseModel):
    """Esquema para cambiar contraseña"""
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)
