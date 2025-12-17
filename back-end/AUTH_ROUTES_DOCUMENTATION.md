# 🔐 Documentación Completa - Rutas de Autenticación AgroMind IA

## 📌 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Configuración Base](#configuración-base)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Rutas Detalladas](#rutas-detalladas)
5. [Manejo de Tokens](#manejo-de-tokens)
6. [Códigos de Error](#códigos-de-error)
7. [Ejemplos Completos](#ejemplos-completos)
8. [Seguridad](#seguridad)

---

## 📖 Introducción

El sistema de autenticación de AgroMind IA utiliza **JWT (JSON Web Tokens)** con el algoritmo **HS256**. 

### 🎯 Características Principales:
- ✅ Tokens de acceso con expiración de **24 horas**
- ✅ Tokens de refresco con expiración de **7 días**
- ✅ Contraseñas encriptadas con **bcrypt**
- ✅ Validación de email
- ✅ Cambio seguro de contraseña

---

## 🔧 Configuración Base

### URL Base del API
```
http://localhost:8000
```

### Headers Requeridos (para rutas protegidas)
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Estructura de Respuesta Estándar (Éxito)
```json
{
  "status": "success",
  "data": { /* datos específicos */ },
  "message": "Mensaje descriptivo"
}
```

### Estructura de Respuesta de Error
```json
{
  "detail": "Descripción del error"
}
```

---

## 🔄 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario se registra                                     │
│     POST /auth/register                                     │
│     ↓                                                        │
│  2. Usuario inicia sesión                                   │
│     POST /auth/login                                        │
│     ↓ Obtiene: access_token (24h) + refresh_token (7d)    │
│  3. Guarda tokens en AsyncStorage/localStorage             │
│     ↓                                                        │
│  4. Usa access_token en header de peticiones protegidas     │
│     Authorization: Bearer access_token                      │
│     ↓                                                        │
│  5. Token expira después de 24 horas                        │
│     ↓                                                        │
│  6. Usa refresh_token para obtener nuevo access_token      │
│     POST /auth/refresh                                      │
│     ↓                                                        │
│  7. Continúa con nuevo access_token                         │
│     ↓                                                        │
│  8. Al salir, elimina tokens del almacenamiento local      │
│     POST /auth/logout (opcional)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Rutas Detalladas

### 1️⃣ REGISTRO DE USUARIO
**Endpoint:** `POST /auth/register`

#### Descripción
Crea una nueva cuenta de usuario en el sistema.

#### Request Body
```json
{
  "email": "usuario@example.com",
  "username": "nombre_usuario",
  "password": "contraseña_segura_123"
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| email | string | ✅ Sí | Correo electrónico del usuario | Email válido, único |
| username | string | ✅ Sí | Nombre de usuario | Alfanumérico, mínimo 3 caracteres |
| password | string | ✅ Sí | Contraseña | Mínimo 8 caracteres, máximo 72 bytes |

#### Response 200 (Éxito)
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "nombre_usuario",
    "is_active": true,
    "is_admin": false,
    "created_at": "2025-12-17T10:30:00Z"
  }
}
```

#### Response 400 (Error)
```json
{
  "detail": "El email ya está registrado"
}
```

O

```json
{
  "detail": "El username ya existe"
}
```

#### Códigos de Error
| Código | Descripción |
|--------|-------------|
| 400 | Email o username ya existen / Validación fallida |
| 422 | Datos inválidos o incompletos |

#### Ejemplo cURL
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "username": "nuevoUsuario",
    "password": "MiContraseña123"
  }'
```

#### Ejemplo JavaScript/React
```javascript
const register = async (email, username, password) => {
  try {
    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error en el registro');
    }

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Ejemplo Python/FastAPI
```python
from httpx import AsyncClient

async def register():
    async with AsyncClient() as client:
        response = await client.post(
            'http://localhost:8000/auth/register',
            json={
                'email': 'nuevo@example.com',
                'username': 'nuevoUsuario',
                'password': 'MiContraseña123'
            }
        )
        return response.json()
```

#### Notas Importantes
- ⚠️ La contraseña debe tener al menos 8 caracteres
- ⚠️ El email debe ser único en el sistema
- ⚠️ El username debe ser único y alfanumérico
- ✅ Luego de registrarse, el usuario debe iniciar sesión

---

### 2️⃣ INICIO DE SESIÓN
**Endpoint:** `POST /auth/login`

#### Descripción
Autentica un usuario y devuelve tokens JWT para sesiones posteriores.

#### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "contraseña_segura_123"
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | ✅ Sí | Email registrado |
| password | string | ✅ Sí | Contraseña correcta |

#### Response 200 (Éxito)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "nombre_usuario",
    "is_active": true,
    "is_admin": false
  }
}
```

#### Campos de Respuesta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| access_token | string | Token JWT para rutas protegidas (válido 24 horas) |
| refresh_token | string | Token para renovar access_token (válido 7 días) |
| token_type | string | Tipo de token ("bearer") |
| expires_in | number | Segundos hasta expiración del access_token (86400 = 24h) |
| user | object | Datos del usuario autenticado |

#### Response 401 (Error de Autenticación)
```json
{
  "detail": "Email o contraseña incorrectos"
}
```

#### Response 400 (Validación)
```json
{
  "detail": "El usuario no existe"
}
```

#### Códigos de Error
| Código | Descripción |
|--------|-------------|
| 401 | Credenciales inválidas |
| 400 | Usuario no existe |
| 422 | Datos incompletos |

#### Ejemplo cURL
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiContraseña123"
  }'
```

#### Ejemplo JavaScript/React
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al iniciar sesión');
    }

    // Guardar tokens en localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return {
      success: true,
      user: data.user,
      access_token: data.access_token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Ejemplo React Native/Expo
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al iniciar sesión');
    }

    // Guardar tokens en AsyncStorage
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return {
      success: true,
      user: data.user,
      access_token: data.access_token,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Notas Importantes
- ✅ Guarda ambos tokens (access y refresh) en almacenamiento seguro
- ⏱️ El access_token expira en 24 horas
- ⏱️ El refresh_token expira en 7 días
- 🔒 Nunca expongas los tokens en la URL
- 🔒 Siempre usa HTTPS en producción

---

### 3️⃣ OBTENER PERFIL ACTUAL
**Endpoint:** `GET /auth/me`

#### Descripción
Obtiene los datos del usuario autenticado actualmente.

#### Headers Requeridos
```
Authorization: Bearer <access_token>
```

#### Response 200 (Éxito)
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "nombre_usuario",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17T10:30:00Z"
}
```

#### Response 401 (No Autenticado)
```json
{
  "detail": "Token no válido o expirado"
}
```

#### Códigos de Error
| Código | Descripción |
|--------|-------------|
| 401 | Token no válido, expirado o faltante |
| 403 | Acceso denegado |

#### Ejemplo cURL
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Ejemplo JavaScript
```javascript
const getProfile = async (accessToken) => {
  try {
    const response = await fetch('http://localhost:8000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener perfil');
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Ejemplo React Hooks
```typescript
import { useEffect, useState } from 'react';

const useProfile = (accessToken: string) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    fetch('http://localhost:8000/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
        } else {
          setError(data.detail);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { user, loading, error };
};
```

---

### 4️⃣ RENOVAR TOKEN
**Endpoint:** `POST /auth/refresh`

#### Descripción
Obtiene un nuevo access_token usando el refresh_token cuando el primero expira.

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| refresh_token | string | ✅ Sí | Token obtenido en login |

#### Response 200 (Éxito)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### Response 401 (Refresh Token Expirado)
```json
{
  "detail": "Refresh token expirado o inválido"
}
```

#### Códigos de Error
| Código | Descripción |
|--------|-------------|
| 401 | Refresh token expirado, inválido o faltante |
| 422 | Datos incompletos |

#### Ejemplo cURL
```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Ejemplo JavaScript
```javascript
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al renovar token');
    }

    // Guardar nuevo token
    localStorage.setItem('access_token', data.access_token);

    return {
      success: true,
      access_token: data.access_token,
    };
  } catch (error) {
    // Refresh token expirado, requiere nuevo login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Implementación con Interceptor (Axios)
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si es 401 y no es una reintentatica
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            'http://localhost:8000/auth/refresh',
            { refresh_token: refreshToken }
          );

          // Guardar nuevo token
          localStorage.setItem('access_token', data.access_token);

          // Reintentar con nuevo token
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh falló, requiere nuevo login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 5️⃣ CAMBIAR CONTRASEÑA
**Endpoint:** `POST /auth/change-password`

#### Descripción
Permite que un usuario autenticado cambie su contraseña.

#### Headers Requeridos
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "current_password": "contraseña_actual",
  "new_password": "nueva_contraseña_123"
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|-----------|
| current_password | string | ✅ Sí | Contraseña actual | Debe ser correcta |
| new_password | string | ✅ Sí | Nueva contraseña | Mínimo 8 caracteres |

#### Response 200 (Éxito)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### Response 401 (Contraseña Incorrecta)
```json
{
  "detail": "Contraseña actual incorrecta"
}
```

#### Response 400 (Validación)
```json
{
  "detail": "La nueva contraseña debe ser diferente a la actual"
}
```

#### Códigos de Error
| Código | Descripción |
|--------|-------------|
| 401 | Token no válido o contraseña actual incorrecta |
| 400 | Validación de nueva contraseña fallida |
| 422 | Datos incompletos |

#### Ejemplo cURL
```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "MiContraseña123",
    "new_password": "NuevaContraseña456"
  }'
```

#### Ejemplo JavaScript
```javascript
const changePassword = async (accessToken, currentPassword, newPassword) => {
  try {
    const response = await fetch('http://localhost:8000/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al cambiar contraseña');
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

---

## 🔑 Manejo de Tokens

### Almacenamiento de Tokens

#### En Navegadores Web (localStorage)
```javascript
// Guardar
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// Obtener
const token = localStorage.getItem('access_token');

// Limpiar
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

#### En React Native/Expo (AsyncStorage)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar
await AsyncStorage.setItem('access_token', token);
await AsyncStorage.setItem('refresh_token', refreshToken);

// Obtener
const token = await AsyncStorage.getItem('access_token');

// Limpiar
await AsyncStorage.removeItem('access_token');
await AsyncStorage.removeItem('refresh_token');
```

### Estructura del JWT

Los tokens JWT constan de 3 partes separadas por puntos:
```
header.payload.signature
```

**Ejemplo Decodificado:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
{
  "sub": "1",
  "exp": 1702820400,
  "iat": 1702733400
}
[firma criptográfica]
```

**Campos:**
- `sub`: ID del usuario
- `exp`: Timestamp de expiración
- `iat`: Timestamp de emisión

### Verificar Expiración

```javascript
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

### Renovación Automática

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('access_token');

  if (token && isTokenExpired(token)) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken && !isTokenExpired(refreshToken)) {
      const { data } = await axios.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      token = data.access_token;
      localStorage.setItem('access_token', token);
    }
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## ❌ Códigos de Error

### Errores Comunes

| Código | Mensaje | Causa | Solución |
|--------|---------|-------|----------|
| 400 | "El email ya está registrado" | Email duplicado | Usar email diferente |
| 400 | "El username ya existe" | Username duplicado | Usar username diferente |
| 400 | "Email o contraseña incorrectos" | Credenciales inválidas | Verificar email y contraseña |
| 401 | "Token no válido o expirado" | Token inválido/expirado | Hacer login nuevamente |
| 401 | "Contraseña actual incorrecta" | Contraseña anterior incorrecta | Ingresar contraseña correcta |
| 422 | "Validation Error" | Datos incompletos | Verificar que se envíen todos los campos |
| 500 | "Internal Server Error" | Error en servidor | Reportar al equipo de desarrollo |

---

## 📚 Ejemplos Completos

### Ejemplo 1: Flujo Completo de Login en React

```jsx
import React, { useState } from 'react';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Error al iniciar sesión');
        return;
      }

      // Guardar tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir a dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default LoginComponent;
```

### Ejemplo 2: Context API para Autenticación

```jsx
import React, { createContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### Ejemplo 3: API Service con Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor de request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          localStorage.setItem('access_token', data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          
          return apiClient(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (email, username, password) =>
    apiClient.post('/auth/register', { email, username, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  getProfile: () =>
    apiClient.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
};

export default apiClient;
```

### Ejemplo 4: Hook personalizado para Login

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail);
        return false;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
      return true;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca expongas tokens en URLs**
   ```javascript
   // ❌ INCORRECTO
   fetch(`http://localhost:8000/auth/me?token=${token}`);

   // ✅ CORRECTO
   fetch('http://localhost:8000/auth/me', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

2. **Siempre usa HTTPS en producción**
   ```javascript
   // En desarrollo
   const API_URL = 'http://localhost:8000';

   // En producción
   const API_URL = 'https://api.agromind.com';
   ```

3. **Guarda tokens de forma segura**
   ```javascript
   // Navegadores: localStorage (o sessionStorage para mayor seguridad)
   localStorage.setItem('access_token', token);

   // React Native: AsyncStorage
   await AsyncStorage.setItem('access_token', token);

   // NUNCA en cookies sin flag HttpOnly
   ```

4. **Implementa CSRF Protection en formularios**
   ```javascript
   // En peticiones POST, PUT, DELETE
   headers: {
     'X-CSRFToken': csrfToken, // si está configurado
     'Content-Type': 'application/json'
   }
   ```

5. **Revoca tokens al logout**
   ```javascript
   const logout = () => {
     localStorage.removeItem('access_token');
     localStorage.removeItem('refresh_token');
     // Opcional: notificar al servidor
     fetch('http://localhost:8000/auth/logout', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${token}` }
     });
   };
   ```

6. **Maneja errores de forma segura**
   ```javascript
   // ❌ INCORRECTO
   catch(error) {
     console.log(error.response.data); // Puede exponer datos sensibles
   }

   // ✅ CORRECTO
   catch(error) {
     if (error.response?.status === 401) {
       // Redirigir a login
     } else {
       console.error('Error en la solicitud');
       // Mostrar mensaje genérico al usuario
     }
   }
   ```

### Headers de Seguridad

El API incluye estos headers automáticamente:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📋 Checklist para Frontend

- [ ] Endpoint de registro implementado
- [ ] Endpoint de login con almacenamiento de tokens
- [ ] Interceptor de Authorization en todas las peticiones
- [ ] Renovación automática de tokens
- [ ] Manejo de error 401 (token expirado)
- [ ] Endpoint /auth/me para obtener perfil
- [ ] Endpoint de cambio de contraseña
- [ ] Logout limpia tokens del almacenamiento
- [ ] Redirección a login si token es inválido
- [ ] Pruebas con Swagger UI (/docs)
- [ ] Validación de emails
- [ ] Validación de contraseñas fuertes
- [ ] Manejo de errores con mensajes claros

---

## 🧪 Pruebas

### Con Swagger UI
Puedes probar todas las rutas directamente en:
```
http://localhost:8000/docs
```

### Con Postman
1. Crea una colección "AgroMind Auth"
2. Configura variables de entorno:
   - `base_url`: http://localhost:8000
   - `access_token`: (se llena después del login)
   - `refresh_token`: (se llena después del login)
3. Importa estas rutas y prueba en orden

### Script de Prueba (Node.js)
```javascript
const https = require('http');

async function testAuth() {
  console.log('1. Probando Registro...');
  let registerRes = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123'
    })
  });
  console.log('✅ Registro:', registerRes.status);

  console.log('\n2. Probando Login...');
  let loginRes = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Password123'
    })
  });
  const loginData = await loginRes.json();
  console.log('✅ Login:', loginRes.status);
  const accessToken = loginData.access_token;

  console.log('\n3. Probando /auth/me...');
  let meRes = await fetch('http://localhost:8000/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  console.log('✅ Perfil:', meRes.status);

  console.log('\n4. Probando Cambio de Contraseña...');
  let changeRes = await fetch('http://localhost:8000/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      current_password: 'Password123',
      new_password: 'NewPassword456'
    })
  });
  console.log('✅ Cambio de contraseña:', changeRes.status);
}

testAuth().catch(console.error);
```

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el servidor FastAPI esté corriendo en `http://localhost:8000`
2. Revisa los logs del servidor para ver errores específicos
3. Usa Swagger UI (`/docs`) para ver documentación interactiva
4. Verifica que los tokens se almacenen correctamente
5. Valida que el formato del JWT sea correcto

---

**Documento generado:** 17 de diciembre de 2025  
**Versión:** 1.0  
**Última actualización:** Rutas de autenticación completamente documentadas
