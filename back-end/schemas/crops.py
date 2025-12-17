from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ===== ESQUEMAS DE CULTIVOS =====

class CropCreate(BaseModel):
    """Crear un nuevo cultivo"""
    name: str = Field(..., min_length=1, max_length=100)
    crop_type: str = Field(..., pattern="^(hydroponic|soil)$")
    location_lat: Optional[float] = None
    location_long: Optional[float] = None
    area: Optional[float] = Field(None, gt=0)
    planting_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    notes: Optional[str] = None

class CropUpdate(BaseModel):
    """Actualizar un cultivo existente"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    crop_type: Optional[str] = Field(None, pattern="^(hydroponic|soil)$")
    location_lat: Optional[float] = None
    location_long: Optional[float] = None
    area: Optional[float] = Field(None, gt=0)
    planting_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(active|harvested|abandoned)$")
    notes: Optional[str] = None

class CropResponse(BaseModel):
    """Respuesta con datos del cultivo"""
    id: int
    user_id: int
    name: str
    crop_type: str
    location_lat: Optional[float]
    location_long: Optional[float]
    area: Optional[float]
    planting_date: Optional[datetime]
    harvest_date: Optional[datetime]
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ===== ESQUEMAS DE PREDICCIONES =====

class PredictionCreate(BaseModel):
    """Crear predicción de fertilizante (suelo)"""
    crop_id: Optional[int] = None
    crop_name: str
    ph: float = Field(..., ge=0, le=14)
    latitude: float
    longitude: float

class PredictionResponse(BaseModel):
    """Respuesta de predicción"""
    id: int
    user_id: int
    crop_id: Optional[int]
    crop_name: str
    ph: float
    latitude: float
    longitude: float
    temperature: Optional[float]
    humidity: Optional[float]
    rainfall: Optional[float]
    nitrogen: float
    phosphorus: float
    potassium: float
    recommendation: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== ESQUEMAS DE RECETAS HIDROPÓNICAS =====

class HydroRecipeCreate(BaseModel):
    """Crear receta hidropónica"""
    crop_id: Optional[int] = None
    crop_name: str
    week: int = Field(..., ge=1)
    tank_liters: float = Field(..., gt=0)
    ph_water: float = Field(..., ge=0, le=14)
    latitude: float
    longitude: float

class HydroRecipeResponse(BaseModel):
    """Respuesta de receta hidropónica"""
    id: int
    user_id: int
    crop_id: Optional[int]
    crop_name: str
    week: int
    tank_liters: float
    ph_water: float
    latitude: float
    longitude: float
    temperature: Optional[float]
    humidity: Optional[float]
    target_nitrogen: float
    target_phosphorus: float
    target_potassium: float
    target_ec: float
    recipe_data: dict
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== ESQUEMAS DE PREDICCIÓN DE IMÁGENES =====

class ImagePredictionResponse(BaseModel):
    """Respuesta de predicción por imagen"""
    id: int
    user_id: int
    crop_id: Optional[int]
    predicted_class: str
    confidence: str
    original_filename: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
