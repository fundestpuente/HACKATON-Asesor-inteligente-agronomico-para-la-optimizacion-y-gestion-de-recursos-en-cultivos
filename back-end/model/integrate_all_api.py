import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import os
import sys
import shutil

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model


sys.path.append(os.path.join(os.path.dirname(__file__), 'model'))


from model.weather_api import get_weather 
from model.hydro_optimizer import HydroOptimizer
from model.fertilizer_recommendation import recommend_fertilizer
from model.plant_classifier import predict_disease 

app = FastAPI(title="AgroMind IA Unificada")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)

print("\n--- INICIANDO CARGA DE MODELOS ---")

try:
    
    hydro_model = load_model('training_models/hydro_model.keras')
    scaler_num_hydro = joblib.load('Artifacts/scaler_num_hydro.joblib')
    encoder_cat_hydro = joblib.load('Artifacts/label_encoder_hydro.joblib')
    scaler_y_hydro = joblib.load('Artifacts/scaler_y_hydro.joblib')
    optimizer = HydroOptimizer()
    print("Sistema Hidropónico: LISTO")

except Exception as e:
    print(f"Error cargando Hidroponía: {e}")
    hydro_model = None


try:
    
    preprocessor_X_normal = joblib.load("Artifacts/preprocessor_X.joblib")
    scaler_y_normal = joblib.load("Artifacts/scaler_y.joblib")
    model_normal = tf.keras.models.load_model(
        "training_models/agromind_best.keras", 
        custom_objects={'r2_keras': lambda y, p: y} 
    )
    
    print("Sistema Suelo/Normal: LISTO")

except Exception as e:
    print(f"Error cargando Sistema Normal: {e}")
    model_normal = None




CROP_TRANSLATION = {
    "rúcula": "arugula",
    "albahaca":"basil",
    "frijol":"bean",
    "cilantro":"cilantro",
    "pepino":"cucumber",
    "berenjena":"eggplant",
    "lechuga":"lettuce",
    "melón":"melon",
    "menta":"mint",
    "pak choi":"pak_choi",
    "pimiento":"pepper",
    "espinaca":"spinach",
    "fresa":"strawberry",
    "tomate":"tomato",
    "calabacín":"zucchini"
}

CROP_TRANSLATION_NORMAL = {
    "cafe": "coffee", "arroz": "rice", "maiz": "maize", "banano": "banana",
    "platano": "banana", "manzana": "apple", "frijol": "kidneybeans",
    "frijoles": "kidneybeans", "papaya": "papaya", "sandia": "watermelon",
    "uvas": "grapes", "mango": "mango", "naranja": "orange",
    "limon": "orange", "algodon": "cotton", "coco": "coconut"
}

class UserInput(BaseModel):
    crop: str
    week: int
    tank_liters: float
    ph_water: float
    lat: float
    long: float

class PredictionRequestNormal(BaseModel):
    crop: str
    ph: float
    latitud: float
    longitud: float


def prepare_input_normal(crop, temperature, humidity, ph, rainfall):
    X_df = pd.DataFrame({
        "temperature": [temperature],
        "humidity": [humidity],
        "ph": [ph],
        "rainfall": [rainfall],
        "label": [crop]
    })
    return preprocessor_X_normal.transform(X_df)



@app.post("/predict-image")
async def predict_image_endpoint(file: UploadFile = File(...)):
    try:
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        
        resultado = predict_disease(temp_filename)
        
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        
        return {"success": True, "data": resultado}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/generate-recipe")
def generate_recipe(data: UserInput):

    weather_data = get_weather(data.lat, data.long)

    if not weather_data:
        weather_data = {"temperature": 20.0, "humidity": 60.0}
    
    temp = weather_data["temperature"]
    humidity = weather_data["humidity"]

    crop_input = data.crop.lower().strip()
    crop_model_name = CROP_TRANSLATION.get(crop_input, crop_input)

    climate_interaction = temp * humidity
    input_num  = np.array([[temp, humidity, data.ph_water, data.week, climate_interaction]])

    if scaler_num_hydro:
        input_num_processed = scaler_num_hydro.transform(input_num)
    else:
        input_num_processed = input_num
    
    try:
        crop_idx = encoder_cat_hydro.transform([data.crop])
    except:
        crop_idx = np.array([0])

    
    if hydro_model:
        pred_scaled = hydro_model.predict([input_num_processed, crop_idx], verbose=0)
        pred_real = scaler_y_hydro.inverse_transform(pred_scaled)[0]

        n_req, p_req, k_req = pred_real[0], pred_real[1], pred_real[2]
        ec_target = pred_real[3]
    else:
        n_req, p_req, k_req, ec_target = 999, 999, 999, 999.0

    recipe_items = optimizer.calculate_recipe(
        targets={
            "N": float(n_req),
            "P": float(p_req),
            "K": float(k_req),
            "EC": float(ec_target)
    },
    water_liters=data.tank_liters)

    if recipe_items is None or len(recipe_items) == 0:
        raise HTTPException(status_code = 400, detail= "No se pudo calcular una mezcla viable.")
    
    response = {
        "status": "success",
        "tank_info": {
            "volume": data.tank_liters,
            "crop": data.crop,
            "crop_model": crop_model_name
        },
        "environment": {
            "temperature": temp,
            "humidity": humidity,
            "source": "WeatherAPI" if weather_data else "Default"
        },
        "meta": {
            "target_ppm": {"N": float(n_req), "P": float(p_req), "K": float(k_req)},
            "target_ec": float(ec_target)
        },
        "mix_A": [item for item in recipe_items if item['tank_type'] == 'A'],
        "mix_B": [item for item in recipe_items if item['tank_type'] == 'B']
    }

    return response


@app.post("/predict")
def predict_fertilizer(request: PredictionRequestNormal):
    if not model_normal:
        raise HTTPException(status_code=500, detail="Modelo Suelo no cargado.")

    try:
        weather_data = get_weather(request.latitud, request.longitud)
        if not weather_data: weather_data = {"temperature": 25.0, "humidity": 60.0, "rainfall": 50.0}
        
        crop_input = request.crop.lower().strip()
        crop_model_name = CROP_TRANSLATION_NORMAL.get(crop_input, crop_input)

        X = prepare_input_normal(
            crop=crop_model_name,
            temperature=weather_data["temperature"],
            humidity=weather_data["humidity"],
            ph=request.ph,
            rainfall=weather_data.get("rainfall", 50.0)
        )
        
        y_scaled = model_normal.predict(X)
        y_pred = scaler_y_normal.inverse_transform(y_scaled)[0]
        
        N_val, P_val, K_val = float(y_pred[0]), float(y_pred[1]), float(y_pred[2])
        recomendacion_texto = recommend_fertilizer(crop_model_name, N_val, P_val, K_val)

        return {
            "success": True,
            "nutrientes_requeridos": { "N": round(N_val, 2), "P": round(P_val, 2), "K": round(K_val, 2) },
            "datos_clima": weather_data,
            "recomendacion": recomendacion_texto
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)