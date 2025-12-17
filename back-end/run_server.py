#!/usr/bin/env python3
"""
Script para ejecutar el servidor FastAPI con opciones personalizadas.
Permite cambiar el host y puerto de forma sencilla.
"""

import sys
import os
from dotenv import load_dotenv
import uvicorn

# Cargar variables de entorno
load_dotenv()

# Importar la aplicación
from api import app

def main():
    """
    Ejecuta el servidor con parámetros configurables.
    
    Uso:
        python run_server.py                              # Host: 192.168.100.31, Port: 8000
        python run_server.py --host 0.0.0.0              # Escucha en todas las interfaces
        python run_server.py --host localhost            # Solo localhost
        python run_server.py --port 5000                 # Puerto diferente
        python run_server.py --host 0.0.0.0 --port 5000 # Ambos parámetros
        python run_server.py --reload                     # Con auto-reload en desarrollo
    """
    
    # Valores por defecto
    host = "192.168.100.31"  # IP de tu equipo en la red
    port = 8000
    reload = False
    
    # Parsear argumentos de línea de comandos
    for i, arg in enumerate(sys.argv[1:]):
        if arg == "--host" and i + 1 < len(sys.argv) - 1:
            host = sys.argv[i + 2]
        elif arg == "--port" and i + 1 < len(sys.argv) - 1:
            try:
                port = int(sys.argv[i + 2])
            except ValueError:
                print(f"❌ Error: El puerto debe ser un número, recibido: {sys.argv[i + 2]}")
                sys.exit(1)
        elif arg == "--reload":
            reload = True
    
    print("\n" + "="*60)
    print("🚀 INICIANDO SERVIDOR AGROMIND IA")
    print("="*60)
    print(f"Host:       {host}")
    print(f"Puerto:     {port}")
    print(f"URL:        http://{host}:{port}")
    print(f"Swagger UI: http://{host}:{port}/docs")
    print(f"ReDoc:      http://{host}:{port}/redoc")
    print(f"Reload:     {'Sí' if reload else 'No'}")
    print("="*60 + "\n")
    
    try:
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
