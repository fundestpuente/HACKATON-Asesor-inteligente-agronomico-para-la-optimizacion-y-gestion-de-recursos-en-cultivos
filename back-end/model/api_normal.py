import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from weather_api import get_weather 
from fertilizer_recommendation import recommend_fertilizer


app = FastAPI(title="AgroMind API", description="API para recomendación de fertilizantes")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)


print("Cargando cerebro de la IA...")
try:
    preprocessor_X = joblib.load("back-end/model/preprocessor_X.joblib")
    scaler_y = joblib.load("back-end/model/scaler_y.joblib")
    categories = joblib.load("back-end/model/categories.joblib")

    
    model = tf.keras.models.load_model(
        "model/agromind_best.keras",
        custom_objects={'r2_keras': lambda y, p: y} 
    )
    print("Sistema listo para recibir peticiones.")
except Exception as e:
    print(f"Error cargando los modelos: {e}")


CROP_TRANSLATION = {
    "cafe": "coffee", 
    "arroz": "rice", 
    "maiz": "maize", 
    "banano": "banana", 
    "platano": "banana", 
    "manzana": "apple",
    "frijol": "kidneybeans", 
    "frijoles": "kidneybeans",
    "papaya": "papaya",
    "sandia": "watermelon",
    "uvas": "grapes",
    "mango": "mango",
    "naranja": "orange",
    "limon": "orange",
    "algodon": "cotton",
    "coco": "coconut"
}


class PredictionRequest(BaseModel):
    crop: str
    ph: float
    latitud: float
    longitud: float


def prepare_input(crop, temperature, humidity, ph, rainfall):
    X_df = pd.DataFrame({
        "temperature": [temperature],
        "humidity": [humidity],
        "ph": [ph],
        "rainfall": [rainfall],
        "label": [crop]
    })
    return preprocessor_X.transform(X_df)


@app.post("/predict")
def predict_fertilizer(request: PredictionRequest):
    try:
        print(f"Recibido: Cultivo={request.crop}, pH={request.ph}")
        print(f"Ubicacion: Lat {request.latitud}, Lon {request.longitud}")

       
        weather_data = get_weather(request.latitud, request.longitud)
        
        
        if not weather_data:
             weather_data = {"temperature": 25.0, "humidity": 60.0, "rainfall": 50.0}
        
        print(f"Clima obtenido: {weather_data}")

        
        crop_input = request.crop.lower().strip()
        
        crop_model_name = CROP_TRANSLATION.get(crop_input, crop_input)

        
        X = prepare_input(
            crop=crop_model_name,
            temperature=weather_data["temperature"],
            humidity=weather_data["humidity"],
            ph=request.ph,
            rainfall=weather_data["rainfall"]
        )

        
        y_scaled = model.predict(X)
        y_pred = scaler_y.inverse_transform(y_scaled)[0]
        
        N_val, P_val, K_val = float(y_pred[0]), float(y_pred[1]), float(y_pred[2])

        
        recomendacion_texto = recommend_fertilizer(crop_model_name, N_val, P_val, K_val)

        
        return {
            "success": True,
            "nutrientes_requeridos": {
                "N": round(N_val, 2),
                "P": round(P_val, 2),
                "K": round(K_val, 2)
            },
            "datos_clima": weather_data,
            "recomendacion": recomendacion_texto
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)