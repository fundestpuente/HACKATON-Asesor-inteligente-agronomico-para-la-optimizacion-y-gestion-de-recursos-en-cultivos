# 📋 Documentación Detallada: Request/Response de Rutas - AgroMind IA

> **Última Actualización:** 17 de diciembre de 2025  
> **Backend:** FastAPI + PostgreSQL  
> **Base URL:** `http://192.168.100.31:8000`  
> **Documentación Interactiva:** `http://192.168.100.31:8000/docs`

---

## 📑 Tabla de Contenidos

1. [Rutas de Autenticación](#rutas-de-autenticación)
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh-token
   - GET /auth/me
   - PUT /auth/change-password

2. [Rutas de Cultivos](#rutas-de-cultivos)
   - GET /crops
   - POST /crops
   - GET /crops/{crop_id}
   - PUT /crops/{crop_id}
   - DELETE /crops/{crop_id}

3. [Rutas de IA/Predicciones](#rutas-de-iaméreodicciones)
   - POST /predict
   - POST /generate-recipe
   - POST /predict-image

4. [Headers y Autenticación](#headers-y-autenticación)
5. [Códigos de Estado HTTP](#códigos-de-estado-http)
6. [Validaciones Comunes](#validaciones-comunes)

---

## 🔐 Rutas de Autenticación

### 1️⃣ POST /auth/register

**Crear una nueva cuenta de usuario**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/auth/register
Content-Type: application/json
```

#### 📥 Request Body

```json
{
  "email": "usuario@example.com",
  "username": "juanperez",
  "password": "MiPassword123!"
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| email | string | ✅ Sí | Email único del usuario | Email válido, máx 255 caracteres |
| username | string | ✅ Sí | Nombre de usuario único | 3-50 caracteres, sin espacios |
| password | string | ✅ Sí | Contraseña | Mínimo 8 caracteres |

#### ✅ Response Exitosa (201 Created)

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "juanperez",
    "is_active": true,
    "is_admin": false,
    "created_at": "2025-12-17T14:30:45.123456"
  }
}
```

#### ❌ Errores Posibles

**400 Bad Request - Email ya registrado**
```json
{
  "detail": "El email ya está registrado"
}
```

**400 Bad Request - Username ya en uso**
```json
{
  "detail": "El username ya está en uso"
}
```

**422 Unprocessable Entity - Datos inválidos**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "detail": "Error al registrar usuario"
}
```

#### 📝 Ejemplo en TypeScript (Axios)

```typescript
const registerUser = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/auth/register',
      {
        email,
        username,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

#### 🔗 Ejemplo en cURL

```bash
curl -X POST "http://192.168.100.31:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "username": "juanperez",
    "password": "MiPassword123!"
  }'
```

---

### 2️⃣ POST /auth/login

**Autenticar usuario y obtener tokens JWT**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/auth/login
Content-Type: application/json
```

#### 📥 Request Body

```json
{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | ✅ Sí | Email registrado |
| password | string | ✅ Sí | Contraseña |

#### ✅ Response Exitosa (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjM1MzQzMjQ1LCJleHAiOjE2MzUzNzMyNDV9.xxx",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjM1MzQzMjQ1LCJleHAiOjE2MzU5NDgyNDV9.yyy",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "juanperez",
    "is_active": true,
    "is_admin": false
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| access_token | string | Token JWT para hacer requests (válido 24 horas) |
| refresh_token | string | Token para renovar access_token (válido 7 días) |
| token_type | string | Tipo de token ("bearer") |
| expires_in | number | Segundos hasta expiración (86400 = 24h) |
| user | object | Datos del usuario autenticado |

#### ❌ Errores Posibles

**401 Unauthorized - Credenciales inválidas**
```json
{
  "detail": "Email o contraseña incorrectos"
}
```

**400 Bad Request - Usuario no existe**
```json
{
  "detail": "Usuario no encontrado"
}
```

**403 Forbidden - Usuario inactivo**
```json
{
  "detail": "Usuario inactivo"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/auth/login',
      { email, password }
    );

    // Guardar tokens en AsyncStorage
    await AsyncStorage.setItem('access_token', response.data.access_token);
    await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

#### 🔗 Ejemplo en cURL

```bash
curl -X POST "http://192.168.100.31:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123!"
  }'
```

---

### 3️⃣ POST /auth/refresh-token

**Renovar el access_token usando el refresh_token**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/auth/refresh-token
Content-Type: application/json
Authorization: Bearer {refresh_token}
```

#### 📥 Request Body

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| refresh_token | string | ✅ Sí | Token de renovación obtenido en login |

#### ✅ Response Exitosa (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjM1MzQzNjQ1LCJleHAiOjE2MzUzNzM2NDV9.zzz",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### ❌ Errores Posibles

**401 Unauthorized - Token inválido o expirado**
```json
{
  "detail": "Token de renovación inválido o expirado"
}
```

**422 Unprocessable Entity - Token no proporcionado**
```json
{
  "detail": "Refresh token requerido"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/auth/refresh-token',
      { refresh_token: refreshToken }
    );

    // Actualizar token en AsyncStorage
    await AsyncStorage.setItem('access_token', response.data.access_token);

    return response.data;
  } catch (error: any) {
    // Si falla, usuario necesita login de nuevo
    throw error.response.data;
  }
};
```

---

### 4️⃣ GET /auth/me

**Obtener datos del usuario autenticado**

#### 📌 Endpoint
```
GET http://192.168.100.31:8000/auth/me
Authorization: Bearer {access_token}
```

#### 📥 Request Body
❌ No requiere body

#### ✅ Response Exitosa (200 OK)

```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "juanperez",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17T14:30:45.123456",
  "updated_at": "2025-12-17T14:30:45.123456"
}
```

#### ❌ Errores Posibles

**401 Unauthorized - Token no válido**
```json
{
  "detail": "No autorizado"
}
```

**401 Unauthorized - Token expirado**
```json
{
  "detail": "Token expirado, usa refresh-token"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const getCurrentUser = async (accessToken: string) => {
  try {
    const response = await axios.get(
      'http://192.168.100.31:8000/auth/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response.status === 401) {
      // Token expirado, refrescar
      // ... llamar a refreshAccessToken
    }
    throw error.response.data;
  }
};
```

---

### 5️⃣ PUT /auth/change-password

**Cambiar contraseña del usuario autenticado**

#### 📌 Endpoint
```
PUT http://192.168.100.31:8000/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 📥 Request Body

```json
{
  "old_password": "MiPasswordViejo123!",
  "new_password": "MiPasswordNuevo456!"
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| old_password | string | ✅ Sí | Contraseña actual | Mínimo 8 caracteres |
| new_password | string | ✅ Sí | Nueva contraseña | Mínimo 8 caracteres, debe ser diferente |

#### ✅ Response Exitosa (200 OK)

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### ❌ Errores Posibles

**400 Bad Request - Contraseña antigua incorrecta**
```json
{
  "detail": "Contraseña antigua incorrecta"
}
```

**400 Bad Request - Nueva contraseña igual a la anterior**
```json
{
  "detail": "La nueva contraseña debe ser diferente"
}
```

**401 Unauthorized**
```json
{
  "detail": "No autorizado"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const changePassword = async (
  oldPassword: string,
  newPassword: string,
  accessToken: string
) => {
  try {
    const response = await axios.put(
      'http://192.168.100.31:8000/auth/change-password',
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

---

## 🌾 Rutas de Cultivos

### 6️⃣ GET /crops

**Obtener lista de cultivos del usuario**

#### 📌 Endpoint
```
GET http://192.168.100.31:8000/crops?limit=10&offset=0
Authorization: Bearer {access_token}
```

#### 📥 Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Valor por Defecto |
|-----------|------|-----------|-------------|-------------------|
| limit | integer | ❌ No | Cantidad de cultivos a retornar | 10 |
| offset | integer | ❌ No | Posición de inicio (paginación) | 0 |

#### ✅ Response Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Papa - Parcela A",
    "crop_type": "papa",
    "location_lat": 12.456789,
    "location_long": -76.543210,
    "area": 50.5,
    "status": "active",
    "created_at": "2025-12-10T08:30:00.000000",
    "updated_at": "2025-12-17T14:22:15.000000"
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "Tomate - Invernadero",
    "crop_type": "tomate",
    "location_lat": 12.457890,
    "location_long": -76.544320,
    "area": 30.0,
    "status": "active",
    "created_at": "2025-12-12T10:15:30.000000",
    "updated_at": "2025-12-17T09:45:22.000000"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer | ID único del cultivo |
| user_id | integer | ID del usuario propietario |
| name | string | Nombre del cultivo |
| crop_type | string | Tipo de cultivo (papa, tomate, etc.) |
| location_lat | float | Latitud de ubicación |
| location_long | float | Longitud de ubicación |
| area | float | Área del cultivo en m² |
| status | string | Estado: "active", "harvested", "failed" |
| created_at | string | Fecha de creación (ISO 8601) |
| updated_at | string | Última actualización (ISO 8601) |

#### ❌ Errores Posibles

**401 Unauthorized**
```json
{
  "detail": "No autorizado"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const getCrops = async (
  accessToken: string,
  limit: number = 10,
  offset: number = 0
) => {
  try {
    const response = await axios.get(
      'http://192.168.100.31:8000/crops',
      {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Uso con paginación
const crops = await getCrops(token, 10, 0); // Primera página
const moreCrops = await getCrops(token, 10, 10); // Segunda página
```

#### 🔗 Ejemplo en cURL

```bash
curl -X GET "http://192.168.100.31:8000/crops?limit=10&offset=0" \
  -H "Authorization: Bearer tu_access_token"
```

---

### 7️⃣ POST /crops

**Crear un nuevo cultivo**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/crops
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 📥 Request Body

```json
{
  "name": "Papa - Parcela B",
  "crop_type": "papa",
  "location_lat": 12.456789,
  "location_long": -76.543210,
  "area": 75.5
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| name | string | ✅ Sí | Nombre del cultivo | Máx 255 caracteres |
| crop_type | string | ✅ Sí | Tipo de cultivo | Ver lista de tipos válidos |
| location_lat | float | ❌ No | Latitud | -90 a 90 |
| location_long | float | ❌ No | Longitud | -180 a 180 |
| area | float | ❌ No | Área en m² | Mayor que 0 |

**Tipos de cultivo válidos:**
```
papa, tomate, lechuga, maiz, arroz, frijol, zanahoria, 
cebolla, pimiento, pepino, sandía, melón, calabaza
```

#### ✅ Response Exitosa (201 Created)

```json
{
  "id": 3,
  "user_id": 1,
  "name": "Papa - Parcela B",
  "crop_type": "papa",
  "location_lat": 12.456789,
  "location_long": -76.543210,
  "area": 75.5,
  "status": "active",
  "created_at": "2025-12-17T15:10:30.123456",
  "updated_at": "2025-12-17T15:10:30.123456"
}
```

#### ❌ Errores Posibles

**400 Bad Request - Tipo de cultivo inválido**
```json
{
  "detail": "Tipo de cultivo no válido"
}
```

**422 Unprocessable Entity - Datos faltantes o inválidos**
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "detail": "No autorizado"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
interface CreateCropData {
  name: string;
  crop_type: string;
  location_lat?: number;
  location_long?: number;
  area?: number;
}

const createCrop = async (
  cropData: CreateCropData,
  accessToken: string
) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/crops',
      cropData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Uso
const newCrop = await createCrop(
  {
    name: 'Papa - Parcela B',
    crop_type: 'papa',
    location_lat: 12.456789,
    location_long: -76.543210,
    area: 75.5,
  },
  accessToken
);
```

---

### 8️⃣ GET /crops/{crop_id}

**Obtener detalles de un cultivo específico**

#### 📌 Endpoint
```
GET http://192.168.100.31:8000/crops/1
Authorization: Bearer {access_token}
```

#### 📥 Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| crop_id | integer | ID del cultivo |

#### ✅ Response Exitosa (200 OK)

```json
{
  "id": 1,
  "user_id": 1,
  "name": "Papa - Parcela A",
  "crop_type": "papa",
  "location_lat": 12.456789,
  "location_long": -76.543210,
  "area": 50.5,
  "status": "active",
  "created_at": "2025-12-10T08:30:00.000000",
  "updated_at": "2025-12-17T14:22:15.000000"
}
```

#### ❌ Errores Posibles

**404 Not Found - Cultivo no existe**
```json
{
  "detail": "Cultivo no encontrado"
}
```

**403 Forbidden - No es propietario del cultivo**
```json
{
  "detail": "No tienes permiso para acceder a este cultivo"
}
```

**401 Unauthorized**
```json
{
  "detail": "No autorizado"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const getCropDetail = async (cropId: number, accessToken: string) => {
  try {
    const response = await axios.get(
      `http://192.168.100.31:8000/crops/${cropId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

---

### 9️⃣ PUT /crops/{crop_id}

**Actualizar información de un cultivo**

#### 📌 Endpoint
```
PUT http://192.168.100.31:8000/crops/1
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 📥 Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| crop_id | integer | ID del cultivo a actualizar |

#### 📥 Request Body

```json
{
  "name": "Papa - Parcela A (Mejorada)",
  "crop_type": "papa",
  "location_lat": 12.456789,
  "location_long": -76.543210,
  "area": 55.0,
  "status": "active"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | ❌ No | Nuevo nombre |
| crop_type | string | ❌ No | Nuevo tipo |
| location_lat | float | ❌ No | Nueva latitud |
| location_long | float | ❌ No | Nueva longitud |
| area | float | ❌ No | Nueva área |
| status | string | ❌ No | Nuevo estado |

#### ✅ Response Exitosa (200 OK)

```json
{
  "id": 1,
  "user_id": 1,
  "name": "Papa - Parcela A (Mejorada)",
  "crop_type": "papa",
  "location_lat": 12.456789,
  "location_long": -76.543210,
  "area": 55.0,
  "status": "active",
  "created_at": "2025-12-10T08:30:00.000000",
  "updated_at": "2025-12-17T15:45:22.000000"
}
```

#### ❌ Errores Posibles

**404 Not Found**
```json
{
  "detail": "Cultivo no encontrado"
}
```

**403 Forbidden**
```json
{
  "detail": "No tienes permiso para actualizar este cultivo"
}
```

**422 Unprocessable Entity - Datos inválidos**
```json
{
  "detail": [
    {
      "loc": ["body", "area"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const updateCrop = async (
  cropId: number,
  updateData: Partial<CreateCropData>,
  accessToken: string
) => {
  try {
    const response = await axios.put(
      `http://192.168.100.31:8000/crops/${cropId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Uso - actualizar solo el nombre
await updateCrop(
  1,
  { name: 'Papa - Parcela A (Mejorada)' },
  accessToken
);
```

---

### 🔟 DELETE /crops/{crop_id}

**Eliminar un cultivo**

#### 📌 Endpoint
```
DELETE http://192.168.100.31:8000/crops/1
Authorization: Bearer {access_token}
```

#### 📥 Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| crop_id | integer | ID del cultivo a eliminar |

#### ✅ Response Exitosa (200 OK)

```json
{
  "message": "Cultivo eliminado exitosamente"
}
```

#### ❌ Errores Posibles

**404 Not Found**
```json
{
  "detail": "Cultivo no encontrado"
}
```

**403 Forbidden**
```json
{
  "detail": "No tienes permiso para eliminar este cultivo"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const deleteCrop = async (cropId: number, accessToken: string) => {
  try {
    const response = await axios.delete(
      `http://192.168.100.31:8000/crops/${cropId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

---

## 📊 Rutas de IA/Predicciones

### 1️⃣1️⃣ POST /predict

**Predecir nutrientes (NPK) necesarios para un cultivo**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/predict
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 📥 Request Body - Opción 1: Con crop_id

```json
{
  "crop_id": 1,
  "ph": 6.5
}
```

#### 📥 Request Body - Opción 2: Sin crop_id

```json
{
  "crop_name": "papa",
  "ph": 6.5,
  "latitude": 12.456789,
  "longitude": -76.543210
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| crop_id | integer | ❓ Sí/No* | ID del cultivo en BD | - |
| crop_name | string | ❓ Sí/No* | Nombre del cultivo | Si no hay crop_id |
| ph | float | ✅ Sí | pH del suelo | 0-14 |
| latitude | float | ❌ No | Latitud para obtener clima | Si no está en crop_id |
| longitude | float | ❌ No | Longitud para obtener clima | Si no está en crop_id |

*Debe proporcionarse crop_id O la combinación de crop_name + latitude + longitude

#### ✅ Response Exitosa (200 OK)

```json
{
  "success": true,
  "cultivo": "papa",
  "ph_del_suelo": 6.5,
  "nutrientes_requeridos": {
    "N": 120.5,
    "P": 45.2,
    "K": 95.8
  },
  "datos_clima": {
    "temperature": 28.5,
    "humidity": 65.2,
    "rainfall": 120.5,
    "wind_speed": 12.3
  },
  "recomendacion": "Para papa con pH 6.5, se recomienda aplicar fertilizante NPK 12-45-95. La temperatura actual (28.5°C) es ideal para el crecimiento. Mantén la humedad entre 60-70% para óptimos resultados.",
  "prediction_id": 1,
  "timestamp": "2025-12-17T15:50:00.000000"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| success | boolean | Indica si la predicción fue exitosa |
| cultivo | string | Nombre del cultivo predicho |
| ph_del_suelo | float | pH ingresado |
| nutrientes_requeridos | object | N, P, K en kg/ha |
| datos_clima | object | Temperatura (°C), humedad (%), lluvia (mm), viento (km/h) |
| recomendacion | string | Texto con recomendación detallada |
| prediction_id | integer | ID de la predicción guardada en BD |
| timestamp | string | Fecha/hora de la predicción (ISO 8601) |

#### ❌ Errores Posibles

**400 Bad Request - Cultivo no encontrado**
```json
{
  "detail": "Cultivo con ID 999 no encontrado"
}
```

**400 Bad Request - pH inválido**
```json
{
  "detail": "pH debe estar entre 0 y 14"
}
```

**422 Unprocessable Entity - Datos incompletos**
```json
{
  "detail": "Debes proporcionar crop_id O (crop_name + latitude + longitude)"
}
```

**500 Internal Server Error - Error en modelo**
```json
{
  "detail": "Error al procesar la predicción. Intenta de nuevo."
}
```

#### 📝 Ejemplo en TypeScript

```typescript
interface PredictFertilizerRequest {
  crop_id?: number;
  crop_name?: string;
  ph: number;
  latitude?: number;
  longitude?: number;
}

const predictFertilizer = async (
  request: PredictFertilizerRequest,
  accessToken: string
) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/predict',
      request,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Uso con crop_id
const result1 = await predictFertilizer(
  {
    crop_id: 1,
    ph: 6.5,
  },
  accessToken
);

// Uso sin crop_id
const result2 = await predictFertilizer(
  {
    crop_name: 'papa',
    ph: 6.5,
    latitude: 12.456789,
    longitude: -76.543210,
  },
  accessToken
);
```

#### 🔗 Ejemplo en cURL

```bash
# Con crop_id
curl -X POST "http://192.168.100.31:8000/predict" \
  -H "Authorization: Bearer tu_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_id": 1,
    "ph": 6.5
  }'

# Sin crop_id
curl -X POST "http://192.168.100.31:8000/predict" \
  -H "Authorization: Bearer tu_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "papa",
    "ph": 6.5,
    "latitude": 12.456789,
    "longitude": -76.543210
  }'
```

---

### 1️⃣2️⃣ POST /generate-recipe

**Generar receta de nutrientes para sistemas hidropónicos**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/generate-recipe
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 📥 Request Body - Opción 1: Con crop_id

```json
{
  "crop_id": 1,
  "water_volume": 100,
  "temperature": 22,
  "ph_level": 6.0
}
```

#### 📥 Request Body - Opción 2: Sin crop_id

```json
{
  "crop_name": "papa",
  "water_volume": 100,
  "temperature": 22,
  "ph_level": 6.0,
  "latitude": 12.456789,
  "longitude": -76.543210
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| crop_id | integer | ❓ Sí/No* | ID del cultivo | - |
| crop_name | string | ❓ Sí/No* | Nombre del cultivo | Si no hay crop_id |
| water_volume | float | ✅ Sí | Volumen de agua en litros | Mayor que 0 |
| temperature | float | ✅ Sí | Temperatura del agua °C | 10-35 |
| ph_level | float | ✅ Sí | pH del agua | 0-14 |
| latitude | float | ❌ No | Para obtener clima | Si no está en crop_id |
| longitude | float | ❌ No | Para obtener clima | Si no está en crop_id |

#### ✅ Response Exitosa (200 OK)

```json
{
  "success": true,
  "cultivo": "papa",
  "water_volume": 100,
  "temperature": 22,
  "ph_level": 6.0,
  "nutrientes": {
    "macronutrientes": {
      "N": 420.0,
      "P": 180.0,
      "K": 340.0,
      "Ca": 200.0,
      "Mg": 80.0,
      "S": 64.0
    },
    "micronutrientes": {
      "Fe": 3.0,
      "B": 0.5,
      "Mn": 0.8,
      "Zn": 0.3,
      "Cu": 0.1,
      "Mo": 0.05
    }
  },
  "proporciones": "Mezclar en proporción 1:0.43:0.81 para N:P:K...",
  "frecuencia_cambio": "Cambiar solución cada 14 días",
  "ph_recomendado": {
    "min": 5.5,
    "max": 6.5
  },
  "temperature_recomendada": {
    "min": 18,
    "max": 25
  },
  "instrucciones": "1. Mezclar nutrientes en orden especificado...",
  "recipe_id": 1,
  "timestamp": "2025-12-17T16:10:00.000000"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| cultivo | string | Cultivo para el que se generó |
| nutrientes | object | Macro y micronutrientes (valores en mg/L) |
| proporciones | string | Instrucciones de proporciones |
| frecuencia_cambio | string | Frecuencia de cambio de solución |
| ph_recomendado | object | Rango de pH óptimo |
| temperature_recomendada | object | Rango de temperatura óptima |
| instrucciones | string | Pasos detallados de mezcla |
| recipe_id | integer | ID de la receta guardada |

#### ❌ Errores Posibles

**400 Bad Request - Valores fuera de rango**
```json
{
  "detail": "La temperatura debe estar entre 10 y 35°C"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": "Debes proporcionar crop_id O (crop_name + latitude + longitude)"
}
```

#### 📝 Ejemplo en TypeScript

```typescript
interface GenerateRecipeRequest {
  crop_id?: number;
  crop_name?: string;
  water_volume: number;
  temperature: number;
  ph_level: number;
  latitude?: number;
  longitude?: number;
}

const generateHydroRecipe = async (
  request: GenerateRecipeRequest,
  accessToken: string
) => {
  try {
    const response = await axios.post(
      'http://192.168.100.31:8000/generate-recipe',
      request,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
```

---

### 1️⃣3️⃣ POST /predict-image

**Detectar enfermedades en plantas mediante imagen**

#### 📌 Endpoint
```
POST http://192.168.100.31:8000/predict-image
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

#### 📥 Request Body (Multipart Form Data)

```
Content-Disposition: form-data; name="file"; filename="hoja.jpg"
Content-Type: image/jpeg

[archivo binario de la imagen]
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| file | File/Binary | ✅ Sí | Imagen de la planta | JPEG, PNG, máx 10MB |

#### ✅ Response Exitosa (200 OK)

```json
{
  "success": true,
  "enfermedad": "Tizón Tardío (Phytophthora infestans)",
  "confianza": 0.94,
  "descripcion": "El Tizón Tardío es una enfermedad fúngica grave que afecta principalmente a papas y tomates...",
  "recomendaciones": "1. Aislar la planta infectada\n2. Aplicar fungicida sistémico (Mancozeb, Metalaxil)\n3. Aumentar ventilación\n4. Reducir humedad a menos del 70%\n5. Riego en las mañanas solamente",
  "acciones_recomendadas": [
    "Sulfato de cobre (250ml por 100L agua)",
    "Mancozeb (2g por litro de agua)",
    "Propamocarb (1.5ml por litro de agua)"
  ],
  "prediction_id": 5,
  "timestamp": "2025-12-17T16:30:00.000000"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| enfermedad | string | Nombre de la enfermedad detectada |
| confianza | float | Porcentaje de confianza (0-1) |
| descripcion | string | Descripción detallada de la enfermedad |
| recomendaciones | string | Pasos recomendados para tratar |
| acciones_recomendadas | array | Lista de fungicidas/productos recomendados |
| prediction_id | integer | ID de la predicción guardada |

#### ❌ Errores Posibles

**400 Bad Request - Archivo no válido**
```json
{
  "detail": "El archivo debe ser una imagen JPEG o PNG"
}
```

**413 Payload Too Large - Archivo muy grande**
```json
{
  "detail": "El archivo no debe superar 10MB"
}
```

**422 Unprocessable Entity - No hay file**
```json
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error - Error en modelo**
```json
{
  "detail": "Error al procesar la imagen. Intenta nuevamente."
}
```

#### 📝 Ejemplo en TypeScript

```typescript
const detectDisease = async (
  imageUri: string,
  accessToken: string
) => {
  try {
    const formData = new FormData();
    
    // Convertir URI a Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    formData.append('file', blob, 'image.jpg');

    const axiosResponse = await axios.post(
      'http://192.168.100.31:8000/predict-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return axiosResponse.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Uso con expo-image-picker
import * as ImagePicker from 'expo-image-picker';

const pickAndAnalyzeImage = async (accessToken: string) => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.cancelled) {
    const analysisResult = await detectDisease(
      result.assets[0].uri,
      accessToken
    );
    console.log('Enfermedad detectada:', analysisResult);
  }
};
```

---

## 📡 Headers y Autenticación

### Headers Requeridos

Todas las rutas protegidas requieren este header:

```
Authorization: Bearer {access_token}
```

Donde `{access_token}` es el token JWT obtenido en el login.

### Ejemplo de Interceptor en Axios

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://192.168.100.31:8000',
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (para manejar token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://192.168.100.31:8000/auth/refresh-token',
          { refresh_token: refreshToken }
        );

        await AsyncStorage.setItem('access_token', response.data.access_token);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh falló, redirigir a login
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // Navegar a Login
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔴 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **2xx - Exitoso** | | |
| 200 | OK | Solicitud exitosa, datos en response |
| 201 | Created | Recurso creado exitosamente |
| **4xx - Error del Cliente** | | |
| 400 | Bad Request | Datos inválidos o incompletos |
| 401 | Unauthorized | Token faltante, expirado o inválido |
| 403 | Forbidden | Acceso denegado (ej: cultivo de otro usuario) |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable Entity | Validación fallida |
| 413 | Payload Too Large | Archivo demasiado grande |
| **5xx - Error del Servidor** | | |
| 500 | Internal Server Error | Error en el servidor |
| 503 | Service Unavailable | Servidor no disponible |

---

## ✅ Validaciones Comunes

### Validación de Email
```
- Formato válido: usuario@example.com
- Único en la base de datos
- Máximo 255 caracteres
```

### Validación de Password
```
- Mínimo 8 caracteres
- Puede contener mayúsculas, minúsculas, números, símbolos
```

### Validación de pH
```
- Rango: 0 a 14
- Tipo: float
- Ejemplo: 6.5
```

### Validación de Coordenadas
```
- Latitud: -90 a 90
- Longitud: -180 a 180
```

### Validación de Área
```
- Mayor que 0
- Tipo: float
- Unidad: metros cuadrados (m²)
```

---

## 📚 Resumen Rápido de Endpoints

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---|
| POST | /auth/register | Crear cuenta | ❌ No |
| POST | /auth/login | Iniciar sesión | ❌ No |
| POST | /auth/refresh-token | Renovar token | ✅ Sí* |
| GET | /auth/me | Obtener usuario actual | ✅ Sí |
| PUT | /auth/change-password | Cambiar contraseña | ✅ Sí |
| GET | /crops | Listar cultivos | ✅ Sí |
| POST | /crops | Crear cultivo | ✅ Sí |
| GET | /crops/{id} | Obtener cultivo | ✅ Sí |
| PUT | /crops/{id} | Actualizar cultivo | ✅ Sí |
| DELETE | /crops/{id} | Eliminar cultivo | ✅ Sí |
| POST | /predict | Predicción de NPK | ✅ Sí |
| POST | /generate-recipe | Receta hidropónica | ✅ Sí |
| POST | /predict-image | Detectar enfermedad | ✅ Sí |

*Algunos endpoints requieren refresh_token en vez de access_token

---

## 🧪 Testing Rápido con Swagger UI

Puedes probar todos los endpoints en la documentación interactiva:

**URL:** `http://192.168.100.31:8000/docs`

1. Abre en tu navegador
2. Haz clic en "Try it out" en cualquier endpoint
3. Llena los datos requeridos
4. Haz clic en "Execute"
5. Verás la request y response en tiempo real

---

**Documento Generado:** 17 de diciembre de 2025  
**Versión:** 1.0  
**Base URL:** http://192.168.100.31:8000  
**Estado:** Completo y Listo para Referencia
