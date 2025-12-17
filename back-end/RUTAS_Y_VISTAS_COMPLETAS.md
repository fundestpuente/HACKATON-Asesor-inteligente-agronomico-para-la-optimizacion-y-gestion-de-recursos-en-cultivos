# 📱 Documentación Completa de Rutas y Vistas - AgroMind IA Frontend

## 📋 Tabla de Contenidos

1. [Estructura de Navegación](#estructura-de-navegación)
2. [Rutas de Autenticación](#rutas-de-autenticación)
3. [Rutas de Cultivos](#rutas-de-cultivos)
4. [Rutas de IA/Predicciones](#rutas-de-iaméreodicciones)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Descripción de Vistas](#descripción-de-vistas)
7. [Flujos de Datos](#flujos-de-datos)
8. [Ejemplos de Integración](#ejemplos-de-integración)

---

## 🗺️ Estructura de Navegación

### Diagrama de Flujo
```
┌─────────────────────────────────────────────────────┐
│         APP AGROMIND IA (Inicial)                   │
└─────────┬───────────────────────────────────────────┘
          │
          ├──────────────────────────┐
          │                          │
    ¿Usuario logueado?           NO │ SÍ
          │                          │
          ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  AUTH STACK      │      │   APP STACK      │
    │  (WelcomeScreen) │      │  (DrawerNav)     │
    └──────┬───────────┘      └──────┬───────────┘
           │                         │
           ├─ LoginScreen            ├─ DashboardScreen
           └─ RegisterScreen         │
                                     ├─ CropsStack
                                     │   ├─ CropsListScreen
                                     │   ├─ CreateCropScreen
                                     │   ├─ CropDetailScreen
                                     │   └─ EditCropScreen
                                     │
                                     ├─ PredictionsStack
                                     │   ├─ FertilizerPredictorScreen
                                     │   ├─ HydroRecipeScreen
                                     │   └─ PredictionHistoryScreen
                                     │
                                     ├─ DiseaseDetectorScreen
                                     │
                                     └─ ProfileScreen
```

---

## 🔐 Rutas de Autenticación

### 1️⃣ Welcome Screen (Landing)
**Ruta:** `Welcome` (antes de login)  
**Componente:** `screens/Auth/WelcomeScreen.tsx`

#### Propósito
Pantalla inicial que aparece cuando no hay usuario logueado. Permite navegar a login o registro.

#### Acciones
- ✅ Navegar a LoginScreen
- ✅ Navegar a RegisterScreen
- ✅ Mostrar logo y descripción de la app

#### Interfaz Esperada
```
┌──────────────────────────┐
│   Logo AgroMind          │
│                          │
│   "Asesora Inteligente   │
│    Agrónoma para tu      │
│    Cultivo"              │
│                          │
│  ┌────────────────────┐  │
│  │  Iniciar Sesión    │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  Crear Cuenta      │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

#### Integración Frontend
```typescript
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgroMind IA</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
      >
        <Text>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
      >
        <Text>Crear Cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

### 2️⃣ Login Screen
**Ruta Backend:** `POST /auth/login`  
**Componente:** `screens/Auth/LoginScreen.tsx`

#### Descripción
Pantalla para autenticación de usuarios. Recibe email y contraseña, obtiene tokens JWT.

#### Request
```typescript
interface LoginRequest {
  email: string;        // Email registrado
  password: string;     // Contraseña
}
```

#### Response
```typescript
interface LoginResponse {
  access_token: string;    // Token JWT (24h validez)
  refresh_token: string;   // Token para renovar (7d validez)
  token_type: string;      // "bearer"
  expires_in: number;      // Segundos hasta expiración (86400 = 24h)
  user: {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_admin: boolean;
  }
}
```

#### Interfaz Esperada
```
┌──────────────────────────┐
│   Iniciar Sesión         │
│                          │
│  Email                   │
│  ┌────────────────────┐  │
│  │ usuario@email.com  │  │
│  └────────────────────┘  │
│                          │
│  Contraseña              │
│  ┌────────────────────┐  │
│  │ ••••••••••••       │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  Iniciar Sesión    │  │
│  └────────────────────┘  │
│                          │
│  ¿No tienes cuenta?      │
│  Regístrate aquí         │
│                          │
└──────────────────────────┘
```

#### Lógica de Integración
```typescript
import apiClient, { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      // Llamar al servicio de autenticación
      const response = await authService.login(email, password);
      
      // Los tokens ya se guardaron en authService.login()
      // Navegar al dashboard
      navigation.navigate('App', { screen: 'Dashboard' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={loading ? 'Iniciando...' : 'Iniciar Sesión'}
        onPress={handleLogin}
        disabled={loading}
      />
    </ScrollView>
  );
};
```

#### Errores Posibles
| Código | Error | Solución |
|--------|-------|----------|
| 401 | Email o contraseña incorrectos | Verificar credenciales |
| 400 | Usuario no existe | Crear cuenta primero |
| 422 | Datos incompletos | Llenar todos los campos |

---

### 3️⃣ Register Screen
**Ruta Backend:** `POST /auth/register`  
**Componente:** `screens/Auth/RegisterScreen.tsx`

#### Descripción
Pantalla para crear nueva cuenta. Recibe email, username y contraseña.

#### Request
```typescript
interface RegisterRequest {
  email: string;            // Email único
  username: string;         // Nombre de usuario único
  password: string;         // Min 8 caracteres
}
```

#### Response
```typescript
interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
  }
}
```

#### Interfaz Esperada
```
┌──────────────────────────┐
│   Crear Cuenta           │
│                          │
│  Email                   │
│  ┌────────────────────┐  │
│  │ nuevo@email.com    │  │
│  └────────────────────┘  │
│                          │
│  Nombre de Usuario       │
│  ┌────────────────────┐  │
│  │ juanperez          │  │
│  └────────────────────┘  │
│                          │
│  Contraseña              │
│  ┌────────────────────┐  │
│  │ ••••••••••••       │  │
│  └────────────────────┘  │
│                          │
│  Confirmar Contraseña    │
│  ┌────────────────────┐  │
│  │ ••••••••••••       │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  Crear Cuenta      │  │
│  └────────────────────┘  │
│                          │
│  ¿Ya tienes cuenta?      │
│  Inicia sesión aquí      │
│                          │
└──────────────────────────┘
```

#### Integración Frontend
```typescript
const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !username || !password) {
      setError('Completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, username, password);
      Alert.alert('Éxito', 'Cuenta creada. Inicia sesión');
      navigation.navigate('Login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Form fields */}
      <Button
        title={loading ? 'Registrando...' : 'Crear Cuenta'}
        onPress={handleRegister}
        disabled={loading}
      />
    </ScrollView>
  );
};
```

---

## 🌾 Rutas de Cultivos

### 4️⃣ Crops List Screen
**Ruta Backend:** `GET /crops`  
**Componente:** `screens/Crops/CropsListScreen.tsx`

#### Descripción
Lista todos los cultivos del usuario autenticado. Muestra tarjetas con información básica de cada cultivo.

#### Request
```typescript
interface GetCropsQuery {
  limit?: number;   // Default: 10
  offset?: number;  // Default: 0 (para paginación)
}
```

#### Response
```typescript
interface Crop {
  id: number;
  user_id: number;
  name: string;              // "Papa", "Tomate", etc.
  crop_type: string;         // Tipo de cultivo
  location_lat: number;      // Latitud
  location_long: number;     // Longitud
  area: number;              // Área en m²
  status: string;            // "active", "harvested", "failed"
  created_at: string;        // Fecha creación
  updated_at: string;        // Última actualización
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Mis Cultivos                        │
│  ┌─────────────────────────────────┐ │
│  │ + Crear Nuevo Cultivo           │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 🌾 Papa                          │ │
│  │ Tipo: Papa                       │ │
│  │ Área: 50 m²                     │ │
│  │ Estado: Activo                   │ │
│  │ ┌─────────────────────────────┐ │ │
│  │ │ Ver │ Editar │ Eliminar     │ │ │
│  │ └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 🍅 Tomate                        │ │
│  │ Tipo: Tomate                    │ │
│  │ Área: 30 m²                     │ │
│  │ Estado: Activo                   │ │
│  │ ┌─────────────────────────────┐ │ │
│  │ │ Ver │ Editar │ Eliminar     │ │ │
│  │ └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

#### Integración Frontend
```typescript
import { cropsService } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const CropsListScreen = ({ navigation }) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar cultivos cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      loadCrops();
    }, [])
  );

  const loadCrops = async () => {
    try {
      setLoading(true);
      const response = await cropsService.getCrops();
      setCrops(response.data);
    } catch (error) {
      console.error('Error cargando cultivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCrops();
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Eliminar', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cropsService.deleteCrop(id);
            setCrops(crops.filter(c => c.id !== id));
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el cultivo');
          }
        }
      }
    ]);
  };

  return (
    <FlatList
      data={crops}
      renderItem={({ item }) => (
        <CropCard
          crop={item}
          onView={() => navigation.navigate('CropDetail', { id: item.id })}
          onEdit={() => navigation.navigate('EditCrop', { id: item.id })}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      keyExtractor={item => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {loading ? 'Cargando...' : 'No hay cultivos. ¡Crea uno!'}
        </Text>
      }
      ListHeaderComponent={
        <Button
          title="+ Crear Nuevo Cultivo"
          onPress={() => navigation.navigate('CreateCrop')}
        />
      }
    />
  );
};
```

---

### 5️⃣ Create Crop Screen
**Ruta Backend:** `POST /crops`  
**Componente:** `screens/Crops/CreateCropScreen.tsx`

#### Descripción
Formulario para crear un nuevo cultivo. Permite ingresar datos básicos y obtener ubicación con GPS.

#### Request
```typescript
interface CreateCropRequest {
  name: string;                // "Papa", "Tomate", etc.
  crop_type: string;           // Tipo de cultivo
  location_lat?: number;       // Latitud (opcional)
  location_long?: number;      // Longitud (opcional)
  area?: number;               // Área en m² (opcional)
}
```

#### Response
```typescript
interface CreateCropResponse {
  id: number;
  user_id: number;
  name: string;
  crop_type: string;
  location_lat: number | null;
  location_long: number | null;
  area: number | null;
  status: string;
  created_at: string;
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Crear Nuevo Cultivo                 │
│                                      │
│  Nombre del Cultivo                  │
│  ┌─────────────────────────────────┐ │
│  │ Papa                             │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Tipo de Cultivo                     │
│  ┌─────────────────────────────────┐ │
│  │ ▼ Papa                           │ │
│  │   - Papa                         │ │
│  │   - Tomate                       │ │
│  │   - Lechuga                      │ │
│  │   - Maíz                         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Área (m²)                           │
│  ┌─────────────────────────────────┐ │
│  │ 50                               │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Ubicación                           │
│  Latitud: 12.3456°  Longitud: -76.54│
│  ┌─────────────────────────────────┐ │
│  │ 📍 Obtener Mi Ubicación          │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Crear Cultivo                   │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

#### Integración Frontend
```typescript
import * as Location from 'expo-location';
import { cropsService } from '../../services/api';

const CROP_TYPES = [
  'papa', 'tomate', 'lechuga', 'maiz', 'arroz', 'frijol', 'zanahoria'
];

const CreateCropScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('papa');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        Alert.alert('Ubicación obtenida');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleCreate = async () => {
    if (!name || !cropType) {
      Alert.alert('Error', 'Nombre y tipo son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const cropData: any = {
        name,
        crop_type: cropType,
      };
      
      if (area) cropData.area = parseFloat(area);
      if (latitude) cropData.location_lat = latitude;
      if (longitude) cropData.location_long = longitude;

      await cropsService.createCrop(cropData);
      Alert.alert('Éxito', 'Cultivo creado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Nombre del cultivo"
        value={name}
        onChangeText={setName}
      />
      
      <Picker selectedValue={cropType} onValueChange={setCropType}>
        {CROP_TYPES.map(type => (
          <Picker.Item key={type} label={type} value={type} />
        ))}
      </Picker>

      <TextInput
        placeholder="Área (m²)"
        value={area}
        onChangeText={setArea}
        keyboardType="decimal-pad"
      />

      <Button title="📍 Obtener Ubicación" onPress={getLocation} />

      {latitude && (
        <Text>Lat: {latitude.toFixed(4)} / Long: {longitude?.toFixed(4)}</Text>
      )}

      <Button
        title={loading ? 'Creando...' : 'Crear Cultivo'}
        onPress={handleCreate}
        disabled={loading}
      />
    </ScrollView>
  );
};
```

---

### 6️⃣ Crop Detail Screen
**Ruta Backend:** `GET /crops/{crop_id}`  
**Componente:** `screens/Crops/CropDetailScreen.tsx`

#### Descripción
Visualiza detalles completos de un cultivo específico. Muestra información general, historial y acciones rápidas.

#### Request
```typescript
// URL: /crops/{crop_id}
// Parámetro: crop_id (número)
```

#### Response
```typescript
interface CropDetail extends Crop {
  // Todos los campos de Crop
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Detalles del Cultivo                │
│                                      │
│  🌾 Papa - 50 m²                     │
│  Estado: Activo                      │
│                                      │
│  Información General                 │
│  ├─ Tipo: Papa                       │
│  ├─ Ubicación: -12.34° / 76.54°      │
│  ├─ Área: 50 m²                      │
│  ├─ Creado: 2025-12-15               │
│  └─ Actualizado: 2025-12-17          │
│                                      │
│  Acciones Rápidas                    │
│  ┌──────────────────────────────────┐ │
│  │ 📊 Ver Predicciones              │ │
│  └──────────────────────────────────┘ │
│                                      │
│  ┌──────────────────────────────────┐ │
│  │ 💧 Generar Receta Hidropónica    │ │
│  └──────────────────────────────────┘ │
│                                      │
│  ┌──────────────────────────────────┐ │
│  │ 🏥 Detectar Enfermedad           │ │
│  └──────────────────────────────────┘ │
│                                      │
│  Historial Reciente                  │
│  • Predicción NPK - hace 2 días      │
│  • Receta hidro - hace 5 días        │
│                                      │
└──────────────────────────────────────┘
```

---

### 7️⃣ Edit Crop Screen
**Ruta Backend:** `PUT /crops/{crop_id}`  
**Componente:** `screens/Crops/EditCropScreen.tsx`

#### Descripción
Actualiza información de un cultivo existente.

#### Request
```typescript
interface UpdateCropRequest {
  name?: string;
  crop_type?: string;
  location_lat?: number;
  location_long?: number;
  area?: number;
  status?: string;  // "active", "harvested", "failed"
}
```

#### Response
```typescript
// Retorna el cultivo actualizado
```

---

## 📊 Rutas de IA/Predicciones

### 8️⃣ Fertilizer Predictor Screen
**Ruta Backend:** `POST /predict`  
**Componente:** `screens/AI/FertilizerPredictorScreen.tsx`

#### Descripción
Predice la cantidad de nutrientes (NPK) necesarios para un cultivo basado en pH del suelo y datos climáticos.

#### Request
```typescript
interface PredictFertilizerRequest {
  crop_id?: number;    // Si se proporciona, obtiene cultivo del DB
  crop_name?: string;  // Si no hay crop_id
  ph: number;          // pH del suelo (0-14)
  latitude?: number;   // Para obtener clima
  longitude?: number;  // Para obtener clima
}

// Query params:
// GET /predict?crop_id=1
// Body: { ph: 6.5 }
```

#### Response
```typescript
interface PredictResponse {
  success: boolean;
  nutrientes_requeridos: {
    N: number;   // Nitrógeno (kg/ha)
    P: number;   // Fósforo (kg/ha)
    K: number;   // Potasio (kg/ha)
  };
  datos_clima: {
    temperature: number;    // °C
    humidity: number;       // %
    rainfall: number;       // mm
    wind_speed: number;     // km/h
  };
  recomendacion: string;    // Texto con recomendación detallada
  prediction_id: number;    // ID de la predicción guardada
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Predicción de Fertilizante          │
│                                      │
│  Seleccionar Cultivo                 │
│  ┌─────────────────────────────────┐ │
│  │ ▼ Papa                           │ │
│  │   - Papa                         │ │
│  │   - Tomate                       │ │
│  │   - Lechuga                      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  pH del Suelo (0-14)                 │
│  ┌─────────────────────────────────┐ │
│  │ 6.5                              │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Generar Predicción              │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ═════════════════════════════════   │
│  RESULTADO DE LA PREDICCIÓN          │
│  ═════════════════════════════════   │
│                                      │
│  Nutrientes Requeridos               │
│  Nitrógeno (N): 120.5 kg/ha          │
│  Fósforo (P):   45.2 kg/ha           │
│  Potasio (K):   95.8 kg/ha           │
│                                      │
│  Datos Climáticos                    │
│  Temperatura: 28°C                   │
│  Humedad: 65%                        │
│  Lluvia: 120mm                       │
│  Viento: 12 km/h                     │
│                                      │
│  Recomendación                       │
│  "Para papa con pH 6.5, se recomienda│
│   aplicar fertilizante NPK 12-45-95. │
│   La temperatura actual (28°C) es     │
│   ideal para el crecimiento..."       │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Guardar Predicción              │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

#### Integración Frontend
```typescript
import { predictionsService, cropsService } from '../../services/api';

const FertilizerPredictorScreen = () => {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [ph, setPh] = useState('6.5');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const response = await cropsService.getCrops();
      setCrops(response.data);
    } catch (error) {
      console.error('Error cargando cultivos:', error);
    }
  };

  const handlePredict = async () => {
    if (!selectedCropId || !ph) {
      Alert.alert('Error', 'Selecciona cultivo e ingresa pH');
      return;
    }

    const phValue = parseFloat(ph);
    if (phValue < 0 || phValue > 14) {
      Alert.alert('Error', 'pH debe estar entre 0 y 14');
      return;
    }

    setLoading(true);
    try {
      const response = await predictionsService.predictFertilizer(
        selectedCropId,
        phValue
      );
      setResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error en predicción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Picker selectedValue={selectedCropId} onValueChange={setSelectedCropId}>
        <Picker.Item label="Selecciona un cultivo" value={null} />
        {crops.map(crop => (
          <Picker.Item
            key={crop.id}
            label={crop.name}
            value={crop.id}
          />
        ))}
      </Picker>

      <TextInput
        placeholder="pH (0-14)"
        value={ph}
        onChangeText={setPh}
        keyboardType="decimal-pad"
      />

      <Button
        title={loading ? 'Generando...' : 'Generar Predicción'}
        onPress={handlePredict}
        disabled={loading}
      />

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <Text>N: {result.nutrientes_requeridos.N.toFixed(2)} kg/ha</Text>
          <Text>P: {result.nutrientes_requeridos.P.toFixed(2)} kg/ha</Text>
          <Text>K: {result.nutrientes_requeridos.K.toFixed(2)} kg/ha</Text>
          
          <Text style={styles.subtitle}>Clima</Text>
          <Text>Temperatura: {result.datos_clima.temperature}°C</Text>
          <Text>Humedad: {result.datos_clima.humidity}%</Text>
          
          <Text style={styles.subtitle}>Recomendación</Text>
          <Text>{result.recomendacion}</Text>
        </View>
      )}
    </ScrollView>
  );
};
```

---

### 9️⃣ Hydro Recipe Screen
**Ruta Backend:** `POST /generate-recipe`  
**Componente:** `screens/AI/HydroRecipeScreen.tsx`

#### Descripción
Genera recetas de nutrientes para sistemas hidropónicos basados en el cultivo y condiciones ambientales.

#### Request
```typescript
interface GenerateRecipeRequest {
  crop_id?: number;           // Si se proporciona, obtiene cultivo del DB
  crop_name?: string;         // Si no hay crop_id
  water_volume: number;       // Litros
  temperature: number;        // °C
  ph_level: number;          // 0-14
  latitude?: number;         // Para obtener clima
  longitude?: number;        // Para obtener clima
}
```

#### Response
```typescript
interface RecipeResponse {
  success: boolean;
  cultivo: string;
  nutrientes: {
    macronutrientes: {
      N: number;
      P: number;
      K: number;
      Ca: number;
      Mg: number;
      S: number;
    };
    micronutrientes: {
      Fe: number;
      B: number;
      Mn: number;
      Zn: number;
      Cu: number;
      Mo: number;
    };
  };
  proporciones: string;         // Descripción de proporciones
  frecuencia_cambio: string;   // "cada 14 días", "cada 3 semanas"
  ph_recomendado: {
    min: number;
    max: number;
  };
  temperature_recomendada: {
    min: number;
    max: number;
  };
  recipe_id: number;
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Generar Receta Hidropónica          │
│                                      │
│  Cultivo                             │
│  ┌─────────────────────────────────┐ │
│  │ ▼ Papa                           │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Volumen de Agua (L)                 │
│  ┌─────────────────────────────────┐ │
│  │ 100                              │ │
│  └─────────────────────────────────┘ │
│                                      │
│  Temperatura (°C)                    │
│  ┌─────────────────────────────────┐ │
│  │ 22                               │ │
│  └─────────────────────────────────┘ │
│                                      │
│  pH del Agua                         │
│  ┌─────────────────────────────────┐ │
│  │ 6.0                              │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Generar Receta                  │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ═════════════════════════════════   │
│  RECETA GENERADA                     │
│  ═════════════════════════════════   │
│                                      │
│  MACRONUTRIENTES                     │
│  Nitrógeno (N): 420 mg/L             │
│  Fósforo (P): 180 mg/L               │
│  Potasio (K): 340 mg/L               │
│  Calcio (Ca): 200 mg/L               │
│  Magnesio (Mg): 80 mg/L              │
│  Azufre (S): 64 mg/L                 │
│                                      │
│  MICRONUTRIENTES                     │
│  Hierro (Fe): 3.0 mg/L               │
│  Boro (B): 0.5 mg/L                  │
│  Manganeso (Mn): 0.8 mg/L            │
│  ...                                 │
│                                      │
│  RECOMENDACIONES                     │
│  pH: 5.5 - 6.5                       │
│  Temperatura: 18°C - 25°C            │
│  Cambiar solución: cada 14 días      │
│                                      │
│  Instrucciones:                      │
│  "Mezclar nutrientes en el orden..."  │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Guardar Receta                  │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

### 🔟 Disease Detector Screen
**Ruta Backend:** `POST /predict-image`  
**Componente:** `screens/AI/DiseaseDetectorScreen.tsx`

#### Descripción
Detecta enfermedades en plantas mediante análisis de imágenes. Permite capturar foto o seleccionar de galería.

#### Request
```typescript
// Multipart Form Data
{
  file: File;  // Imagen JPEG/PNG
}

// Headers:
{
  'Content-Type': 'multipart/form-data',
  'Authorization': 'Bearer token'
}
```

#### Response
```typescript
interface DiseaseDetectionResponse {
  success: boolean;
  enfermedad: string;              // "Tizon tardío", "Bacteria", "Sano"
  confianza: number;               // 0-1 (confidence score)
  recomendaciones: string;         // Pasos para tratar
  acciones_recomendadas: string[]; // ["Aplicar fungicida X", ...]
  prediction_id: number;
}
```

#### Interfaz Esperada
```
┌──────────────────────────────────────┐
│  Detectar Enfermedad en Planta       │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │   Seleccionar Imagen              │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │ 📸 Tomar Foto                │ │ │
│  │  └──────────────────────────────┘ │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │ 🖼️  Galería                   │ │ │
│  │  └──────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ╔═════════════════════════════════╗ │
│  ║ Imagen Seleccionada              ║ │
│  ║                                  ║ │
│  ║   [Imagen de hoja con mancha]    ║ │
│  ║                                  ║ │
│  ╚═════════════════════════════════╝ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Analizar                         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ═════════════════════════════════   │
│  RESULTADO DEL ANÁLISIS              │
│  ═════════════════════════════════   │
│                                      │
│  Enfermedad: Tizón Tardío (Phytoph.) │
│  Confianza: 94% █████████░           │
│                                      │
│  DESCRIPCIÓN                         │
│  El Tizón Tardío es una enfermedad   │
│  fúngica que afecta principalmente   │
│  a plantas de papa y tomate...       │
│                                      │
│  RECOMENDACIONES                     │
│  • Aislar la planta infectada        │
│  • Aplicar fungicida sistémico       │
│  • Aumentar ventilación              │
│  • Reducir humedad                   │
│  • Riega en las mañanas              │
│                                      │
│  ACCIONES RECOMENDADAS               │
│  ✓ Sulfato de cobre                  │
│  ✓ Mancozeb                          │
│  ✓ Propamocarb                       │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Guardar Análisis                │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

#### Integración Frontend
```typescript
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { predictionsService } from '../../services/api';

const DiseaseDetectorScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.cancelled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Selecciona una imagen');
      return;
    }

    setLoading(true);
    try {
      const response = await predictionsService.detectDisease(image);
      setResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error en análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No hay imagen seleccionada</Text>
        </View>
      )}

      <Button title="📸 Tomar Foto" onPress={takePicture} />
      <Button title="🖼️ Seleccionar de Galería" onPress={pickImage} />

      {image && (
        <Button
          title={loading ? 'Analizando...' : 'Analizar Imagen'}
          onPress={analyzeImage}
          disabled={loading}
        />
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.title}>{result.enfermedad}</Text>
          <ProgressBar
            value={result.confianza}
            style={{ height: 10, marginVertical: 10 }}
          />
          <Text style={styles.confidence}>
            Confianza: {(result.confianza * 100).toFixed(1)}%
          </Text>

          <Text style={styles.subtitle}>Recomendaciones</Text>
          <Text>{result.recomendaciones}</Text>

          <Text style={styles.subtitle}>Acciones Recomendadas</Text>
          {result.acciones_recomendadas.map((action, i) => (
            <Text key={i}>• {action}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};
```

---

## 📁 Estructura de Carpetas Recomendada

```
front-end/
├── app/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Crops/
│   │   │   ├── CropsListScreen.tsx
│   │   │   ├── CreateCropScreen.tsx
│   │   │   ├── CropDetailScreen.tsx
│   │   │   └── EditCropScreen.tsx
│   │   ├── AI/
│   │   │   ├── FertilizerPredictorScreen.tsx
│   │   │   ├── HydroRecipeScreen.tsx
│   │   │   ├── DiseaseDetectorScreen.tsx
│   │   │   └── PredictionHistoryScreen.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   └── Profile/
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── CropCard.tsx
│   │   ├── PredictionCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Navigation/
│   │       ├── DrawerContent.tsx
│   │       └── RootNavigator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CropsContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCrops.ts
│   │   └── usePredictions.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── AppStack.tsx
│   │   └── types.ts
│   ├── styles/
│   │   ├── theme.ts
│   │   └── colors.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── navigation.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── formatting.ts
│   └── App.tsx
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔄 Flujos de Datos Principales

### Flujo 1: Autenticación
```
WelcomeScreen
    ↓
LoginScreen → [POST /auth/login] → API
    ↓                              ↓
    ←─────← [access_token + refresh_token + user]
    ↓
[Guardar en AsyncStorage]
    ↓
AuthContext actualiza
    ↓
RootNavigator navega a AppStack
    ↓
DashboardScreen
```

### Flujo 2: Crear Cultivo
```
CropsListScreen
    ↓ (Presiona "+ Crear")
CreateCropScreen
    ↓ (Llenar formulario)
    ├─ nombre: "Papa"
    ├─ tipo: "papa"
    ├─ área: 50
    └─ ubicación: [obtener GPS]
    ↓
[POST /crops] → API
    ↓
Guardar respuesta
    ↓
AuthContext actualiza lista
    ↓
Navegar de vuelta a CropsListScreen
    ↓
CropsListScreen se recarga con nuevo cultivo
```

### Flujo 3: Predicción de Fertilizante
```
CropDetailScreen
    ↓ (Presiona "Ver Predicciones")
FertilizerPredictorScreen
    ↓ (Seleccionar cultivo + ingresar pH)
    ├─ crop_id: 1
    └─ ph: 6.5
    ↓
[POST /predict?crop_id=1] → API
    ├─ Obtiene datos del cultivo
    ├─ Obtiene clima por ubicación
    └─ Calcula nutrientes
    ↓
Retorna:
    ├─ nutrientes_requeridos (N, P, K)
    ├─ datos_clima (temp, humedad)
    └─ recomendacion (texto)
    ↓
Mostrar resultados en pantalla
    ↓
Usuario presiona "Guardar"
    ↓
Predicción se guarda en base de datos
```

---

## 💻 Ejemplos de Integración Completos

### Ejemplo 1: Hook de Autenticación

```typescript
// hooks/useAuth.ts
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService, apiHelpers } from '../services/api';

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      dispatch({
        type: 'SIGN_IN',
        payload: response,
      });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error',
      };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'SIGN_OUT' });
  }, [dispatch]);

  const isAuthenticated = useCallback(async () => {
    return await apiHelpers.isAuthenticated();
  }, []);

  return {
    ...state,
    login,
    logout,
    isAuthenticated,
  };
};
```

### Ejemplo 2: Hook de Cultivos

```typescript
// hooks/useCrops.ts
import { useState, useEffect, useCallback } from 'react';
import { cropsService } from '../services/api';
import { Crop } from '../types/models';

export const useCrops = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cropsService.getCrops();
      setCrops(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCrop = useCallback(
    async (cropData: any) => {
      try {
        const response = await cropsService.createCrop(cropData);
        setCrops([...crops, response.data]);
        return { success: true, crop: response.data };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.detail,
        };
      }
    },
    [crops]
  );

  const deleteCrop = useCallback(
    async (id: number) => {
      try {
        await cropsService.deleteCrop(id);
        setCrops(crops.filter(c => c.id !== id));
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.detail,
        };
      }
    },
    [crops]
  );

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return {
    crops,
    loading,
    error,
    fetchCrops,
    createCrop,
    deleteCrop,
  };
};
```

---

## 🧪 Checklist de Implementación

### Fase 1: Autenticación
- [ ] WelcomeScreen
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] AuthContext
- [ ] useAuth hook
- [ ] Guardado de tokens en AsyncStorage
- [ ] Refresh token automático

### Fase 2: Cultivos
- [ ] CropsListScreen
- [ ] CreateCropScreen
- [ ] CropDetailScreen
- [ ] EditCropScreen
- [ ] useCrops hook
- [ ] Integración con GPS (expo-location)
- [ ] CRUD completo

### Fase 3: IA/Predicciones
- [ ] FertilizerPredictorScreen
- [ ] HydroRecipeScreen
- [ ] DiseaseDetectorScreen
- [ ] Integración con cámara (expo-camera)
- [ ] Integración con galería (expo-image-picker)
- [ ] usePredictions hook

### Fase 4: Refinamiento
- [ ] Navegación completa
- [ ] Manejo de errores mejorado
- [ ] Loading states
- [ ] Refresh controls
- [ ] Validaciones de formularios
- [ ] Tests

---

**Documento Generado:** 17 de diciembre de 2025  
**Versión:** 1.0  
**Estado:** Completo y Listo para Implementación
