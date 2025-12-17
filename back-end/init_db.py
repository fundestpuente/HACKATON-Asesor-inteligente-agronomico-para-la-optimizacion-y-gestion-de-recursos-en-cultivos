"""
Script para inicializar la base de datos.
Crea todas las tablas definidas en los modelos.
"""
from database.database import Base, engine
from database.models import User, Crop, Prediction, HydroRecipe, ImagePrediction

def init_db():
    """Crear todas las tablas en la base de datos"""
    print("🔧 Iniciando creación de tablas...")
    
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente:")
        print("   - users")
        print("   - crops")
        print("   - predictions")
        print("   - hydro_recipes")
        print("   - image_predictions")
        print("\n🎉 Base de datos inicializada correctamente")
        
    except Exception as e:
        print(f"❌ Error al crear las tablas: {e}")
        raise

if __name__ == "__main__":
    init_db()
