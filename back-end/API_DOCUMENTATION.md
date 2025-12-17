# 📚 Documentación API - AgroMind IA

**Versión**: 2.0.0  
**Base URL**: `http://localhost:8000`  
**Swagger UI**: `http://localhost:8000/docs`  
**ReDoc**: `http://localhost:8000/redoc`

---

## 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación. La mayoría de endpoints requieren autenticación.

### Header de Autenticación
```http
Authorization: Bearer <access_token>
```

---

## 📋 Índice de Endpoints

### 🔑 Autenticación
- [POST /auth/register](#post-authregister) - Registrar nuevo usuario
- [POST /auth/login](#post-authlogin) - Iniciar sesión
- [GET /auth/me](#get-authme) - Obtener perfil del usuario
- [POST /auth/refresh](#post-authrefresh) - Renovar token
- [POST /auth/change-password](#post-authchange-password) - Cambiar contraseña

### 🌾 Gestión de Cultivos
- [POST /crops](#post-crops) - Crear cultivo
- [GET /crops](#get-crops) - Listar cultivos
- [GET /crops/{id}](#get-cropsid) - Obtener cultivo por ID
- [PUT /crops/{id}](#put-cropsid) - Actualizar cultivo
- [DELETE /crops/{id}](#delete-cropsid) - Eliminar cultivo
- [GET /crops/{id}/predictions](#get-cropsidpredictions) - Predicciones del cultivo
- [GET /crops/{id}/hydro-recipes](#get-cropsidhydro-recipes) - Recetas hidropónicas del cultivo
- [GET /crops/{id}/stats](#get-cropsidstats) - Estadísticas del cultivo

### 🤖 Inteligencia Artificial
- [POST /predict-image](#post-predict-image) - Detección de enfermedades
- [POST /generate-recipe](#post-generate-recipe) - Receta hidropónica
- [POST /predict](#post-predict) - Recomendación de fertilizante

---

## 🔑 Endpoints de Autenticación

### POST /auth/register
Registrar un nuevo usuario en el sistema.

**URL**: `/auth/register`  
**Método**: `POST`  
**Autenticación**: No requerida

#### Request Body
```json
{
  "email": "usuario@example.com",
  "username": "usuario123",
  "password": "password_seguro"
}
```

#### Response (200 OK)
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "usuario123",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17T10:30:00"
}
```

#### Errores
- `400 Bad Request`: Email ya registrado o datos inválidos
- `422 Unprocessable Entity`: Formato de email inválido

---

### POST /auth/login
Iniciar sesión y obtener tokens de acceso.

**URL**: `/auth/login`  
**Método**: `POST`  
**Autenticación**: No requerida

#### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "password_seguro"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "usuario123",
    "is_active": true,
    "is_admin": false
  }
}
```

#### Errores
- `401 Unauthorized`: Credenciales incorrectas
- `403 Forbidden`: Usuario inactivo

---

### GET /auth/me
Obtener información del usuario autenticado.

**URL**: `/auth/me`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Response (200 OK)
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "usuario123",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17T10:30:00"
}
```

#### Errores
- `401 Unauthorized`: Token inválido o expirado

---

### POST /auth/refresh
Renovar el access token usando el refresh token.

**URL**: `/auth/refresh`  
**Método**: `POST`  
**Autenticación**: No requerida (usa refresh_token)

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Errores
- `401 Unauthorized`: Refresh token inválido o expirado

---

### POST /auth/change-password
Cambiar la contraseña del usuario autenticado.

**URL**: `/auth/change-password`  
**Método**: `POST`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "current_password": "password_actual",
  "new_password": "password_nuevo"
}
```

#### Response (200 OK)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### Errores
- `400 Bad Request`: Contraseña actual incorrecta
- `401 Unauthorized`: Token inválido

---

## 🌾 Endpoints de Gestión de Cultivos

### POST /crops
Crear un nuevo cultivo.

**URL**: `/crops`  
**Método**: `POST`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "name": "Tomates Cherry",
  "crop_type": "tomate",
  "location_lat": 4.6097,
  "location_long": -74.0817,
  "area": 250.5,
  "status": "active"
}
```

**Campos opcionales**: `location_lat`, `location_long`, `area`, `status` (default: "active")

#### Response (200 OK)
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Tomates Cherry",
  "crop_type": "tomate",
  "location_lat": 4.6097,
  "location_long": -74.0817,
  "area": 250.5,
  "status": "active",
  "created_at": "2025-12-17T10:30:00",
  "updated_at": "2025-12-17T10:30:00"
}
```

#### Errores
- `401 Unauthorized`: Token inválido
- `422 Unprocessable Entity`: Datos inválidos

---

### GET /crops
Listar todos los cultivos del usuario con filtros opcionales.

**URL**: `/crops`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Query Parameters (Opcionales)
- `crop_type` (string): Filtrar por tipo de cultivo
- `status` (string): Filtrar por estado (active, harvested, inactive)
- `skip` (int): Número de registros a saltar (paginación)
- `limit` (int): Número máximo de registros a devolver

**Ejemplo**: `/crops?crop_type=tomate&status=active&skip=0&limit=10`

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Tomates Cherry",
    "crop_type": "tomate",
    "location_lat": 4.6097,
    "location_long": -74.0817,
    "area": 250.5,
    "status": "active",
    "created_at": "2025-12-17T10:30:00",
    "updated_at": "2025-12-17T10:30:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "Lechugas Hidropónicas",
    "crop_type": "lechuga",
    "location_lat": 4.6097,
    "location_long": -74.0817,
    "area": 100.0,
    "status": "active",
    "created_at": "2025-12-17T11:00:00",
    "updated_at": "2025-12-17T11:00:00"
  }
]
```

---

### GET /crops/{id}
Obtener detalles de un cultivo específico.

**URL**: `/crops/{id}`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Response (200 OK)
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Tomates Cherry",
  "crop_type": "tomate",
  "location_lat": 4.6097,
  "location_long": -74.0817,
  "area": 250.5,
  "status": "active",
  "created_at": "2025-12-17T10:30:00",
  "updated_at": "2025-12-17T10:30:00"
}
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

### PUT /crops/{id}
Actualizar información de un cultivo.

**URL**: `/crops/{id}`  
**Método**: `PUT`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Request Body
```json
{
  "name": "Tomates Cherry Actualizados",
  "crop_type": "tomate",
  "location_lat": 4.6150,
  "location_long": -74.0800,
  "area": 300.0,
  "status": "active"
}
```

**Todos los campos son opcionales** - solo envía los que quieres actualizar.

#### Response (200 OK)
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Tomates Cherry Actualizados",
  "crop_type": "tomate",
  "location_lat": 4.6150,
  "location_long": -74.0800,
  "area": 300.0,
  "status": "active",
  "created_at": "2025-12-17T10:30:00",
  "updated_at": "2025-12-17T12:00:00"
}
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

### DELETE /crops/{id}
Eliminar un cultivo (y todas sus predicciones asociadas).

**URL**: `/crops/{id}`  
**Método**: `DELETE`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Response (200 OK)
```json
{
  "message": "Cultivo eliminado exitosamente"
}
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

### GET /crops/{id}/predictions
Obtener todas las predicciones de fertilizante de un cultivo.

**URL**: `/crops/{id}/predictions`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "crop_id": 1,
    "user_id": 1,
    "crop_name": "tomate",
    "ph": 6.5,
    "latitude": 4.6097,
    "longitude": -74.0817,
    "temperature": 25.3,
    "humidity": 65.2,
    "rainfall": 120.5,
    "nitrogen": 85.5,
    "phosphorus": 45.2,
    "potassium": 50.8,
    "recommendation": "Se recomienda fertilizante 20-10-10 para tomate",
    "created_at": "2025-12-17T10:30:00"
  }
]
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

### GET /crops/{id}/hydro-recipes
Obtener todas las recetas hidropónicas de un cultivo.

**URL**: `/crops/{id}/hydro-recipes`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "crop_id": 1,
    "user_id": 1,
    "crop_name": "lechuga",
    "week": 2,
    "tank_liters": 100,
    "ph_water": 6.0,
    "latitude": 4.6097,
    "longitude": -74.0817,
    "temperature": 22.5,
    "humidity": 70.0,
    "recipe_data": {
      "N": 150.5,
      "P": 50.2,
      "K": 200.8,
      "Ca": 180.0,
      "Mg": 50.0,
      "S": 70.0
    },
    "created_at": "2025-12-17T11:00:00"
  }
]
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

### GET /crops/{id}/stats
Obtener estadísticas resumidas de un cultivo.

**URL**: `/crops/{id}/stats`  
**Método**: `GET`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
- `id` (integer): ID del cultivo

#### Response (200 OK)
```json
{
  "crop_id": 1,
  "crop_name": "Tomates Cherry",
  "total_predictions": 15,
  "total_hydro_recipes": 8,
  "total_image_predictions": 5,
  "avg_nitrogen": 85.5,
  "avg_phosphorus": 45.2,
  "avg_potassium": 50.8,
  "latest_prediction": "2025-12-17T15:30:00",
  "disease_detections": {
    "sano": 3,
    "bacteria": 2
  }
}
```

#### Errores
- `404 Not Found`: Cultivo no encontrado o no pertenece al usuario

---

## 🤖 Endpoints de Inteligencia Artificial

### POST /predict-image
Detectar enfermedades en plantas mediante análisis de imagen.

**URL**: `/predict-image`  
**Método**: `POST`  
**Autenticación**: ✅ Requerida  
**Content-Type**: `multipart/form-data`

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Form Data
- `file` (file): Imagen de la planta (PNG, JPG, JPEG)
- `crop_id` (integer, opcional): ID del cultivo asociado

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "class": "Tomate_Sano",
    "confidence": "98.75%",
    "message": "Planta saludable detectada"
  },
  "prediction_id": 1,
  "saved": true
}
```

#### Errores
- `400 Bad Request`: Archivo no válido o formato incorrecto
- `401 Unauthorized`: Token inválido
- `500 Internal Server Error`: Error en el modelo de IA

---

### POST /generate-recipe
Generar receta de nutrientes para cultivo hidropónico.

**URL**: `/generate-recipe`  
**Método**: `POST`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Query Parameters (Opcionales)
- `crop_id` (integer): ID del cultivo (auto-completa crop, lat, long)

#### Request Body

**Opción 1 - Con crop_id** (recomendado):
```json
{
  "week": 2,
  "tank_liters": 100,
  "ph_water": 6.0
}
```

**Opción 2 - Sin crop_id** (manual):
```json
{
  "crop": "lechuga",
  "week": 2,
  "tank_liters": 100,
  "ph_water": 6.0,
  "lat": 4.6097,
  "long": -74.0817
}
```

#### Campos del Request Body
- `week` (integer, requerido): Semana del ciclo de cultivo
- `tank_liters` (float, requerido): Litros del tanque hidropónico
- `ph_water` (float, requerido): pH del agua
- `crop` (string, opcional*): Tipo de cultivo
- `lat` (float, opcional*): Latitud
- `long` (float, opcional*): Longitud

*Opcionales si se proporciona `crop_id`

#### Response (200 OK)
```json
{
  "success": true,
  "cultivo": "lechuga",
  "semana": 2,
  "tanque_litros": 100.0,
  "ph_agua": 6.0,
  "clima": {
    "temperature": 22.5,
    "humidity": 70.0
  },
  "receta_optimizada": {
    "N": 150.5,
    "P": 50.2,
    "K": 200.8,
    "Ca": 180.0,
    "Mg": 50.0,
    "S": 70.0
  },
  "recipe_id": 1,
  "saved": true
}
```

#### Errores
- `400 Bad Request`: Datos faltantes o inválidos
- `404 Not Found`: Cultivo no encontrado (si se usa crop_id)
- `500 Internal Server Error`: Error en el modelo de IA

---

### POST /predict
Generar recomendación de fertilizante para cultivo en suelo.

**URL**: `/predict`  
**Método**: `POST`  
**Autenticación**: ✅ Requerida

#### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Query Parameters (Opcionales)
- `crop_id` (integer): ID del cultivo (auto-completa crop, latitud, longitud)

#### Request Body

**Opción 1 - Con crop_id** (recomendado):
```json
{
  "ph": 6.5
}
```

**Opción 2 - Sin crop_id** (manual):
```json
{
  "crop": "tomate",
  "ph": 6.5,
  "latitud": 4.6097,
  "longitud": -74.0817
}
```

#### Campos del Request Body
- `ph` (float, requerido): pH del suelo
- `crop` (string, opcional*): Tipo de cultivo
- `latitud` (float, opcional*): Latitud
- `longitud` (float, opcional*): Longitud

*Opcionales si se proporciona `crop_id`

#### Response (200 OK)
```json
{
  "success": true,
  "nutrientes_requeridos": {
    "N": 85.5,
    "P": 45.2,
    "K": 50.8
  },
  "datos_clima": {
    "temperature": 25.3,
    "humidity": 65.2,
    "rainfall": 120.5
  },
  "recomendacion": "Se recomienda fertilizante 20-10-10 para tomate. Aplicar cada 15 días.",
  "prediction_id": 1,
  "saved": true
}
```

#### Errores
- `400 Bad Request`: Datos faltantes o inválidos
- `404 Not Found`: Cultivo no encontrado (si se usa crop_id)
- `500 Internal Server Error`: Error en el modelo de IA

---

## 📊 Tipos de Cultivos Soportados

### Cultivos Hidropónicos
```
rúcula, albahaca, frijol, cilantro, pepino, berenjena, lechuga, 
melón, menta, pak choi, pimiento, espinaca, fresa, tomate, calabacín
```

### Cultivos en Suelo
```
cafe, arroz, maiz, banano, platano, manzana, frijol, frijoles, 
papaya, sandia, uvas, mango, naranja, limon, algodon, coco
```

---

## 🔒 Seguridad

### Tokens JWT
- **Access Token**: Válido por 24 horas
- **Refresh Token**: Válido por 7 días
- **Algoritmo**: HS256
- **Header**: `Authorization: Bearer <token>`

### Validaciones
- Emails únicos por usuario
- Contraseñas hasheadas con bcrypt
- Tokens firmados y verificados
- Validación de propiedad de recursos (un usuario solo puede ver/editar sus propios cultivos)

---

## 📝 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos o faltantes |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Acceso denegado |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

---

## 🚀 Ejemplo de Flujo de Trabajo

### 1. Registro e Inicio de Sesión
```javascript
// Registrar usuario
const registerResponse = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'agricultor@example.com',
    username: 'agricultor1',
    password: 'password123'
  })
});

// Iniciar sesión
const loginResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'agricultor@example.com',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();
```

### 2. Crear un Cultivo
```javascript
const createCropResponse = await fetch('http://localhost:8000/crops', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    name: 'Tomates del Jardín',
    crop_type: 'tomate',
    location_lat: 4.6097,
    location_long: -74.0817,
    area: 150.0,
    status: 'active'
  })
});

const crop = await createCropResponse.json();
const cropId = crop.id;
```

### 3. Generar Recomendación (usando crop_id)
```javascript
// Recomendación de fertilizante
const predictResponse = await fetch(`http://localhost:8000/predict?crop_id=${cropId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    ph: 6.5
  })
});

const prediction = await predictResponse.json();
console.log('Nutrientes requeridos:', prediction.nutrientes_requeridos);
console.log('Recomendación:', prediction.recomendacion);
```

### 4. Detectar Enfermedades
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('crop_id', cropId);

const imageResponse = await fetch('http://localhost:8000/predict-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`
  },
  body: formData
});

const result = await imageResponse.json();
console.log('Diagnóstico:', result.data.class);
console.log('Confianza:', result.data.confidence);
```

### 5. Ver Historial
```javascript
// Obtener todas las predicciones del cultivo
const historyResponse = await fetch(`http://localhost:8000/crops/${cropId}/predictions`, {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const predictions = await historyResponse.json();
console.log('Historial de predicciones:', predictions);
```

---

## 🌐 CORS

La API acepta solicitudes desde cualquier origen por defecto (`*`).  
Puedes configurar orígenes específicos en el archivo `.env`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://mi-app.com
```

---

## 🐛 Debugging

### Ver documentación interactiva
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Verificar estado de la API
```bash
curl http://localhost:8000/
```

### Probar autenticación
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

---

## 📞 Soporte

Para más información, consulta:
- **Swagger UI**: `/docs` para probar endpoints en vivo
- **Código fuente**: Revisa `api.py`, `routes/auth.py`, `routes/crops.py`
- **Autenticación**: Revisa `README_AUTH.md`

---

**Última actualización**: 17 de diciembre de 2025  
**Desarrollado con**: FastAPI + TensorFlow + PostgreSQL
