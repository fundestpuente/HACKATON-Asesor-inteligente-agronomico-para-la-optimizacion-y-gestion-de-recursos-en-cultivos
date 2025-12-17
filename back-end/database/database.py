import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener URL de la base de datos desde .env
DATABASE_URL = os.getenv("DB_URL")

if not DATABASE_URL:
    raise ValueError("❌ DB_URL no está configurada en el archivo .env")

# Crear engine de SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verificar conexión antes de usar
    pool_size=10,        # Número de conexiones en el pool
    max_overflow=20      # Conexiones adicionales permitidas
)

# Crear sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependencia para obtener la sesión de base de datos
def get_db():
    """
    Generador que proporciona una sesión de base de datos.
    Se cierra automáticamente al finalizar la petición.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
