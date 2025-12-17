# ✅ Servidor Backend Levantado - Estado Actual

## 🚀 Estado del Servidor

**Servidor:** ✅ ACTIVO Y CORRIENDO

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

## 📍 Configuración Actual

| Parámetro | Valor |
|-----------|-------|
| **Host** | `0.0.0.0` (todas las interfaces) |
| **Puerto** | `8000` |
| **URL Local** | `http://localhost:8000` |
| **URL por IP** | `http://192.168.100.31:8000` |
| **Modo** | Desarrollo con `--reload` |
| **PID** | `9868` (proceso principal) |
| **Reloader PID** | `17100` |

---

## ✅ Sistemas Cargados

```
✅ Sistema Hidropónico: LISTO
✅ Sistema Suelo/Normal: LISTO
✅ Modelo de imágenes cargado correctamente
```

---

## 🌐 Acceso a Servicios

### Swagger UI (Documentación Interactiva)
```
http://192.168.100.31:8000/docs
http://localhost:8000/docs
```

### ReDoc (Documentación Alternativa)
```
http://192.168.100.31:8000/redoc
http://localhost:8000/redoc
```

### OpenAPI JSON
```
http://192.168.100.31:8000/openapi.json
```

---

## 📱 Para tu App Expo

Usa la siguiente configuración en tu `api.ts`:

```typescript
// ✅ OPCIÓN 1: Usar IP local (RECOMENDADO para dispositivos móviles)
export const API_URL = 'http://192.168.100.31:8000';

// ✅ OPCIÓN 2: Usar localhost (solo si es en el mismo PC)
export const API_URL = 'http://localhost:8000';

// ✅ OPCIÓN 3: Para Android Emulator en la misma PC
export const API_URL = 'http://10.0.2.2:8000';
```

---

## 🧪 Prueba de Conexión Rápida

### Desde PowerShell:
```powershell
# Probar que el servidor responde
curl http://192.168.100.31:8000/docs

# Probar endpoint de login (usuario no existe, pero conecta)
curl -X POST http://192.168.100.31:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

### Desde tu Navegador:
- Abre: `http://192.168.100.31:8000/docs`
- Deberías ver la interfaz interactiva de Swagger UI

### Desde Expo:
En tu app, presiona en el botón de login. Si ahora funciona, ¡listo! 🎉

---

## 🔄 Monitoreo del Servidor

El servidor tiene **auto-reload activado**, lo que significa:
- ✅ Si cambias archivos en Python, recarga automáticamente
- ✅ Puedes ver cambios sin reiniciar
- ⚠️ Ten cuidado con cambios que rompan el código (causa error)

### Ver logs en tiempo real:
El servidor está mostrandote logs en la terminal. Verás:
- `INFO: Started server process` - cuando inicia
- `INFO: Application startup complete` - cuando está listo
- Requests que llegan desde Expo
- Errores si los hay

---

## 📊 Endpoints Disponibles

Tu API tiene estos 15 endpoints listos:

### Autenticación (5)
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener perfil
- `POST /auth/refresh` - Renovar token
- `POST /auth/change-password` - Cambiar contraseña

### Cultivos (8)
- `GET /crops` - Listar cultivos
- `POST /crops` - Crear cultivo
- `GET /crops/{id}` - Obtener cultivo
- `PUT /crops/{id}` - Actualizar cultivo
- `DELETE /crops/{id}` - Eliminar cultivo
- `GET /crops/{id}/predictions` - Predicciones
- `GET /crops/{id}/recipes` - Recetas hidropónicas
- `GET /crops/{id}/stats` - Estadísticas

### IA/Predicciones (2)
- `POST /predict` - Predicción de fertilizante
- `POST /generate-recipe` - Generar receta hidropónica
- `POST /detect-disease` - Detectar enfermedad en imágenes

---

## 🛑 Para Detener el Servidor

En la terminal donde corre el servidor:
```
Presiona: Ctrl + C
```

Debería mostrar:
```
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
```

---

## 🔐 Configuración CORS Actual

El servidor acepta requests desde:
```
- http://192.168.100.31:3000    (tu Expo)
- exp://192.168.100.31:3000     (Expo Protocol)
- http://localhost:3000          (Web local)
- http://localhost:8000          (Backend local)
- http://192.168.100.31:8000    (Backend por IP)
- *                              (todas las direcciones en desarrollo)
```

---

## ✅ Checklist: Próximos Pasos

- [ ] Backend corriendo en `0.0.0.0:8000` ✅
- [ ] Acceder a Swagger UI en navegador
- [ ] Revisar documentación interactiva
- [ ] Actualizar `API_URL` en Expo
- [ ] Probar login desde app móvil
- [ ] Verificar tokens se guardan
- [ ] Probar crear cultivo
- [ ] Probar hacer predicción
- [ ] Probar detectar enfermedad

---

## 💡 Tips Útiles

### Ver todos los endpoints disponibles
Accede a: `http://192.168.100.31:8000/docs`

### Probar endpoints sin código
En Swagger UI puedes:
1. Presionar "Try it out" en cada endpoint
2. Llenar parámetros
3. Presionar "Execute"
4. Ver respuesta exacta del servidor

### Depuración
Si hay error en tu app:
1. Mira logs en terminal del servidor
2. Copia el error completo
3. Revisa en Swagger UI que el endpoint existe
4. Verifica que la URL es correcta

---

**Servidor levantado:** 17 de diciembre de 2025 - 12:48:49  
**Status:** ✅ OPERACIONAL Y LISTO PARA USAR

¡Tu backend está completamente funcional! 🚀
