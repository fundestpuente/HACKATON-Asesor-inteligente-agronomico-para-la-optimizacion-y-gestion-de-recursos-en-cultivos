# README - Integración Frontend con la API de AgroMind IA

Este documento describe las vistas/rutas disponibles en la API para que el equipo frontend pueda integrarlas fácilmente. Contiene: resumen de rutas, headers, cuerpos de petición, ejemplos y notas importantes sobre comportamiento (ej. `crop_id` auto-fill).

Base URL (desarrollo): `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

---

## Contenido
- Autenticación
- Rutas de autenticación (register/login/refresh/me/change-password)
- Rutas de cultivos (CRUD, historial, estadísticas)
- Rutas de IA (predict-image, generate-recipe, predict)
- Ejemplos de integración (fetch JS)
- Variables de entorno y consejos para desarrollo
- Notas y consideraciones para el frontend

---

## 1) Autenticación

La API usa JWT. Para endpoints protegidos se debe enviar en las cabeceras:

Authorization: `Bearer <access_token>`

Tokens:
- Access token: válido 24h
- Refresh token: válido 7 días

Endpoints principales:

### POST /auth/register
- Propósito: crear nuevo usuario
- URL: `/auth/register` (no auth)
- Body (JSON): `{ "email": "u@ej.com", "username": "user1", "password": "pwd" }`
- Response: objeto usuario (id, email, username...)
- Errores comunes: 400 (email ya existe), 422 (validación)

### POST /auth/login
- Propósito: autenticar y obtener tokens
- URL: `/auth/login` (no auth)
- Body (JSON): `{ "email": "u@ej.com", "password": "pwd" }`
- Response: `{ access_token, refresh_token, token_type, user }`
- Uso frontend: guardar `access_token` en memoria (o httpOnly cookie si se adapta backend)

### POST /auth/refresh
- Propósito: renovar access token usando refresh_token
- Body: `{ "refresh_token": "..." }`
- Response: `{ access_token, token_type }`

### GET /auth/me
- Propósito: obtener perfil del usuario
- Headers: `Authorization: Bearer <access_token>`
- Response: usuario

### POST /auth/change-password
- Propósito: cambiar contraseña authenticated
- Body: `{ "current_password": "old", "new_password": "new" }`

---

## 2) Rutas de Cultivos (management)

Todas requieren `Authorization` header.

### POST /crops
- Crear cultivo
- Body JSON:
  {
    "name": "Tomates Cherry",
    "crop_type": "tomate",
    "location_lat": 4.6097,
    "location_long": -74.0817,
    "area": 250.5,
    "status": "active"
  }
- Response: objeto del cultivo creado

### GET /crops
- Listar cultivos del usuario
- Query params: `crop_type`, `status`, `skip`, `limit`
- Example: `/crops?crop_type=tomate&status=active&skip=0&limit=10`

### GET /crops/{id}
- Obtener detalle de cultivo por id

### PUT /crops/{id}
- Actualizar cultivo (todos los campos opcionales)
- Body ejemplo (solo campos que quieras cambiar):
  { "name": "Nuevo nombre" }

### DELETE /crops/{id}
- Eliminar cultivo y asociados

### GET /crops/{id}/predictions
- Obtener historial de predicciones (fertilizante) para el cultivo

### GET /crops/{id}/hydro-recipes
- Obtener recetas hidropónicas guardadas para el cultivo

### GET /crops/{id}/stats
- Obtener estadísticas (totales, promedios, últimas fechas)

---

## 3) Rutas de Inteligencia Artificial

Nota importante: para `/generate-recipe` y `/predict` se puede **pasar `crop_id` como query param** y la API autocompletará `crop` y/o coordenadas (`lat`/`long`) desde la base de datos si el cultivo tiene ubicación guardada. Esto simplifica llamadas desde el frontend.

### POST /predict-image
- Detectar enfermedades en imagen
- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (file) - imagen (png/jpg/jpeg)
  - `crop_id` (int) - opcional
- Headers: `Authorization: Bearer <access_token>`
- Response: `{ success, data: { class, confidence, message }, prediction_id, saved }`
- Frontend: usar fetch con FormData

### POST /generate-recipe
- Generar receta hidropónica
- Query param opcional: `crop_id`
- Body (JSON):
  Opción A (con crop_id): `{ "week": 2, "tank_liters": 100, "ph_water": 6.0 }`
  Opción B (manual): `{ "crop":"lechuga", "week":2, "tank_liters":100, "ph_water":6.0, "lat":4.6, "long":-74.08 }`
- Response: receta optimizada + id guardado

### POST /predict
- Recomendación fertilizante (suelo)
- Query param opcional: `crop_id`
- Body (JSON):
  Opción A (con crop_id): `{ "ph": 6.5 }`
  Opción B (manual): `{ "crop": "tomate", "ph": 6.5, "latitud": 4.6, "longitud": -74.08 }`
- Response: nutrientes recomendados, clima usado, texto de recomendación, id

---

## 4) Ejemplos de integración (fetch)

A continuación fragmentos listos para pegar en el frontend.

### Login (obtener token)
```javascript
async function login(email, password){
  const res = await fetch('http://localhost:8000/auth/login',{
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json(); // contiene access_token y refresh_token
}
```

### Crear cultivo
```javascript
async function createCrop(token, cropData){
  const res = await fetch('http://localhost:8000/crops',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(cropData)
  });
  return res.json();
}
```

### Llamar /predict usando crop_id
```javascript
async function predictFertilizer(token, cropId, ph){
  const res = await fetch(`http://localhost:8000/predict?crop_id=${cropId}`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ ph })
  });
  return res.json();
}
```

### Envío de imagen (predict-image)
```javascript
async function uploadImage(token, file, cropId){
  const fd = new FormData();
  fd.append('file', file);
  if(cropId) fd.append('crop_id', String(cropId));

  const res = await fetch('http://localhost:8000/predict-image',{
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
  });
  return res.json();
}
```

---

## 5) Variables de entorno y ejecución local

Variables en `.env` (ejemplo):
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SECRET_KEY=una_clave_secreta_para_jwt
ALLOWED_ORIGINS=http://localhost:3000
```

Arrancar la API (desarrollo):

```powershell
# desde carpeta back-end
py -3 -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Abrir Swagger UI en /docs para probar rutas.

---

## 6) Notas para el Frontend (recomendaciones)

- Guardar `access_token` en memoria o en cookie `httpOnly` (mejor seguridad). Evitar localStorage si es posible.
- Para endpoints que aceptan `crop_id`, preferir enviar solo `crop_id` y los campos mínimos (ej. `ph` o `week`), así el backend rellena el resto.
- Comprobar en la UI que los cultivos tengan `location_lat`/`location_long` antes de permitir usar `crop_id` para operaciones que requieren clima; si faltan, solicitar coordenadas al usuario.
- Usar paginación (`skip`/`limit`) para listar cultivos si el usuario puede tener muchos.
- Si necesitas una versión de la API que soporte cookies CSRF, adaptar backend para emitir cookies en el login.

---

## 7) Errores comunes y cómo tratarlos en el frontend

- 401: redirigir al login, intentar refresh token si se tiene.
- 404 en endpoints con `crop_id`: mostrar mensaje que el cultivo no existe o solicitar crear/seleccionar otro cultivo.
- 422: mostrar errores de validación (campo faltante o formato incorrecto).

---

## 8) Siguientes pasos sugeridos

- Implementar un `GET /me/crops/with-latest` que devuelva cultivos con última predicción/receta para reducir llamadas.
- Añadir un esquema OpenAPI más detallado (con response schemas) para generar clientes automáticamente.
- Incorporar un ejemplo de SDK JS/TS generado a partir de OpenAPI.

---

## Contacto
Para dudas sobre la API, revisar `api.py`, `routes/auth.py` y `routes/crops.py` en el repositorio.

---

*Archivo generado automáticamente. Última actualización: 17-12-2025*
