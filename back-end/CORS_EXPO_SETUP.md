# 📱 Guía de Configuración CORS - Expo y Backend

## 🎯 Objetivo
Permitir que tu aplicación React Native/Expo en `exp://192.168.100.31:3000` se comunique con el backend en `192.168.100.31:8000`.

---

## ✅ Configuraciones Realizadas

### 1️⃣ **Actualización de `api.py`**
Se añadieron los orígenes permitidos (CORS):
```python
allowed_origins = [
    "*",  # Permite todas las conexiones (desarrollo)
    "http://192.168.100.31:3000",  # Expo Web Preview
    "exp://192.168.100.31:3000",   # Expo Protocol (Móvil)
    "http://localhost:3000",        # Web Development
    "http://localhost:8000",        # Backend localhost
    "http://192.168.100.31:8000",   # Backend por IP
]
```

### 2️⃣ **Actualización de `.env`**
Se añadieron los orígenes en variable de entorno:
```
ALLOWED_ORIGINS=http://192.168.100.31:3000,exp://192.168.100.31:3000,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://192.168.100.31:8000,*
```

### 3️⃣ **Métodos HTTP Permitidos**
```
GET, POST, PUT, DELETE, OPTIONS, PATCH
```

### 4️⃣ **Headers Permitidos**
```
Content-Type, Authorization (y todos los headers)
```

---

## 🚀 Próximos Pasos

### Paso 1: Reinicia el Backend
```bash
# Detén el servidor actual (Ctrl+C en la terminal)

# Luego inicia nuevamente
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

python run_server.py
# O
python api.py
# O
uvicorn api:app --host 192.168.100.31 --port 8000
```

### Paso 2: Configura la URL en tu App Expo
En tu archivo `api.ts` o `service.ts`:

```typescript
// ✅ URL del Backend
export const API_URL = 'http://192.168.100.31:8000';

// Ejemplo completo con Axios:
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para agregar token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar refresh de tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          await AsyncStorage.setItem('access_token', data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          
          return apiClient(error.config);
        } catch {
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          // Redirigir a login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Paso 3: Prueba la Conexión
Desde tu app Expo, intenta hacer una petición:

```typescript
import apiClient, { API_URL } from './services/api';

// Probar conexión
const testConnection = async () => {
  try {
    console.log('Conectando a:', API_URL);
    const response = await fetch(`${API_URL}/docs`);
    console.log('✅ Conexión exitosa:', response.status);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

// Probar registro
const testRegister = async () => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123',
    });
    console.log('✅ Registro exitoso:', response.data);
  } catch (error) {
    console.error('❌ Error en registro:', error.response?.data?.detail);
  }
};

// Probar login
const testLogin = async () => {
  try {
    const response = await apiClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'Password123',
    });
    console.log('✅ Login exitoso');
    console.log('Token:', response.data.access_token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.detail);
  }
};
```

---

## 🔍 Verificación de Configuración

### Check 1: Verificar Backend Escuchando
```bash
# En PowerShell
netstat -ano | findstr :8000

# Debería mostrar algo como:
# TCP    192.168.100.31:8000    0.0.0.0:0    LISTENING    12345
```

### Check 2: Probar desde otra app
```bash
# En otra terminal, prueba conexión
curl -X GET http://192.168.100.31:8000/docs

# Debería responder con HTML de Swagger UI
```

### Check 3: Revisar Logs del Backend
El servidor debe mostrar algo como:
```
✅ Sistema Hidropónico: LISTO
✅ Sistema Suelo/Normal: LISTO
INFO: Uvicorn running on http://192.168.100.31:8000
```

---

## 📋 Checklist CORS/Permisos

- [ ] Backend reiniciado con nuevas configuraciones
- [ ] `.env` actualizado con nuevos orígenes
- [ ] `api.py` tiene lista de orígenes permitidos
- [ ] `API_URL` en Expo apunta a `http://192.168.100.31:8000`
- [ ] Firewall permite conexión en puerto 8000
- [ ] Swagger UI accesible en `http://192.168.100.31:8000/docs`
- [ ] Petición de registro funciona desde Expo
- [ ] Petición de login funciona desde Expo
- [ ] Token se guarda en AsyncStorage
- [ ] Peticiones posteriores incluyen Authorization header

---

## 🚨 Posibles Errores y Soluciones

### Error: "CORS policy: Cross-Origin Request Blocked"
**Causa:** El origen de Expo no está en la lista de orígenes permitidos

**Soluciones:**
1. Verifica que `http://192.168.100.31:3000` está en `api.py`
2. Verifica que `exp://192.168.100.31:3000` está en `api.py`
3. Reinicia el backend
4. Limpia caché de la app Expo

### Error: "Connection Refused"
**Causa:** El backend no está corriendo o firewall lo bloquea

**Soluciones:**
```bash
# 1. Verifica que el servidor está corriendo
netstat -ano | findstr :8000

# 2. Intenta con 0.0.0.0 (menos seguro pero más permisivo)
python run_server.py --host 0.0.0.0

# 3. Añade excepción en Firewall
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=tcp localport=8000
```

### Error: "401 Unauthorized"
**Causa:** Token expirado o no incluido en headers

**Soluciones:**
1. Implementa interceptor de request (agregar `Authorization: Bearer token`)
2. Implementa refresh token automático en interceptor de response
3. Verifica que token se guarda en AsyncStorage

### Error: "Network Timeout"
**Causa:** Conexión muy lenta o IP incorrecta

**Soluciones:**
1. Verifica que `192.168.100.31` es la IP correcta: `ipconfig`
2. Aumenta timeout en axios: `timeout: 30000`
3. Verifica conexión de red: `ping 192.168.100.31`

---

## 📚 Referencias de CORS

**Headers que se envían automáticamente:**
```
Access-Control-Allow-Origin: http://192.168.100.31:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

**Petición Preflight (Automática en OPTIONS):**
```
OPTIONS /auth/login
Origin: http://192.168.100.31:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

---

## 🔐 Configuración de Producción

Para producción, **NO uses `"*"`** en `allow_origins`. En su lugar:

```python
allowed_origins = [
    "https://tudominio.com",
    "https://api.tudominio.com",
]
```

Y en `.env`:
```
ALLOWED_ORIGINS=https://tudominio.com,https://api.tudominio.com
```

---

**Documento creado:** 17 de diciembre de 2025  
**Última actualización:** Configuración CORS para Expo React Native
