from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.database import Base

class User(Base):
    """Modelo de Usuario"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    crops = relationship("Crop", back_populates="owner", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    hydro_recipes = relationship("HydroRecipe", back_populates="user", cascade="all, delete-orphan")
    image_predictions = relationship("ImagePrediction", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


class Crop(Base):
    """Modelo de Cultivo del Usuario"""
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Nombre del cultivo (tomate, lechuga, etc)
    crop_type = Column(String(50), nullable=False)  # 'hydroponic' o 'soil'
    location_lat = Column(Float, nullable=True)
    location_long = Column(Float, nullable=True)
    area = Column(Float, nullable=True)  # Área en m² o hectáreas
    planting_date = Column(DateTime, nullable=True)
    harvest_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # active, harvested, abandoned
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    owner = relationship("User", back_populates="crops")
    predictions = relationship("Prediction", back_populates="crop", cascade="all, delete-orphan")
    hydro_recipes = relationship("HydroRecipe", back_populates="crop", cascade="all, delete-orphan")
    image_predictions = relationship("ImagePrediction", back_populates="crop", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Crop {self.name} - {self.crop_type}>"


class Prediction(Base):
    """Modelo de Predicción de Fertilizante (Suelo)"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    
    # Datos de entrada
    ph = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    
    # Resultados (NPK)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    
    # Recomendación generada
    recommendation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="predictions")
    crop = relationship("Crop", back_populates="predictions")
    
    def __repr__(self):
        return f"<Prediction {self.crop_name} - N:{self.nitrogen} P:{self.phosphorus} K:{self.potassium}>"


class HydroRecipe(Base):
    """Modelo de Receta Hidropónica"""
    __tablename__ = "hydro_recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    
    # Datos de entrada
    week = Column(Integer, nullable=False)
    tank_liters = Column(Float, nullable=False)
    ph_water = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    
    # Objetivos calculados
    target_nitrogen = Column(Float, nullable=False)
    target_phosphorus = Column(Float, nullable=False)
    target_potassium = Column(Float, nullable=False)
    target_ec = Column(Float, nullable=False)
    
    # Receta completa (JSON con mix_A y mix_B)
    recipe_data = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="hydro_recipes")
    crop = relationship("Crop", back_populates="hydro_recipes")
    
    def __repr__(self):
        return f"<HydroRecipe {self.crop_name} - Week {self.week}>"


class ImagePrediction(Base):
    """Modelo de Predicción de Enfermedad por Imagen"""
    __tablename__ = "image_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    
    # Resultado de la predicción
    predicted_class = Column(String(100), nullable=False)
    confidence = Column(String(20), nullable=False)
    
    # Metadata
    original_filename = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="image_predictions")
    crop = relationship("Crop", back_populates="image_predictions")
    
    def __repr__(self):
        return f"<ImagePrediction {self.predicted_class} - {self.confidence}>"
