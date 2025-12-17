# Integración con la API de AgroMind (Frontend)

Este archivo resume cómo usar el cliente centralizado `services/api.ts` desde el frontend.

Base URL por defecto
- El cliente usa `http://localhost:8000` (archivo `services/api.ts`).
- Si tu backend corre en otra IP/puerto (ej. en la red local), actualiza `API_BASE_URL` en `services/api.ts` o configura un env var y ajusta el cliente.

Principales helpers exportados (resumen):

- Autenticación
  - `register(payload)` -> POST `/auth/register`
  - `login(payload)` -> POST `/auth/login` (guarda tokens en AsyncStorage si retorna access_token)
  - `refresh()` -> POST `/auth/refresh` (usa refresh token guardado)
  - `me()` -> GET `/auth/me`
  - `changePassword(current_password, new_password)` -> POST `/auth/change-password`

- Cultivos
  - `createCrop(cropData)` -> POST `/crops`
  - `listCrops(params?)` -> GET `/crops` (params: crop_type, status, skip, limit)
  - `getCrop(id)` -> GET `/crops/{id}`
  - `updateCrop(id, patch)` -> PUT `/crops/{id}`
  - `deleteCrop(id)` -> DELETE `/crops/{id}`
  - `getCropPredictions(id)` -> GET `/crops/{id}/predictions`
  - `getCropHydroRecipes(id)` -> GET `/crops/{id}/hydro-recipes`
  - `getCropStats(id)` -> GET `/crops/{id}/stats`

- Inteligencia Artificial
  - `predict(body, cropId?)` -> POST `/predict` (acepta `crop_id` como query param)
  - `generateRecipe(body, cropId?)` -> POST `/generate-recipe`
  - `predictImage(file, cropId?)` -> POST `/predict-image` (multipart/form-data)

- Tokens y utilidades
  - `saveTokens(accessToken, refreshToken?)`
  - `clearTokens()`
  - `getAccessToken()` / `getRefreshToken()`

Ejemplos rápidos (uso desde componentes React/React Native)

1) Login y guardar tokens

```ts
import { login } from './services/api';

async function doLogin(email: string, password: string) {
  const res = await login({ email, password });
  // login ya guarda access_token en AsyncStorage
  return res;
}
```

2) Crear un cultivo (usuario autenticado)

```ts
import { createCrop } from './services/api';

const cropData = {
  name: 'Tomates Cherry',
  crop_type: 'tomate',
  location_lat: 4.6097,
  location_long: -74.0817,
  area: 250.5,
  status: 'active'
};

const created = await createCrop(cropData);
```

3) Llamar a `predict` (usar `crop_id` si existe para que el backend autocomplete datos)

```ts
import { predict } from './services/api';

const body = { ph: 6.5 };
const result = await predict(body, /* optional cropId */ 123);
```

4) Subir imagen para detección

```ts
import { predictImage } from './services/api';
// En React Native el `file` suele ser { uri, name, type }
const file = { uri: localUri, name: 'photo.jpg', type: 'image/jpeg' };
const response = await predictImage(file, cropId);
```

Errores y manejo
- Las funciones lanzan errores con mensaje útil extraído del backend cuando es posible. Usa try/catch y muestra un Alert o UI friendly.
- Si ves `No refresh token available`, el usuario debe autenticarse de nuevo.

Nota sobre inyección automática de Authorization
- El cliente `services/api.ts` ahora añade automáticamente el header `Authorization: Bearer <token>` en cada petición si existe un access token guardado en AsyncStorage.
- También tiene un interceptor que, al recibir 401, intentará usar el `refresh_token` guardado para obtener un nuevo access token y reintentar las peticiones encoladas. Si el refresh falla, los tokens se limpian y se debe re-autenticar.

Pruebas automáticas rápidas
--------------------------------
He añadido un par de scripts útiles para comprobar la API desde tu máquina de desarrollo:

- `scripts/test_endpoints.js` — hace GET `/docs`, POST `/predict` y POST `/generate-recipe` sin token.
- `scripts/test_endpoints_auth.js` — igual que el anterior, pero intenta hacer login si pasas las variables de entorno `AUTH_EMAIL` y `AUTH_PASSWORD`, o usa `ACCESS_TOKEN` si la proporcionas.

Ejemplo de ejecución:

```powershell
# comprobación básica (sin token)
node .\scripts\test_endpoints.js

# comprobación con autenticación usando credenciales (exporta las variables antes)
$env:AUTH_EMAIL = 'u@ej.com'; $env:AUTH_PASSWORD = 'pwd'; node .\scripts\test_endpoints_auth.js

# o usando un token ya obtenido
$env:ACCESS_TOKEN = 'eyJ...'; node .\scripts\test_endpoints_auth.js
```

Resultados observados en mi máquina al ejecutar `test_endpoints.js`:

- `GET /docs` -> 200
- `POST /predict` -> 403 { "detail": "Not authenticated" }
- `POST /generate-recipe` -> 403 { "detail": "Not authenticated" }

Conclusión: las rutas `/predict` y `/generate-recipe` requieren autenticación en tu backend local. Para probarlas desde scripts, primero consigue un `access_token` via `/auth/login` y pásalo como `ACCESS_TOKEN`.

Siguientes pasos sugeridos
- Considerar inyectar `API_BASE_URL` vía variable de entorno o `config.ts` para no editar `services/api.ts` en cada máquina.
- Añadir un wrapper para interceptar 401 y automatizar `refresh()` antes de reintentar la petición.

Si quieres, puedo:
- Actualizar las otras pantallas para usar `services/api.ts` (ya actualicé `DataInputScreen`).
- Añadir un pequeño wrapper para retry automático al detectar 401 usando el refresh token.

---
Archivo generado automáticamente por el flujo de integración. Última actualización: 17-12-2025
