import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database.database import get_db
from database.models import User
from schemas.auth import TokenData

# Cargar variables de entorno
load_dotenv()

# Configuración de seguridad
SECRET_KEY = os.getenv("JWT_SECRET", "fallback_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 días

# Security scheme para Bearer token
security = HTTPBearer()

# ===== FUNCIONES DE HASH DE CONTRASEÑAS =====

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar si una contraseña coincide con su hash"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Generar hash de una contraseña"""
    # Generar salt y hashear la contraseña
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# ===== FUNCIONES DE JWT =====

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crear un token de acceso JWT"""
    to_encode = data.copy()
    
    # Asegurar que 'sub' sea string
    if 'sub' in to_encode:
        to_encode['sub'] = str(to_encode['sub'])
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Crear un token de refresco JWT"""
    to_encode = data.copy()
    
    # Asegurar que 'sub' sea string
    if 'sub' in to_encode:
        to_encode['sub'] = str(to_encode['sub'])
    
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> TokenData:
    """Decodificar y validar un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        username: str = payload.get("username")
        
        if user_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: falta el ID de usuario",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Convertir a int si viene como string o número
        user_id = int(user_id_raw) if user_id_raw else None
        
        return TokenData(user_id=user_id, username=username)
    
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: formato de ID incorrecto",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ===== DEPENDENCIAS PARA OBTENER USUARIO ACTUAL =====

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtener el usuario actual desde el token JWT.
    Esta función se usa como dependencia en las rutas protegidas.
    """
    token = credentials.credentials
    
    # Decodificar el token
    token_data = decode_token(token)
    
    # Buscar el usuario en la base de datos
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verificar que el usuario esté activo"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return current_user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verificar que el usuario sea administrador"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user

# ===== FUNCIÓN AUXILIAR PARA AUTENTICAR USUARIO =====

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Autenticar un usuario con username y contraseña.
    Retorna el usuario si es válido, None en caso contrario.
    """
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user
