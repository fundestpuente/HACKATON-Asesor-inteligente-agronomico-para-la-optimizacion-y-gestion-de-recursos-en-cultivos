import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

# --- 1. CONFIGURACIÓN DE RUTAS ---
# Obtenemos la ruta absoluta de donde está ESTE archivo script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Definimos la ruta del modelo:
# ".." significa subir un nivel (salir de 'model' a 'back-end')
# Luego entramos a 'training_models'
MODEL_PATH = os.path.join(BASE_DIR, "..", "training_models", "detector_de_imagen.h5")

print(f"📷 Buscando modelo de visión en: {MODEL_PATH}")

model = None

# --- 2. CARGA DEL MODELO ---
try:
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
        print("✅ Modelo de imágenes cargado correctamente.")
    else:
        print(f"❌ Error CRÍTICO: No se encuentra el archivo en {MODEL_PATH}")
        print("   -> Verifica que moviste 'detector_de_imagen.h5' a la carpeta 'training_models'.")
except Exception as e:
    print(f"❌ Error cargando el modelo de imágenes: {e}")

# --- 3. DICCIONARIO DE CLASES ---
# Asegúrate de que este orden coincida con cómo entrenaste tu modelo
class_names = {
    0: 'Papa_Sana',
    1: 'Papa_Tizon_Tardia', # Ajustado el nombre para ser más claro
    2: 'Pimiento_Bacteriosis',
    3: 'Pimiento_Sano',
    4: 'Tomate_Bacteriosis',
    5: 'Tomate_Sano'
}

# --- 4. FUNCIÓN DE PREDICCIÓN ---
def predict_disease(image_path):
    if model is None:
        return {"error": "El modelo de imágenes no está cargado. Revisa la consola del servidor."}

    try:
        # AQUI ESTABA EL ERROR ANTERIOR:
        # Cambiamos target_size a (224, 224) porque así lo pide tu modelo
        img = image.load_img(image_path, target_size=(224, 224))
        
        # Convertir a array y preprocesar
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # Normalizar píxeles entre 0 y 1

        # Realizar la predicción
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions)
        
        # Obtener confianza (probabilidad más alta)
        confidence_val = np.max(predictions) * 100

        # Obtener nombre de la etiqueta
        class_name = class_names.get(predicted_class_idx, "Desconocido")
        
        return {
            "class": class_name,
            "confidence": f"{confidence_val:.2f}%"
        }

    except Exception as e:
        return {"error": f"Error procesando la imagen: {str(e)}"}