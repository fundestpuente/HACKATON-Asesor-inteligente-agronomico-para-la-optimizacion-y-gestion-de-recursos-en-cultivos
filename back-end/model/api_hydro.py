import joblib
import numpy as np
import pandas as pd
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from hydro_optimizer import HydroOptimizer
from weather_api import get_weather 

app = FastAPI(title="HydroAI API", description="Backend para sistema hidropónico")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)


try:
    model = load_model('../training_models/hydro_model.keras')
    scaler_num = joblib.load('../Artifacts/scaler_num_hydro.joblib')
    encoder_cat = joblib.load('../Artifacts/label_encoder_hydro.joblib')
    scaler_y = joblib.load('../Artifacts/scaler_y_hydro.joblib')
except Exception as e:
    print(f"Error cargando los modelos: {e}")
    model = None

optimizer = HydroOptimizer()

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

class UserInput(BaseModel):
    crop: str
    week: int
    tank_liters: float
    ph_water: float
    lat: float
    long: float

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

    if scaler_num:
        input_num_processed = scaler_num.transform(input_num)
    else:
        input_num_processed = input_num
    
    try:
        crop_idx = encoder_cat.transform([data.crop])
    except:
        crop_idx = np.array([0])

    
    if model:
        pred_scaled = model.predict([input_num_processed, crop_idx], verbose=0)
        pred_real = scaler_y.inverse_transform(pred_scaled)[0]

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