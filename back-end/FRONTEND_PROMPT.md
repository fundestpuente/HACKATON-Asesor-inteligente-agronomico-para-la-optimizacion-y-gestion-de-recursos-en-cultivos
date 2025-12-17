# 📱 Prompt de Desarrollo - Frontend AgroMind IA (React Native)

## 📋 Descripción del Proyecto

Desarrollar una aplicación móvil nativa con **React Native** + **Expo** con una interfaz intuitiva para la plataforma AgroMind IA. El sistema debe permitir a usuarios autenticados gestionar cultivos, acceder a predicciones de IA (fertilizantes, recetas hidropónicas, detección de enfermedades) y visualizar estadísticas en Android e iOS.

**Stack recomendado:**
- **Framework**: React Native 0.72+ con Expo
- **Lenguaje**: TypeScript (recomendado)
- **State Management**: Redux Toolkit, Zustand, Context API o Jotai
- **UI Components**: React Native Paper, NativeBase, o components personalizados
- **HTTP Client**: Axios o fetch API nativo
- **Navigation**: React Navigation (v5+) con StackNavigator, DrawerNavigator, BottomTabNavigator
- **Maps (opcional)**: React Native Maps para ubicación de cultivos
- **Charts**: React Native SVG + Recharts o react-native-chart-kit para estadísticas
- **Camera (opcional)**: Expo Camera para detección de enfermedades
- **LocalStorage**: AsyncStorage para guardar tokens y datos offline

---

## 🗺️ Estructura de Navegación (React Navigation)

```
RootNavigator
├── AuthStack (si no está autenticado)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── AppStack (si está autenticado)
    ├── DrawerNavigator (Menú lateral)
    │   ├── DashboardStack
    │   │   ├── DashboardScreen
    │   │   ├── CropDetailsScreen
    │   │   └── CropStatsScreen
    │   │
    │   ├── CropsStack
    │   │   ├── CropsListScreen
    │   │   ├── CreateCropScreen
    │   │   ├── EditCropScreen
    │   │   ├── CropDetailsScreen
    │   │   ├── PredictionsScreen
    │   │   └── RecipesScreen
    │   │
    │   ├── AIStack
    │   │   ├── AIMenuScreen
    │   │   ├── FertilizerPredictorScreen
    │   │   ├── RecipeGeneratorScreen
    │   │   └── DiseaseDetectorScreen
    │   │
    │   ├── ProfileStack
    │   │   ├── ProfileScreen
    │   │   └── ChangePasswordScreen
    │   │
    │   └── SettingsScreen
    │
    └── Modal Screens (float por encima)
        ├── ImagePickerModal
        └── CropSelectorModal
```

---

## 📱 Vistas Principales

### 1. 🔐 Autenticación

#### 1.1 Página de Login (`/auth/login`)
**Componentes:**
- Campo de email con validación
- Campo de contraseña con toggle mostrar/ocultar
- Botón "Iniciar Sesión"
- Link "¿No tienes cuenta? Regístrate"
- Link "¿Olvidaste tu contraseña?" (placeholder para futura funcionalidad)
- Indicador de carga durante el envío
- Mensaje de error si credenciales son inválidas

**Funcionalidad:**
- Validar que email y password no estén vacíos
- Enviar POST a `/auth/login`
- Guardar `access_token` y `refresh_token` en localStorage/sessionStorage
- Guardar datos del usuario (id, email, username)
- Redirigir a `/dashboard` si login es exitoso
- Mostrar error 401 si credenciales son incorrectas

**API Call:**
```javascript
POST http://localhost:8000/auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "user": { id, email, username, is_active, is_admin }
}
```

#### 1.2 Página de Registro (`/auth/register`)
**Componentes:**
- Campo email
- Campo username
- Campo password
- Campo confirmar password (con validación de coincidencia)
- Botón "Registrarse"
- Link "¿Ya tienes cuenta? Inicia sesión"
- Validaciones en tiempo real

**Funcionalidad:**
- Validar formato de email
- Validar contraseña tenga mínimo 8 caracteres
- Validar que las contraseñas coinciden
- Enviar POST a `/auth/register`
- Si es exitoso, redirigir a `/auth/login` con mensaje "Registro exitoso, inicia sesión"
- Mostrar errores (email ya existe, validación inválida)

**API Call:**
```javascript
POST http://localhost:8000/auth/register
{
  "email": "nuevo@example.com",
  "username": "nuevouser",
  "password": "seguro123"
}

Response:
{
  "id": 1,
  "email": "nuevo@example.com",
  "username": "nuevouser",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-12-17..."
}
```

---

### 2. 🏠 Dashboard (Home Screen) (`/dashboard`)

**Componentes principales:**
- **Header**: Logo, nombre usuario, botón logout
- **Sidebar**: Menú lateral (ver sección 3)
- **Contenido principal:**
  - Card "Bienvenida" con nombre de usuario
  - Grid de 4 cards con resumen:
    - Total de cultivos activos
    - Últimas predicciones
    - Enfermedades detectadas
    - Estadísticas generales
  - Card "Cultivos Recientes" (últimos 5 cultivos)
  - Card "Acciones Rápidas" con botones:
    - Crear nuevo cultivo
    - Analizar enfermedad
    - Generar receta

**Funcionalidad:**
- Al cargar, obtener datos del usuario (`GET /auth/me`)
- Listar cultivos (`GET /crops`) con limit=5
- Mostrar indicadores visuales (gráficos simples o números)
- Todos los botones redirigen a sus respectivas rutas
- Actualizar datos cada 30 segundos (opcional)

**API Calls:**
```javascript
GET http://localhost:8000/auth/me
Headers: { Authorization: "Bearer <access_token>" }

GET http://localhost:8000/crops?limit=5
Headers: { Authorization: "Bearer <access_token>" }
```

---

### 3. 📌 Menú Lateral (Sidebar)

**Items del menú:**
```
├── 🏠 Dashboard (redirige a /dashboard)
├── 🌾 Mis Cultivos (redirige a /crops)
│   ├── ➕ Crear Cultivo (redirige a /crops/create)
│   └── [Sub-items dinámicos de cultivos activos]
├── 🤖 Herramientas IA (expandible)
│   ├── 🍃 Recomendación de Fertilizante (redirige a /ai/predict)
│   ├── 🧪 Generador de Receta Hidropónica (redirige a /ai/recipe)
│   └── 🔍 Detección de Enfermedades (redirige a /ai/disease-detection)
├── ⚙️ Configuración (redirige a /settings)
├── 👤 Perfil (redirige a /profile)
└── 🚪 Cerrar Sesión (logout)
```

**Funcionalidad del Sidebar:**
- Responsive: colapsable en dispositivos móviles
- Indicador visual del item activo (highlighted)
- Mostrar nombre de usuario y avatar (placeholder)
- Cargar cultivos dinámicamente desde API
- Si se hace click en un cultivo del sidebar, ir a `/crops/:id`
- Botón flotante "+" para crear cultivo rápidamente

**Estilos:**
- Ancho: 250px (desktop), collapsable a 60px (móvil)
- Color de fondo: Tema de la app (ej. verde agrícola)
- Transiciones suaves al expandir/contraer

---

### 4. 🌾 Gestión de Cultivos

#### 4.1 Listado de Cultivos (`/crops`)
**Componentes:**
- **Header**: Título "Mis Cultivos", botón "+ Crear Cultivo"
- **Filtros** (opcional pero recomendado):
  - Filtro por estado (activo, cosechado, inactivo)
  - Filtro por tipo de cultivo
  - Buscador por nombre
- **Grid/Tabla** con cultivos:
  - Cada fila es una card o item de lista
  - Mostrar: nombre, tipo, ubicación (si existe), estado, área, fecha creación
  - Botones de acción por cultivo:
    - 👁️ Ver detalles (redirige a `/crops/:id`)
    - ✏️ Editar (redirige a `/crops/:id/edit`)
    - 📊 Estadísticas (redirige a `/crops/:id/stats`)
    - 🗑️ Eliminar (con confirmación)
- **Paginación**: si hay más de 10 cultivos

**Funcionalidad:**
- Cargar cultivos con `GET /crops`
- Permitir filtrar/buscar localmente
- Ao hacer click en "Ver detalles", ir a `/crops/:id`
- Al eliminar, confirmar y llamar `DELETE /crops/:id`
- Mostrar mensaje si no hay cultivos (button "Crear primero cultivo")

**API Calls:**
```javascript
GET http://localhost:8000/crops?crop_type=tomate&status=active&skip=0&limit=10
Headers: { Authorization: "Bearer <access_token>" }

DELETE http://localhost:8000/crops/:id
Headers: { Authorization: "Bearer <access_token>" }
```

#### 4.2 Crear Cultivo (`/crops/create`)
**Formulario:**
- Campo "Nombre" (texto, requerido)
- Campo "Tipo de Cultivo" (dropdown, requerido)
  - Opciones predefinidas: tomate, lechuga, papa, etc. (ver API_DOCUMENTATION.md)
- Campo "Área" (número, opcional)
- Campo "Latitud" (número, opcional)
- Campo "Longitud" (número, opcional)
  - Opción: mapa interactivo para seleccionar ubicación (Leaflet)
- Campo "Estado" (dropdown, default "active")
  - Opciones: active, harvested, inactive
- Botones: "Crear" y "Cancelar"

**Funcionalidad:**
- Validar que nombre y tipo no estén vacíos
- Permitir geolocalización automática (navigator.geolocation)
- Enviar POST a `/crops` con los datos
- Si es exitoso, redirigir a `/crops/:id` con mensaje "Cultivo creado"
- Si hay error, mostrar mensaje descriptivo

**API Call:**
```javascript
POST http://localhost:8000/crops
Headers: { 
  Authorization: "Bearer <access_token>",
  Content-Type: "application/json"
}
Body: {
  "name": "Tomates Cherry",
  "crop_type": "tomate",
  "location_lat": 4.6097,
  "location_long": -74.0817,
  "area": 250.5,
  "status": "active"
}
```

#### 4.3 Detalle de Cultivo (`/crops/:id`)
**Componentes:**
- **Header**: Nombre del cultivo, estado (badge con color)
- **Tabs/Secciones**:
  1. **Información General**
     - Nombre, tipo, área, ubicación (mapa si existe)
     - Fecha creación/actualización
     - Botón "Editar"
  
  2. **Predicciones** (Fertilizante)
     - Tabla con historial de predicciones
     - Columnas: fecha, pH, NPK valores, recomendación
     - Botón "Nueva Predicción" redirige a `/ai/predict?crop_id=:id`
  
  3. **Recetas Hidropónicas**
     - Tabla con recetas guardadas
     - Columnas: fecha, semana, tanque (L), pH, componentes (N, P, K, Ca, Mg, S)
     - Botón "Generar Nueva Receta" redirige a `/ai/recipe?crop_id=:id`
  
  4. **Estadísticas**
     - Resumen de datos (total predicciones, recetas, detecciones)
     - Gráficos simples de NPK promedios
     - Tabla de enfermedades detectadas

**Funcionalidad:**
- Cargar cultivo con `GET /crops/:id`
- Cargar predicciones con `GET /crops/:id/predictions`
- Cargar recetas con `GET /crops/:id/hydro-recipes`
- Cargar stats con `GET /crops/:id/stats`
- Tabs con lazy loading (cargar datos bajo demanda)

**API Calls:**
```javascript
GET http://localhost:8000/crops/:id
GET http://localhost:8000/crops/:id/predictions
GET http://localhost:8000/crops/:id/hydro-recipes
GET http://localhost:8000/crops/:id/stats
Headers: { Authorization: "Bearer <access_token>" }
```

#### 4.4 Editar Cultivo (`/crops/:id/edit`)
**Formulario:**
- Campos iguales a crear cultivo pero pre-rellenados
- Botones: "Actualizar" y "Cancelar"

**Funcionalidad:**
- Cargar datos actuales con `GET /crops/:id`
- Rellenar form con los datos
- Enviar PUT a `/crops/:id`
- Redirigir a `/crops/:id` si es exitoso

**API Call:**
```javascript
PUT http://localhost:8000/crops/:id
Body: { campos a actualizar, solo los que cambien }
```

---

### 5. 🤖 Herramientas de IA

#### 5.1 Recomendación de Fertilizante (`/ai/predict`)
**Componentes:**
- **Header**: Título "Recomendador de Fertilizante"
- **Formulario:**
  - Selector "Cultivo" (dropdown de cultivos del usuario)
    - **Opción especial**: si viene de `/crops/:id`, preseleccionar ese cultivo
  - Campo "pH del Suelo" (número, 0-14)
  - **Campos opcionales** (si no se selecciona cultivo):
    - Campo "Latitud"
    - Campo "Longitud"
    - O un mapa para seleccionar ubicación
  - Botón "Generar Recomendación"
- **Resultado** (después de enviar):
  - Card con:
    - Nutrientes recomendados (N, P, K con valores numéricos)
    - Datos de clima obtenidos (temperatura, humedad, lluvia)
    - Recomendación en texto (ej. "Se recomienda fertilizante 20-10-10...")
    - Botón "Guardar" (guarda en historial del cultivo)
    - Botón "Nueva Búsqueda"

**Funcionalidad:**
- Si viene query param `crop_id`, preseleccionar y cargar datos del cultivo
- Si no hay cultivos, mostrar mensaje y redirigir a crear cultivo
- Validar pH entre 0 y 14
- Enviar POST a `/predict?crop_id=:cropId` (si hay cultivo seleccionado)
- Mostrar resultado en tiempo real
- Guardar automáticamente al generar (opcional)

**API Calls:**
```javascript
GET http://localhost:8000/crops (para llenar dropdown)

POST http://localhost:8000/predict?crop_id=1
Body: { "ph": 6.5 }

Response:
{
  "success": true,
  "nutrientes_requeridos": { "N": 85.5, "P": 45.2, "K": 50.8 },
  "datos_clima": { "temperature": 25.3, "humidity": 65.2, "rainfall": 120.5 },
  "recomendacion": "Se recomienda fertilizante 20-10-10...",
  "prediction_id": 1,
  "saved": true
}
```

#### 5.2 Generador de Receta Hidropónica (`/ai/recipe`)
**Componentes:**
- **Header**: Título "Generador de Receta Hidropónica"
- **Formulario:**
  - Selector "Cultivo" (dropdown de cultivos del usuario, preseleccionar si viene `crop_id`)
  - Campo "Semana del Ciclo" (número, 1-20)
  - Campo "Litros del Tanque" (número)
  - Campo "pH del Agua" (número, 0-14)
  - **Campos opcionales**:
    - Latitud
    - Longitud
  - Botón "Generar Receta"
- **Resultado**:
  - Card con:
    - Cultivo seleccionado
    - Semana y litros usados
    - Clima obtenido
    - Tabla de componentes (N, P, K, Ca, Mg, S) con valores
    - Botón "Guardar Receta"
    - Botón "Nueva Receta"

**Funcionalidad:**
- Preseleccionar cultivo si viene `crop_id`
- Validar semana entre 1 y 20, volumen > 0, pH 0-14
- Enviar POST a `/generate-recipe?crop_id=:cropId`
- Mostrar resultado formateado
- Guardar automáticamente al generar

**API Call:**
```javascript
POST http://localhost:8000/generate-recipe?crop_id=1
Body: {
  "week": 2,
  "tank_liters": 100,
  "ph_water": 6.0
}

Response:
{
  "success": true,
  "cultivo": "lechuga",
  "semana": 2,
  "tanque_litros": 100.0,
  "ph_agua": 6.0,
  "clima": { "temperature": 22.5, "humidity": 70.0 },
  "receta_optimizada": { "N": 150.5, "P": 50.2, "K": 200.8, ... },
  "recipe_id": 1,
  "saved": true
}
```

#### 5.3 Detección de Enfermedades (`/ai/disease-detection`)
**Componentes:**
- **Header**: Título "Detección de Enfermedades"
- **Zona de carga de imagen**:
  - Drag & drop area o input file
  - Mostrar vista previa de imagen seleccionada
  - Botón "Analizar Imagen"
- **Selector "Cultivo"** (opcional, para guardar con cultivo)
- **Resultado**:
  - Card con:
    - Imagen enviada (preview)
    - Diagnóstico (ej. "Tomate_Sano", "Tomate_Bacteria")
    - Confianza (porcentaje)
    - Descripción del diagnóstico
    - Botón "Guardar Análisis"
    - Botón "Analizar Otra Imagen"
- **Historial** (abajo):
  - Tabla con últimas detecciones del usuario
  - Mostrar imagen pequeña, fecha, diagnóstico, cultivo (si existe)

**Funcionalidad:**
- Validar que el archivo sea imagen (png, jpg, jpeg)
- Enviar POST a `/predict-image` con FormData
- Mostrar loading mientras se procesa
- Mostrar resultado con confianza visualmente (progress bar)
- Permitir guardar análisis (asociar a cultivo si se selecciona)
- Cargar historial con `GET /crops/:cropId/predictions` (si hay crop_id)

**API Call:**
```javascript
POST http://localhost:8000/predict-image
Headers: { Authorization: "Bearer <access_token>" }
Form Data:
  - file: File
  - crop_id: integer (opcional)

Response:
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

---

### 6. 👤 Perfil de Usuario (`/profile`)
**Componentes:**
- Card con información del usuario:
  - Email
  - Username
  - Fecha de registro
  - Avatar (placeholder o imagen)
- Botón "Editar Perfil"
- Sección "Cambiar Contraseña":
  - Campo contraseña actual
  - Campo contraseña nueva
  - Campo confirmar contraseña nueva
  - Botón "Actualizar Contraseña"

**Funcionalidad:**
- Cargar datos con `GET /auth/me`
- Enviar POST a `/auth/change-password` para cambiar contraseña
- Mostrar mensaje de éxito
- Validar que contraseña nueva != contraseña actual

**API Call:**
```javascript
POST http://localhost:8000/auth/change-password
Body: {
  "current_password": "old",
  "new_password": "new"
}
```

---

### 7. ⚙️ Configuración (`/settings`)
**Componentes:**
- Preferencias de notificaciones
- Tema oscuro/claro (toggle)
- Idioma (si se añade i18n)
- Privacidad
- Eliminar cuenta (con confirmación)

---

## 🔐 Gestión de Autenticación

### Context/Store Global
Crear un contexto o store (Redux, Zustand, Context API) que maneje:
- `accessToken`: guardado en localStorage/sessionStorage
- `refreshToken`: guardado de forma segura
- `user`: datos del usuario
- `isAuthenticated`: boolean
- `isLoading`: estado de carga
- Funciones: `login()`, `register()`, `logout()`, `refreshToken()`

### Protected Routes
Crear un componente `PrivateRoute` o equivalente que:
- Verifique si `isAuthenticated` es true
- Si no, redirigir a `/auth/login`
- Si sí, renderizar el componente solicitado

### Interceptor HTTP
Configurar un interceptor que:
- Agregue el `Authorization: Bearer <token>` a todas las peticiones
- Si recibe 401, intentar refrescar el token
- Si el refresh falla, redirigir a login

---

## 🛠️ Estructura de Carpetas Recomendada (React)

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── LogoutButton.jsx
│   ├── Layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── MainLayout.jsx
│   ├── Crops/
│   │   ├── CropCard.jsx
│   │   ├── CropForm.jsx
│   │   ├── CropTable.jsx
│   │   └── CropDetails.jsx
│   ├── AI/
│   │   ├── FertilizerPredictor.jsx
│   │   ├── RecipeGenerator.jsx
│   │   └── DiseaseDetector.jsx
│   └── Common/
│       ├── Loading.jsx
│       ├── ErrorMessage.jsx
│       └── SuccessMessage.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CropsPage.jsx
│   ├── CropDetailPage.jsx
│   ├── AIPage.jsx
│   └── ProfilePage.jsx
├── services/
│   ├── api.js (configuración de axios/fetch)
│   ├── authService.js
│   ├── cropService.js
│   └── aiService.js
├── context/
│   ├── AuthContext.js
│   └── NotificationContext.js (opcional)
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useLocalStorage.js
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
├── styles/
│   ├── globals.css
│   └── App.css
├── App.jsx
└── main.jsx
```

---

## 📱 Pantallas Principales

### 1. 🔐 Autenticación

#### 1.1 Pantalla de Login (`LoginScreen`)
**Componentes:**
```jsx
<ScrollView>
  <Image source={require('./logo.png')} />
  <Text>AgroMind IA</Text>
  <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
  <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
  <TouchableOpacity onPress={handleLogin}>
    <Text>Iniciar Sesión</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
    <Text>¿No tienes cuenta? Regístrate</Text>
  </TouchableOpacity>
</ScrollView>
```

**Funcionalidad:**
- Campos de email y contraseña
- Botón "Iniciar Sesión" que valida y llama a `POST /auth/login`
- Link a pantalla de registro
- Indicador de carga durante petición
- Mostrar error si credenciales son inválidas (Alert)
- Guardar `access_token` y `refresh_token` en AsyncStorage
- Redirigir a DashboardScreen si login es exitoso

**API Call:**
```javascript
POST http://localhost:8000/auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

#### 1.2 Pantalla de Registro (`RegisterScreen`)
**Componentes:**
- TextInput para email
- TextInput para username
- TextInput para contraseña (secureTextEntry)
- TextInput para confirmar contraseña
- Botón "Registrarse"
- Link a pantalla de login

**Funcionalidad:**
- Validar email, username y contraseñas
- Contraseña mínimo 8 caracteres
- Validar que las contraseñas coinciden
- Enviar `POST /auth/register`
- Si es exitoso, mostrar mensaje de éxito y navegar a LoginScreen
- Mostrar errores con Alert

---

### 2. 🏠 Dashboard (`DashboardScreen`)

**Componentes:**
```jsx
<SafeAreaView>
  <Header userName={user.username} onLogout={handleLogout} />
  <ScrollView>
    <WelcomeCard userName={user.username} />
    
    <SummaryCard
      label="Cultivos Activos"
      value={activeCrops}
      icon="leaf"
    />
    
    <SummaryCard
      label="Últimas Predicciones"
      value={lastPredictions}
      icon="chart"
    />
    
    <SummaryCard
      label="Enfermedades Detectadas"
      value={diseases}
      icon="alert"
    />
    
    <RecentCropsSection crops={recentCrops} />
    
    <QuickActionsSection
      onCreateCrop={() => navigation.navigate('CreateCrop')}
      onAnalyzeDisease={() => navigation.navigate('DiseaseDetector')}
      onGenerateRecipe={() => navigation.navigate('RecipeGenerator')}
    />
  </ScrollView>
</SafeAreaView>
```

**Funcionalidad:**
- Cargar datos del usuario (`GET /auth/me`)
- Obtener cultivos activos (`GET /crops?status=active`)
- Mostrar resumen con 4 cards
- Lista de últimos 5 cultivos con opción para ver detalles
- Botones rápidos para acciones principales
- Pull-to-refresh para actualizar datos

**API Calls:**
```javascript
GET http://localhost:8000/auth/me
GET http://localhost:8000/crops?status=active&limit=5
```

---

### 3. 📌 Menú Lateral (DrawerNavigator)

**Items del menú:**
```
├── 🏠 Dashboard
├── 🌾 Mis Cultivos
│   └── ➕ Crear Cultivo (nested action)
├── 🤖 Herramientas IA
│   ├── 🍃 Recomendación Fertilizante
│   ├── 🧪 Generador Receta
│   └── 🔍 Detección Enfermedades
├── 👤 Perfil
├── ⚙️ Configuración
└── 🚪 Cerrar Sesión
```

**Implementación:**
```javascript
<Drawer.Navigator
  screenOptions={{
    headerShown: true,
    drawerActiveTintColor: '#4CAF50',
  }}
>
  <Drawer.Screen name="Dashboard" component={DashboardStack} />
  <Drawer.Screen name="Crops" component={CropsStack} />
  <Drawer.Screen name="AI" component={AIStack} />
  <Drawer.Screen name="Profile" component={ProfileStack} />
  <Drawer.Screen name="Settings" component={SettingsScreen} />
</Drawer.Navigator>
```

**Funcionalidad:**
- Menú swipeable desde izquierda
- Avatar y nombre de usuario arriba
- Items con iconos
- Logout button con confirmación

---

### 4. 🌾 Gestión de Cultivos

#### 4.1 Listado de Cultivos (`CropsListScreen`)
**Componentes:**
```jsx
<FlatList
  data={crops}
  renderItem={({ item }) => (
    <CropCard
      crop={item}
      onPress={() => navigation.navigate('CropDetails', { id: item.id })}
      onEdit={() => navigation.navigate('EditCrop', { id: item.id })}
      onDelete={() => handleDeleteCrop(item.id)}
    />
  )}
  keyExtractor={item => item.id.toString()}
  ListEmptyComponent={<EmptyStateComponent />}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>
```

**Funcionalidad:**
- Cargar cultivos con `GET /crops`
- Mostrar en lista/grid con cards
- Cada card muestra: nombre, tipo, ubicación (si existe), estado
- Acciones por card: ver detalles, editar, eliminar
- Pull-to-refresh
- Filtros opcionales (tipo, estado)
- FloatingActionButton para crear cultivo

#### 4.2 Crear Cultivo (`CreateCropScreen`)
**Formulario:**
```jsx
<ScrollView>
  <TextInput
    placeholder="Nombre del cultivo"
    value={name}
    onChangeText={setName}
  />
  <Picker
    selectedValue={cropType}
    onValueChange={setCropType}
  >
    <Picker.Item label="Tomate" value="tomate" />
    <Picker.Item label="Lechuga" value="lechuga" />
    {/* ... más opciones */}
  </Picker>
  <TextInput
    placeholder="Área (m²)"
    value={area}
    onChangeText={setArea}
    keyboardType="decimal-pad"
  />
  <Button title="Usar Geolocalización" onPress={getLocation} />
  <TextInput
    placeholder="Latitud"
    value={latitude}
    onChangeText={setLatitude}
    editable={false}
  />
  <TextInput
    placeholder="Longitud"
    value={longitude}
    onChangeText={setLongitude}
    editable={false}
  />
  <Picker
    selectedValue={status}
    onValueChange={setStatus}
  >
    <Picker.Item label="Activo" value="active" />
    <Picker.Item label="Cosechado" value="harvested" />
    <Picker.Item label="Inactivo" value="inactive" />
  </Picker>
  <Button title="Crear Cultivo" onPress={handleCreateCrop} />
</ScrollView>
```

**Funcionalidad:**
- Obtener ubicación automáticamente con `expo-location`
- Validar campos requeridos
- Enviar `POST /crops`
- Si es exitoso, navegar a `CropDetails` con el nuevo cultivo
- Mostrar errores con Alert

#### 4.3 Detalle de Cultivo (`CropDetailsScreen`)
**Componentes:**
- Header con nombre y estado
- Card de información general
- TabView con 3 tabs:
  1. **Información**
     - Nombre, tipo, área, ubicación (mapa pequeño)
     - Fecha de creación
  2. **Predicciones**
     - FlatList con predicciones de fertilizante
     - Botón para nueva predicción
  3. **Recetas**
     - FlatList con recetas hidropónicas
     - Botón para generar nueva receta

**Funcionalidad:**
- Cargar cultivo con `GET /crops/:id`
- Cargar predicciones con `GET /crops/:id/predictions`
- Cargar recetas con `GET /crops/:id/hydro-recipes`
- Lazy load de cada tab
- Botones rápidos para generar predicción/receta

---

### 5. 🤖 Herramientas de IA

#### 5.1 Recomendador de Fertilizante (`FertilizerPredictorScreen`)
**Componentes:**
```jsx
<ScrollView>
  <Picker
    selectedValue={selectedCropId}
    onValueChange={setSelectedCropId}
  >
    <Picker.Item label="Selecciona un cultivo" value={null} />
    {crops.map(crop => (
      <Picker.Item key={crop.id} label={crop.name} value={crop.id} />
    ))}
  </Picker>
  
  <TextInput
    placeholder="pH del Suelo (0-14)"
    value={ph}
    onChangeText={setPh}
    keyboardType="decimal-pad"
  />
  
  <TouchableOpacity
    style={styles.button}
    onPress={handlePredict}
    disabled={loading}
  >
    <Text>{loading ? 'Procesando...' : 'Generar Recomendación'}</Text>
  </TouchableOpacity>
  
  {result && (
    <ResultCard>
      <Text>Nitrógeno (N): {result.nutrientes_requeridos.N.toFixed(2)}</Text>
      <Text>Fósforo (P): {result.nutrientes_requeridos.P.toFixed(2)}</Text>
      <Text>Potasio (K): {result.nutrientes_requeridos.K.toFixed(2)}</Text>
      <Text>Temperatura: {result.datos_clima.temperature}°C</Text>
      <Text>Humedad: {result.datos_clima.humidity}%</Text>
      <Text style={styles.recommendation}>{result.recomendacion}</Text>
    </ResultCard>
  )}
</ScrollView>
```

**Funcionalidad:**
- Selector de cultivo (dropdown con cultivos del usuario)
- Campo pH con validación
- Si viene `cropId` como parámetro, preseleccionar
- Enviar `POST /predict?crop_id=:cropId`
- Mostrar resultado con valores formateados
- Mostrar clima obtenido
- Guardar automáticamente al generar

#### 5.2 Generador de Receta (`RecipeGeneratorScreen`)
**Similar a FertilizerPredictor pero con campos:**
- Selector cultivo
- Campo "Semana" (1-20)
- Campo "Litros del Tanque"
- Campo "pH del Agua"
- Resultado con tabla de componentes (N, P, K, Ca, Mg, S)

**Funcionalidad:**
- Validar inputs
- Enviar `POST /generate-recipe?crop_id=:cropId`
- Mostrar receta optimizada
- Guardar automáticamente

#### 5.3 Detección de Enfermedades (`DiseaseDetectorScreen`)
**Componentes:**
```jsx
<View>
  <Button
    title="Tomar Foto"
    onPress={takePhoto}
  />
  
  <Button
    title="Seleccionar de Galería"
    onPress={pickImage}
  />
  
  {imageUri && (
    <Image
      source={{ uri: imageUri }}
      style={{ width: 300, height: 300 }}
    />
  )}
  
  <Button
    title="Analizar Imagen"
    onPress={handleAnalyze}
    disabled={!imageUri}
  />
  
  {result && (
    <ResultCard>
      <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {result.data.class}
      </Text>
      <Text>Confianza: {result.data.confidence}</Text>
      <Text>{result.data.message}</Text>
    </ResultCard>
  )}
  
  {historialItems.length > 0 && (
    <FlatList
      data={historialItems}
      renderItem={({ item }) => (
        <HistoryItem item={item} />
      )}
      keyExtractor={item => item.id.toString()}
    />
  )}
</View>
```

**Funcionalidad:**
- Usar `expo-camera` o `expo-image-picker` para fotos
- Preview de imagen seleccionada
- Enviar `POST /predict-image` con FormData
- Mostrar diagnóstico, confianza, descripción
- Mostrar historial de análisis previos
- Permitir asociar a cultivo

---

### 6. 👤 Perfil de Usuario (`ProfileScreen`)
**Componentes:**
- Avatar con opción cambiar
- Nombre de usuario
- Email
- Fecha de registro
- Sección "Cambiar Contraseña"
  - TextInput contraseña actual
  - TextInput contraseña nueva
  - TextInput confirmar contraseña nueva
  - Botón "Actualizar"

**Funcionalidad:**
- Cargar datos con `GET /auth/me`
- Validar contraseñas
- Enviar `POST /auth/change-password`

---

### 7. ⚙️ Configuración (`SettingsScreen`)
**Opciones:**
- Toggle tema oscuro/claro
- Notificaciones push (ON/OFF)
- Idioma
- Versión de app
- Eliminar cuenta (con confirmación)

---

## 🔐 Gestión de Autenticación

### AuthContext
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const authContext = {
    ...state,
    signUp: async (email, username, password) => { /* ... */ },
    signIn: async (email, password) => { /* ... */ },
    signOut: async () => { /* ... */ },
    signUp: async (refreshToken) => { /* ... */ }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Guardando Tokens
```javascript
// AsyncStorage para persistencia
await AsyncStorage.setItem('access_token', accessToken);
await AsyncStorage.setItem('refresh_token', refreshToken);
await AsyncStorage.setItem('user', JSON.stringify(user));
```

### Interceptor HTTP
```javascript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refrescar token
      // Si falla, logout
    }
    return Promise.reject(error);
  }
);
```

---

## 📁 Estructura de Carpetas

```
app/
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── Dashboard/
│   │   └── DashboardScreen.tsx
│   ├── Crops/
│   │   ├── CropsListScreen.tsx
│   │   ├── CreateCropScreen.tsx
│   │   ├── EditCropScreen.tsx
│   │   ├── CropDetailsScreen.tsx
│   │   ├── PredictionsScreen.tsx
│   │   └── RecipesScreen.tsx
│   ├── AI/
│   │   ├── AIMenuScreen.tsx
│   │   ├── FertilizerPredictorScreen.tsx
│   │   ├── RecipeGeneratorScreen.tsx
│   │   └── DiseaseDetectorScreen.tsx
│   ├── Profile/
│   │   ├── ProfileScreen.tsx
│   │   └── ChangePasswordScreen.tsx
│   └── SettingsScreen.tsx
│
├── components/
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── SuccessMessage.tsx
│   ├── Crops/
│   │   ├── CropCard.tsx
│   │   └── CropForm.tsx
│   ├── AI/
│   │   ├── ResultCard.tsx
│   │   └── PredictionChart.tsx
│   └── Navigation/
│       └── DrawerContent.tsx
│
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── cropService.ts
│   └── aiService.ts
│
├── context/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useAsyncStorage.ts
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── AppNavigator.tsx
│
├── types/
│   ├── index.ts
│   └── api.ts
│
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
├── styles/
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── App.tsx
└── app.json
```

