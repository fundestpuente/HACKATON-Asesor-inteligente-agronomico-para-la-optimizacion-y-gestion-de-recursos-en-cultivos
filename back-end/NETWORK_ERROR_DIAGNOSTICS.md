# 🔧 Diagnóstico y Solución - Network Error en Expo

## 🚨 Problema Actual
Tu app Expo está recibiendo **"Network Error"** al intentar conectar a `/auth/login`.

---

## 🔍 Paso 1: Verificar que el Backend está corriendo

### En Windows PowerShell:

```powershell
# Verificar si el puerto 8000 está en uso
netstat -ano | findstr :8000

# Si ves una línea LISTENING, el servidor está activo
# Ejemplo de salida esperada:
# TCP    192.168.100.31:8000    0.0.0.0:0    LISTENING    12345
```

**Si no ves nada en la salida:**
- ❌ El backend NO está corriendo
- ✅ Solución: Inicia el backend

```bash
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

# Opción 1 (Recomendada)
python run_server.py

# Opción 2
python api.py

# Opción 3
uvicorn api:app --host 192.168.100.31 --port 8000
```

---

## 🔍 Paso 2: Verificar la IP Correcta

### En PowerShell, obtén tu IP local:

```powershell
ipconfig

# Busca algo como:
# Adaptador de Ethernet:
#   Dirección IPv4 . . . . . . . : 192.168.100.31
#   Máscara de subred . . . . . : 255.255.255.0
```

**La IP debe coincidir en tres lugares:**

1. ✅ Backend (`api.py`): `uvicorn.run(app, host="192.168.100.31", port=8000)`
2. ✅ Expo (`api.ts`): `export const API_URL = 'http://192.168.100.31:8000'`
3. ✅ Archivo `.env`: `HOST=192.168.100.31`

**Si tu IP es diferente (ej: `192.168.1.100`):**
- Actualiza en los 3 lugares
- Reinicia backend y app Expo

---

## 🔍 Paso 3: Verificar Firewall

### El Firewall de Windows podría estar bloqueando el puerto 8000

**Opción A: Permitir en Firewall (SEGURO)**

```powershell
# Ejecutar PowerShell como Administrador, luego:
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=tcp localport=8000

# Verificar que se agregó
netsh advfirewall firewall show rule name="FastAPI"
```

**Opción B: Usar 0.0.0.0 (MENOS SEGURO, solo desarrollo)**

Si no quieres modificar firewall, inicia el backend así:

```bash
python run_server.py --host 0.0.0.0
```

Luego en tu app Expo, prueba con `http://localhost:8000` si estás en Android emulador en la misma PC.

---

## 🔍 Paso 4: Probar Conexión Manualmente

### Test 1: Desde Windows PowerShell

```powershell
# Probar que el server responde
curl http://192.168.100.31:8000/docs

# Debería devolver HTML de Swagger UI
# Si falla, el backend no está corriendo o el firewall lo bloquea
```

### Test 2: Con curl POST

```powershell
# Intenta un login
curl -X POST http://192.168.100.31:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Password123"}'

# Debería responder con error de usuario (usuario no existe)
# O con error de validación si los campos están mal
# Si falla de conexión, hay problema de red/firewall
```

### Test 3: Desde Expo (en tu código)

Crea un archivo temporal `TestConnection.tsx`:

```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import axios from 'axios';

export const TestConnectionScreen = () => {
  const [results, setResults] = React.useState<string[]>([]);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    const logs: string[] = [];

    // Test 1: Verificar que axios está instalado
    logs.push('✅ Test 1: Axios disponible');

    // Test 2: Conectar a Swagger UI
    try {
      logs.push('🔄 Test 2: Intentando conectar a /docs...');
      const response = await axios.get('http://192.168.100.31:8000/docs', {
        timeout: 5000,
      });
      logs.push(`✅ Test 2: Conexión exitosa (${response.status})`);
    } catch (error: any) {
      logs.push(`❌ Test 2: Error - ${error.message}`);
    }

    // Test 3: Intentar login
    try {
      logs.push('🔄 Test 3: Intentando login en /auth/login...');
      const response = await axios.post(
        'http://192.168.100.31:8000/auth/login',
        {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
        { timeout: 5000 }
      );
      logs.push(`✅ Test 3: Request enviado (${response.status})`);
    } catch (error: any) {
      logs.push(
        `❌ Test 3: ${error.message} (Esto es normal si el usuario no existe)`
      );
    }

    // Test 4: CORS check
    try {
      logs.push('🔄 Test 4: Verificando CORS...');
      const response = await axios.options('http://192.168.100.31:8000/auth/login', {
        timeout: 5000,
      });
      logs.push(`✅ Test 4: CORS configurado correctamente`);
    } catch (error: any) {
      logs.push(`⚠️ Test 4: ${error.message}`);
    }

    setResults(logs);
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        🧪 Pruebas de Conexión
      </Text>
      {results.map((log, i) => (
        <Text
          key={i}
          style={{
            marginBottom: 8,
            fontFamily: 'monospace',
            fontSize: 12,
            color: log.includes('❌') ? '#d32f2f' : '#388e3c',
          }}
        >
          {log}
        </Text>
      ))}
    </ScrollView>
  );
};
```

---

## 🛠️ Solución Rápida (Paso a Paso)

### 1️⃣ Abre una terminal PowerShell nueva (como Administrador)

```powershell
# Permite conexión en puerto 8000
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=tcp localport=8000
```

### 2️⃣ Inicia el backend

```bash
cd "d:\Proyectos\SIC Certificacion\Hackathon-Agromind\HACKATON-Asesor-inteligente-agronomico-para-la-optimizacion-y-gestion-de-recursos-en-cultivos\back-end"

python run_server.py
```

**Espera a ver estos mensajes:**
```
========================================================
🚀 INICIANDO SERVIDOR AGROMIND IA
========================================================
Host:       192.168.100.31
Puerto:     8000
URL:        http://192.168.100.31:8000
Swagger UI: http://192.168.100.31:8000/docs
========================================================
INFO:     Uvicorn running on http://192.168.100.31:8000
```

### 3️⃣ Prueba en navegador

Abre en tu navegador:
```
http://192.168.100.31:8000/docs
```

Deberías ver la documentación interactiva de Swagger UI.

### 4️⃣ Verifica tu archivo api.ts en Expo

Asegúrate de que tiene:

```typescript
export const API_URL = 'http://192.168.100.31:8000';
```

**NO** uses `localhost` o `127.0.0.1` desde un dispositivo móvil o emulador.

### 5️⃣ Recarga tu app Expo

En la terminal de Expo, presiona:
```
r - para recargar
```

---

## 🚀 Tabla de Verificación

| Item | Esperado | Comando para Verificar |
|------|----------|------------------------|
| Backend corriendo | Escuchando en 8000 | `netstat -ano \| findstr :8000` |
| Firewall permite 8000 | Permitido | `netsh advfirewall firewall show rule name="FastAPI"` |
| Swagger UI accesible | 200 OK | `curl http://192.168.100.31:8000/docs` |
| API_URL en Expo | `http://192.168.100.31:8000` | Revisar `api.ts` o `api.js` |
| Conexión desde Expo | Sin Network Error | Presionar `s` en Expo y revisar logs |
| Token guardado | En AsyncStorage | Verificar en app debugger |

---

## 📱 Verificar en Expo Go (Dispositivo Real)

Si estás usando Expo Go en un dispositivo móvil:

1. El dispositivo debe estar **en la misma red WiFi** que tu PC
2. La IP `192.168.100.31` debe ser la IP interna de tu PC (no la de internet)
3. Verifica con: `ipconfig`

---

## 🆘 Si Aún Hay Problema

**Recopila esta información:**

1. Salida de `ipconfig` (tu IP local)
2. Salida de `netstat -ano | findstr :8000` (¿puerto está en uso?)
3. Logs completos del backend cuando inicia
4. Logs completos de Expo cuando intenta conectar
5. Resultado de `curl http://192.168.100.31:8000/docs` desde PowerShell

---

## 💡 Alternativa: Usar 0.0.0.0 (Solo para Desarrollo)

Si nada funciona, prueba esto:

**Backend:**
```bash
python run_server.py --host 0.0.0.0
```

**En Expo (si estás en Android emulador en la misma PC):**
```typescript
export const API_URL = 'http://10.0.2.2:8000'; // IP especial para Android emulator
```

**En Expo (si estás en dispositivo real en la misma red):**
```typescript
export const API_URL = 'http://192.168.100.31:8000'; // Tu IP real
```

---

**Documento creado:** 17 de diciembre de 2025  
**Propósito:** Diagnosticar y solucionar "Network Error" en conexión Expo-Backend
