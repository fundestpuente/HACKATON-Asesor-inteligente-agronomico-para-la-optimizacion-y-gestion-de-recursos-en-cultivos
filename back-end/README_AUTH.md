# 🌱 AgroMind - Sistema de Autenticación y Gestión de Cultivos

## 📋 Descripción

Sistema completo de autenticación JWT y gestión de cultivos para la API de AgroMind. Permite a los usuarios registrarse, iniciar sesión y gestionar sus cultivos con todas las predicciones y recetas asociadas.

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### **users** - Usuarios del sistema
- `id`: ID único del usuario
- `email`: Email único
- `username`: Nombre de usuario único
- `hashed_password`: Contraseña hasheada (bcrypt)
- `full_name`: Nombre completo (opcional)
- `is_active`: Usuario activo/inactivo
- `is_admin`: Usuario administrador
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### **crops** - Cultivos del usuario
- `id`: ID único del cultivo
- `user_id`: Referencia al usuario propietario
- `name`: Nombre del cultivo (ej: "Tomate", "Lechuga")
- `crop_type`: Tipo (`hydroponic` o `soil`)
- `location_lat`, `location_long`: Coordenadas GPS
- `area`: Área en m² o hectáreas
- `planting_date`: Fecha de siembra
- `harvest_date`: Fecha de cosecha
- `status`: Estado (`active`, `harvested`, `abandoned`)
- `notes`: Notas adicionales

#### **predictions** - Predicciones de fertilizante (suelo)
- `id`: ID único
- `user_id`: Usuario que hizo la predicción
- `crop_id`: Cultivo asociado (opcional)
- `crop_name`: Nombre del cultivo
- `ph`, `latitude`, `longitude`: Datos de entrada
- `temperature`, `humidity`, `rainfall`: Datos climáticos
- `nitrogen`, `phosphorus`, `potassium`: Resultados NPK
- `recommendation`: Texto de recomendación
- `created_at`: Fecha de creación

#### **hydro_recipes** - Recetas hidropónicas
- `id`: ID único
- `user_id`: Usuario que generó la receta
- `crop_id`: Cultivo asociado (opcional)
- `crop_name`: Nombre del cultivo
- `week`, `tank_liters`, `ph_water`: Datos de entrada
- `latitude`, `longitude`: Coordenadas
- `temperature`, `humidity`: Datos climáticos
- `target_nitrogen`, `target_phosphorus`, `target_potassium`, `target_ec`: Objetivos
- `recipe_data`: JSON con la receta completa (mix_A y mix_B)
- `created_at`: Fecha de creación

#### **image_predictions** - Predicciones de enfermedades por imagen
- `id`: ID único
- `user_id`: Usuario que subió la imagen
- `crop_id`: Cultivo asociado (opcional)
- `predicted_class`: Clase predicha
- `confidence`: Nivel de confianza
- `original_filename`: Nombre del archivo original
- `created_at`: Fecha de creación

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```powershell
# Activar entorno virtual (si usas uno)
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tus valores:

```powershell
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
DB_URL=postgresql://usuario:contraseña@host:puerto/nombre_bd
JWT_SECRET=tu_secreto_muy_largo_y_seguro_123456789
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com
ENV=development
```

### 3. Inicializar Base de Datos

```powershell
python init_db.py
```

Este script creará todas las tablas necesarias en tu base de datos PostgreSQL (Neon).

### 4. Ejecutar la API

```powershell
python api.py
```

O usando uvicorn directamente:
```powershell
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## 🔐 Endpoints de Autenticación

### Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "password": "contraseña_segura",
  "full_name": "Juan Pérez"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "full_name": "Juan Pérez",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17T10:00:00"
}
```

### Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "contraseña_segura"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Obtener Usuario Actual
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Actualizar Usuario
```http
PUT /auth/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "full_name": "Juan Carlos Pérez"
}
```

### Cambiar Contraseña
```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "contraseña_actual",
  "new_password": "nueva_contraseña_segura"
}
```

### Refrescar Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🌾 Endpoints de Cultivos

### Crear Cultivo
```http
POST /crops
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Tomate Cherry",
  "crop_type": "hydroponic",
  "location_lat": 4.6097,
  "location_long": -74.0817,
  "area": 50.5,
  "planting_date": "2025-01-15T00:00:00",
  "notes": "Variedad cherry, sistema NFT"
}
```

### Listar Mis Cultivos
```http
GET /crops?status=active&crop_type=hydroponic
Authorization: Bearer <access_token>
```

Parámetros de query opcionales:
- `status`: `active`, `harvested`, `abandoned`
- `crop_type`: `hydroponic`, `soil`

### Obtener Cultivo Específico
```http
GET /crops/{crop_id}
Authorization: Bearer <access_token>
```

### Actualizar Cultivo
```http
PUT /crops/{crop_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "harvested",
  "harvest_date": "2025-03-20T00:00:00",
  "notes": "Cosecha exitosa, 50kg producidos"
}
```

### Eliminar Cultivo
```http
DELETE /crops/{crop_id}
Authorization: Bearer <access_token>
```

### Historial de Predicciones del Cultivo
```http
GET /crops/{crop_id}/predictions
Authorization: Bearer <access_token>
```

### Historial de Recetas Hidropónicas
```http
GET /crops/{crop_id}/hydro-recipes
Authorization: Bearer <access_token>
```

### Historial de Predicciones de Imagen
```http
GET /crops/{crop_id}/image-predictions
Authorization: Bearer <access_token>
```

### Estadísticas del Cultivo
```http
GET /crops/{crop_id}/stats
Authorization: Bearer <access_token>
```

## 🤖 Endpoints de IA (Ahora con Autenticación)

### Predicción de Fertilizante
```http
POST /predict?crop_id=1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "crop": "tomate",
  "ph": 6.5,
  "latitud": 4.6097,
  "longitud": -74.0817
}
```

### Receta Hidropónica
```http
POST /generate-recipe?crop_id=1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "crop": "lechuga",
  "week": 3,
  "tank_liters": 100,
  "ph_water": 6.0,
  "lat": 4.6097,
  "long": -74.0817
}
```

### Detección de Enfermedad por Imagen
```http
POST /predict-image?crop_id=1
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <archivo_imagen>
```

## 🔒 Seguridad

### Tokens JWT
- **Access Token**: Válido por 24 horas
- **Refresh Token**: Válido por 7 días
- Los tokens se firman con el secreto definido en `JWT_SECRET`

### Contraseñas
- Se hashean con bcrypt antes de guardarlas
- Nunca se almacenan en texto plano
- Requieren mínimo 6 caracteres

### Protección de Rutas
- Todos los endpoints de IA requieren autenticación
- Los cultivos solo son accesibles por su propietario
- Las predicciones se asocian automáticamente al usuario

## 📊 Flujo de Trabajo Típico

1. **Registro**: Usuario se registra con email y contraseña
2. **Login**: Usuario obtiene access_token y refresh_token
3. **Crear Cultivo**: Usuario crea un cultivo (ej: "Tomate Invernadero")
4. **Usar IA**: Usuario hace predicciones asociadas a su cultivo
5. **Consultar Historial**: Usuario ve todas las predicciones de ese cultivo
6. **Actualizar Estado**: Al cosechar, cambia el estado del cultivo

## 🛠️ Desarrollo

### Estructura de Carpetas
```
back-end/
├── database/          # Modelos y configuración de DB
│   ├── __init__.py
│   ├── database.py    # Configuración SQLAlchemy
│   └── models.py      # Modelos de datos
├── schemas/           # Esquemas Pydantic
│   ├── __init__.py
│   ├── auth.py        # Esquemas de autenticación
│   └── crops.py       # Esquemas de cultivos
├── auth/              # Utilidades de autenticación
│   ├── __init__.py
│   └── utils.py       # JWT, hash, dependencias
├── routes/            # Rutas de la API
│   ├── __init__.py
│   ├── auth.py        # Rutas de autenticación
│   └── crops.py       # Rutas de cultivos
├── model/             # Modelos de IA
├── api.py             # Aplicación principal
├── init_db.py         # Script de inicialización
└── .env               # Variables de entorno
```

## 🔧 Comandos Útiles

```powershell
# Crear tablas en DB
python init_db.py

# Ejecutar API en desarrollo
uvicorn api:app --reload

# Ejecutar API en producción
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4

# Ver documentación interactiva
# Abrir en navegador: http://localhost:8000/docs
```

## 📝 Notas Importantes

1. **Primera Ejecución**: Ejecuta `init_db.py` antes de usar la API
2. **JWT_SECRET**: Cambia el secreto en producción a algo largo y aleatorio
3. **CORS**: Configura `ALLOWED_ORIGINS` solo con dominios confiables en producción
4. **Base de Datos**: Asegúrate de que la URL de Neon PostgreSQL sea correcta
5. **Migraciones**: Para cambios en modelos, considera usar Alembic

## 🐛 Troubleshooting

### Error: "DB_URL no está configurada"
- Verifica que el archivo `.env` existe y tiene `DB_URL`

### Error: "Token inválido"
- El token expiró, usa el refresh token para obtener uno nuevo
- Verifica que el header sea: `Authorization: Bearer <token>`

### Error: "Usuario no encontrado"
- El token es válido pero el usuario fue eliminado
- Inicia sesión nuevamente

### Error al crear tablas
- Verifica la conexión a PostgreSQL
- Revisa permisos del usuario de base de datos

## 📚 Recursos Adicionales

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **JWT**: https://jwt.io
- **Neon PostgreSQL**: https://neon.tech/docs

---

**Desarrollado para AgroMind** 🌱
Versión 2.0.0 - Sistema con Autenticación
