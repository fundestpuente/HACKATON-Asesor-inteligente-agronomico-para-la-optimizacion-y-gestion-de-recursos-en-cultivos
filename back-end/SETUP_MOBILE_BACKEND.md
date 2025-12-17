# 📱 Guía de Configuración - Backend para React Native

## 🎯 Objetivo
Configurar el backend FastAPI para escuchar en tu IP local (`192.168.100.31`) para que tu aplicación móvil React Native pueda conectarse.

---

## 🔧 Opciones de Ejecución

### ✅ Opción 1: Usar el nuevo script `run_server.py` (RECOMENDADO)

```bash
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

# Ejecutar con IP específica (por defecto ya está configurado)
python run_server.py

# O si prefieres escuchar en todas las interfaces
python run_server.py --host 0.0.0.0

# O si necesitas usar un puerto diferente
python run_server.py --port 5000

# Con auto-reload para desarrollo
python run_server.py --reload
```

### ✅ Opción 2: Ejecutar directamente con uvicorn

```bash
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

# En tu IP específica
uvicorn api:app --host 192.168.100.31 --port 8000

# En todas las interfaces (para desarrollo)
uvicorn api:app --host 0.0.0.0 --port 8000

# Con auto-reload
uvicorn api:app --host 192.168.100.31 --port 8000 --reload
```

### ✅ Opción 3: Ejecutar desde Python (como estabas haciendo)

```bash
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

# Ahora api.py ya tiene configurada la IP
python api.py
```

---

## 📍 Configuración de URL en React Native

### En tu servicio API (api.ts o similar):

```typescript
// Para desarrollo en tu red local
export const API_URL = 'http://192.168.100.31:8000';

// Para emulador Android (usa la IP del host)
export const API_URL = 'http://192.168.100.31:8000';

// Para simulador iOS (en macOS)
export const API_URL = 'http://192.168.100.31:8000';
```

### Ejemplo completo en Axios:

```typescript
import axios from 'axios';

const API_URL = 'http://192.168.100.31:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## ✅ Verificar Conexión

### 1️⃣ Desde tu PC (Windows):
```bash
# Verificar que el servidor está escuchando
netstat -ano | findstr :8000

# O usar PowerShell
Get-NetTCPConnection -LocalPort 8000

# Probar conexión
curl http://192.168.100.31:8000/docs
```

### 2️⃣ Desde tu dispositivo móvil:
```bash
# En la terminal del emulador/dispositivo
curl http://192.168.100.31:8000/docs
```

### 3️⃣ Acceder en navegador:
```
http://192.168.100.31:8000/docs          # Swagger UI
http://192.168.100.31:8000/redoc         # ReDoc
```

---

## 🔥 Posibles Problemas y Soluciones

### ❌ "Connection refused" o "Cannot connect"

**Causa:** El firewall está bloqueando la conexión

**Soluciones:**
```bash
# 1. Permitir a través del Firewall de Windows (ejecutar como admin)
netsh advfirewall firewall add rule name="FastAPI 8000" dir=in action=allow protocol=tcp localport=8000

# 2. O deshabilitar firewall temporalmente (NO recomendado en producción)
# Panel de Control > Firewall > Permitir un app a través del firewall

# 3. Usar 0.0.0.0 en lugar de IP específica (menos seguro pero funciona)
python run_server.py --host 0.0.0.0
```

### ❌ "Address already in use"

**Causa:** Otro proceso está usando el puerto 8000

**Soluciones:**
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número encontrado)
taskkill /PID <PID> /F

# O usar otro puerto
python run_server.py --port 5000
```

### ❌ "192.168.100.31 is not a valid IP"

**Causa:** La IP no es correcta en tu red

**Soluciones:**
```bash
# Obtener tu IP local
ipconfig

# Busca la línea que dice "IPv4 Address" bajo tu adaptador de red
# Usa esa IP en lugar de 192.168.100.31
```

---

## 🛡️ Configuración de CORS

El backend ya tiene CORS configurado para aceptar cualquier origen. Si necesitas hacerlo más restrictivo:

**En api.py:**
```python
allowed_origins = [
    "http://192.168.100.31:8000",
    "http://localhost:8000",
    "http://localhost:3000",  # Si tienes web frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📝 Checklist de Configuración

- [ ] Backend configurado en IP `192.168.100.31`
- [ ] Puerto 8000 abierto en firewall
- [ ] Servidor iniciado y escuchando
- [ ] Swagger UI accesible en navegador (`http://192.168.100.31:8000/docs`)
- [ ] React Native configurado con URL correcta
- [ ] Prueba de conexión exitosa desde móvil
- [ ] Tokens se almacenan correctamente
- [ ] CORS configurado correctamente

---

## 🧪 Prueba Rápida con curl

```bash
# Registro
curl -X POST http://192.168.100.31:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Password123"}'

# Login
curl -X POST http://192.168.100.31:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Obtener perfil (reemplaza TOKEN con el token del login)
curl -X GET http://192.168.100.31:8000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 Próximos Pasos

1. ✅ Ejecuta: `python run_server.py`
2. ✅ Verifica Swagger UI en `http://192.168.100.31:8000/docs`
3. ✅ Prueba desde React Native con `API_URL = 'http://192.168.100.31:8000'`
4. ✅ Verifica logs en la terminal del servidor
5. ✅ Usa las rutas documentadas en `AUTH_ROUTES_DOCUMENTATION.md`

---

**Documento creado:** 17 de diciembre de 2025  
**Última actualización:** Configuración de IP local para React Native
