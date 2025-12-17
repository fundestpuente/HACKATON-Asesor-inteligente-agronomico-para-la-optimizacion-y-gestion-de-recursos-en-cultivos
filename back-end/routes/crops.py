from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, Crop, Prediction, HydroRecipe, ImagePrediction
from schemas.crops import (
    CropCreate, CropUpdate, CropResponse,
    PredictionResponse, HydroRecipeResponse, ImagePredictionResponse
)
from auth.utils import get_current_user

router = APIRouter(prefix="/crops", tags=["Cultivos"])

# ===== CRUD DE CULTIVOS =====

@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(
    crop_data: CropCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo cultivo para el usuario autenticado.
    """
    new_crop = Crop(
        user_id=current_user.id,
        name=crop_data.name,
        crop_type=crop_data.crop_type,
        location_lat=crop_data.location_lat,
        location_long=crop_data.location_long,
        area=crop_data.area,
        planting_date=crop_data.planting_date,
        harvest_date=crop_data.harvest_date,
        notes=crop_data.notes,
        status="active"
    )
    
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    
    return new_crop

@router.get("", response_model=List[CropResponse])
def get_my_crops(
    status_filter: Optional[str] = Query(None, regex="^(active|harvested|abandoned)$"),
    crop_type: Optional[str] = Query(None, regex="^(hydroponic|soil)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todos los cultivos del usuario autenticado.
    Permite filtrar por estado y tipo de cultivo.
    """
    query = db.query(Crop).filter(Crop.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Crop.status == status_filter)
    
    if crop_type:
        query = query.filter(Crop.crop_type == crop_type)
    
    crops = query.order_by(Crop.created_at.desc()).all()
    return crops

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener un cultivo específico del usuario.
    """
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    return crop

@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: int,
    crop_update: CropUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar un cultivo del usuario.
    """
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = crop_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(crop, field, value)
    
    db.commit()
    db.refresh(crop)
    
    return crop

@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un cultivo del usuario.
    """
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    db.delete(crop)
    db.commit()
    
    return None

# ===== HISTORIAL DE PREDICCIONES =====

@router.get("/{crop_id}/predictions", response_model=List[PredictionResponse])
def get_crop_predictions(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las predicciones de fertilizante para un cultivo específico.
    """
    # Verificar que el cultivo pertenece al usuario
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    predictions = db.query(Prediction).filter(
        Prediction.crop_id == crop_id
    ).order_by(Prediction.created_at.desc()).all()
    
    return predictions

@router.get("/{crop_id}/hydro-recipes", response_model=List[HydroRecipeResponse])
def get_crop_hydro_recipes(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las recetas hidropónicas para un cultivo específico.
    """
    # Verificar que el cultivo pertenece al usuario
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    recipes = db.query(HydroRecipe).filter(
        HydroRecipe.crop_id == crop_id
    ).order_by(HydroRecipe.created_at.desc()).all()
    
    return recipes

@router.get("/{crop_id}/image-predictions", response_model=List[ImagePredictionResponse])
def get_crop_image_predictions(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las predicciones de imagen para un cultivo específico.
    """
    # Verificar que el cultivo pertenece al usuario
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    images = db.query(ImagePrediction).filter(
        ImagePrediction.crop_id == crop_id
    ).order_by(ImagePrediction.created_at.desc()).all()
    
    return images

# ===== ESTADÍSTICAS DEL CULTIVO =====

@router.get("/{crop_id}/stats")
def get_crop_stats(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de un cultivo (cantidad de predicciones, recetas, etc).
    """
    # Verificar que el cultivo pertenece al usuario
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.user_id == current_user.id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultivo no encontrado"
        )
    
    # Contar predicciones
    prediction_count = db.query(Prediction).filter(Prediction.crop_id == crop_id).count()
    hydro_recipe_count = db.query(HydroRecipe).filter(HydroRecipe.crop_id == crop_id).count()
    image_prediction_count = db.query(ImagePrediction).filter(ImagePrediction.crop_id == crop_id).count()
    
    return {
        "crop_id": crop_id,
        "crop_name": crop.name,
        "crop_type": crop.crop_type,
        "status": crop.status,
        "total_predictions": prediction_count,
        "total_hydro_recipes": hydro_recipe_count,
        "total_image_predictions": image_prediction_count,
        "created_at": crop.created_at,
        "updated_at": crop.updated_at
    }
