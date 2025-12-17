# 📱 Guía Completa - Desarrollo Frontend React Native con Expo

## 🚀 Inicio Rápido

### 1. Crear proyecto
```bash
npx create-expo-app AgroMindMobile
cd AgroMindMobile
npm install
```

### 2. Instalar dependencias necesarias
```bash
npm install @react-navigation/native @react-navigation/drawer @react-navigation/stack 
npm install react-native-gesture-handler react-native-reanimated react-native-screens 
npm install react-native-safe-area-context @react-native-community/masked-view
npm install axios @react-native-async-storage/async-storage
npm install expo-location expo-camera expo-image-picker
npm install react-native-paper react-native-vector-icons
npm install zustand
```

### 3. Crear estructura base
```bash
mkdir -p app/screens/{Auth,Dashboard,Crops,AI,Profile}
mkdir -p app/{components,services,context,hooks,navigation,types,utils,styles}
```

### 4. Iniciar desarrollo
```bash
npm start
# Presiona 'i' para iOS, 'a' para Android, 'w' para web
```

---

## 🔌 Archivo API Service (api.ts)

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor de request - agregar token a todas las peticiones
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

// Interceptor de response - manejar 401 con refresh
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
          return apiClient(error.config);
        } catch {
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Contexto de Autenticación (AuthContext.tsx)

```typescript
import React, { createContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
  });

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      dispatch({ type: 'SIGN_IN', payload: data });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al iniciar sesión' 
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, username: string, password: string) => {
    try {
      await apiClient.post('/auth/register', { email, username, password });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al registrar' 
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

function authReducer(prevState: any, action: any) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...prevState, userToken: action.payload, isLoading: false };
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.access_token,
        user: action.payload.user,
      };
    case 'SIGN_OUT':
      return { ...prevState, isSignout: true, userToken: null, user: null };
    default:
      return prevState;
  }
}
```

---

## 🗺️ Navegación Principal (RootNavigator.tsx)

```typescript
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import CropsListScreen from '../screens/Crops/CropsListScreen';
import CreateCropScreen from '../screens/Crops/CreateCropScreen';
import DrawerContent from '../components/Navigation/DrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DashboardHome" 
      component={DashboardScreen}
      options={{ headerTitle: 'Dashboard' }}
    />
  </Stack.Navigator>
);

const CropsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CropsList" 
      component={CropsListScreen}
      options={{ headerTitle: 'Mis Cultivos' }}
    />
    <Stack.Screen 
      name="CreateCrop" 
      component={CreateCropScreen}
      options={{ headerTitle: 'Crear Cultivo' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <DrawerContent {...props} />}
    screenOptions={{ headerShown: true }}
  >
    <Drawer.Screen 
      name="Dashboard" 
      component={DashboardStack}
      options={{ headerTitle: 'AgroMind IA' }}
    />
    <Drawer.Screen 
      name="Crops" 
      component={CropsStack}
      options={{ headerTitle: 'Cultivos' }}
    />
  </Drawer.Navigator>
);

export const RootNavigator = () => {
  const { state } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {state.userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

---

## 🎨 Pantalla de Login (LoginScreen.tsx)

```typescript
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AgroMind IA</Text>
        <Text style={styles.subtitle}>Gestión Inteligente de Cultivos</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, justifyContent: 'center', marginTop: 100 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { backgroundColor: '#ccc' },
  link: { color: '#4CAF50', textAlign: 'center', fontSize: 14, marginTop: 15 },
});

export default LoginScreen;
```

---

## 🏠 Pantalla de Dashboard (DashboardScreen.tsx)

```typescript
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api';

const DashboardScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ user: null, crops: [] });
  const { state } = useContext(AuthContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, cropsRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/crops?limit=5'),
      ]);
      setData({ user: userRes.data, crops: cropsRes.data });
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Bienvenido, {data.user?.username}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard label="Cultivos Activos" value={data.crops.length} icon="🌾" />
        <StatCard label="Últimas Predicciones" value="5" icon="📊" />
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('Crops', { screen: 'CropsList' })}
      >
        <Text style={styles.actionButtonText}>Ver Mis Cultivos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  welcomeCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  welcomeText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statIcon: { fontSize: 32, marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default DashboardScreen;
```

---

## 🌾 Listado de Cultivos (CropsListScreen.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import apiClient from '../../services/api';

const CropsListScreen = ({ navigation }: any) => {
  const [crops, setCrops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const res = await apiClient.get('/crops');
      setCrops(res.data);
    } catch (error) {
      console.error('Error cargando cultivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCrops().finally(() => setRefreshing(false));
  };

  const deleteCrop = async (id: number) => {
    try {
      await apiClient.delete(`/crops/${id}`);
      setCrops(crops.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando cultivo:', error);
    }
  };

  const renderCrop = ({ item }: any) => (
    <View style={styles.cropCard}>
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{item.name}</Text>
        <Text style={styles.cropType}>{item.crop_type}</Text>
        <Text style={styles.cropStatus}>{item.status}</Text>
      </View>
      <View style={styles.cropActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CropDetails', { id: item.id })}
        >
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteCrop(item.id)}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateCrop')}
      >
        <Text style={styles.createButtonText}>+ Crear Cultivo</Text>
      </TouchableOpacity>

      <FlatList
        data={crops}
        renderItem={renderCrop}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Cargando...' : 'No hay cultivos'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  createButton: {
    backgroundColor: '#4CAF50',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cropCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropInfo: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  cropType: { fontSize: 14, color: '#666', marginVertical: 5 },
  cropStatus: { fontSize: 12, color: '#999' },
  cropActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  deleteButton: { backgroundColor: '#f44336' },
  actionButtonText: { color: '#fff', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 },
});

export default CropsListScreen;
```

---

## 💾 Crear Cultivo (CreateCropScreen.tsx)

```typescript
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Picker,
} from 'react-native';
import * as Location from 'expo-location';
import apiClient from '../../services/api';

const CROP_TYPES = [
  'tomate', 'lechuga', 'papa', 'papaya', 'mango', 'arroz', 'maiz'
];

const CreateCropScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('tomate');
  const [area, setArea] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLat(location.coords.latitude.toString());
        setLong(location.coords.longitude.toString());
        Alert.alert('Ubicación obtenida', 'Ubicación establecida correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleCreate = async () => {
    if (!name || !cropType) {
      Alert.alert('Error', 'Nombre y tipo de cultivo son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, crop_type: cropType };
      if (area) payload.area = parseFloat(area);
      if (lat) payload.location_lat = parseFloat(lat);
      if (long) payload.location_long = parseFloat(long);

      const res = await apiClient.post('/crops', payload);
      Alert.alert('Éxito', 'Cultivo creado correctamente');
      navigation.navigate('CropsList');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al crear cultivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del cultivo"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cropType}
          onValueChange={setCropType}
          enabled={!loading}
        >
          {CROP_TYPES.map(type => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Área (m²)"
        value={area}
        onChangeText={setArea}
        keyboardType="decimal-pad"
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={getLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Obtener Ubicación</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Latitud"
        value={lat}
        onChangeText={setLat}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Longitud"
        value={long}
        onChangeText={setLong}
        editable={false}
      />

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creando...' : 'Crear Cultivo'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  createButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CreateCropScreen;
```

---

## 🎯 Predictor de Fertilizante (FertilizerPredictorScreen.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Picker,
  StyleSheet,
  Alert,
} from 'react-native';
import apiClient from '../../services/api';

const FertilizerPredictorScreen = ({ route }: any) => {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [ph, setPh] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const res = await apiClient.get('/crops');
      setCrops(res.data);
      if (route?.params?.cropId) {
        setSelectedCropId(route.params.cropId);
      }
    } catch (error) {
      console.error('Error cargando cultivos:', error);
    }
  };

  const handlePredict = async () => {
    if (!selectedCropId || !ph) {
      Alert.alert('Error', 'Selecciona un cultivo e ingresa el pH');
      return;
    }

    setLoading(true);
    try {
      const phValue = parseFloat(ph);
      if (phValue < 0 || phValue > 14) {
        Alert.alert('Error', 'El pH debe estar entre 0 y 14');
        return;
      }

      const res = await apiClient.post(`/predict?crop_id=${selectedCropId}`, {
        ph: phValue,
      });
      setResult(res.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error en la predicción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCropId}
          onValueChange={setSelectedCropId}
          enabled={!loading}
        >
          <Picker.Item label="Selecciona un cultivo" value={null} />
          {crops.map(crop => (
            <Picker.Item key={crop.id} label={crop.name} value={crop.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="pH del Suelo (0-14)"
        value={ph}
        onChangeText={setPh}
        keyboardType="decimal-pad"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePredict}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Procesando...' : 'Generar Recomendación'}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <Text style={styles.resultText}>
            Nitrógeno (N): {result.nutrientes_requeridos.N.toFixed(2)}
          </Text>
          <Text style={styles.resultText}>
            Fósforo (P): {result.nutrientes_requeridos.P.toFixed(2)}
          </Text>
          <Text style={styles.resultText}>
            Potasio (K): {result.nutrientes_requeridos.K.toFixed(2)}
          </Text>
          <Text style={styles.resultText}>
            Temperatura: {result.datos_clima.temperature}°C
          </Text>
          <Text style={styles.resultText}>
            Humedad: {result.datos_clima.humidity}%
          </Text>
          <Text style={styles.recommendation}>{result.recomendacion}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  resultText: { fontSize: 14, color: '#333', marginVertical: 5 },
  recommendation: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default FertilizerPredictorScreen;
```

---

## 📱 App.tsx (Archivo Principal)

```typescript
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/context/AuthContext';
import { RootNavigator } from './app/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

---

## 📊 Información Útil

- **API Base URL**: `http://localhost:8000`
- **Emulador Android**: usar `http://10.0.2.2:8000`
- **Simulador iOS**: usar `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`

---

## ✅ Checklist de Desarrollo

- [ ] Proyecto Expo creado
- [ ] Dependencias instaladas
- [ ] AuthContext implementado
- [ ] RootNavigator configurado
- [ ] LoginScreen funcional
- [ ] RegisterScreen funcional
- [ ] DashboardScreen con datos
- [ ] CropsListScreen con CRUD
- [ ] CreateCropScreen con geolocalización
- [ ] FertilizerPredictorScreen
- [ ] RecipeGeneratorScreen
- [ ] DiseaseDetectorScreen (con cámara)
- [ ] ProfileScreen
- [ ] Manejo de errores
- [ ] Testing en Android
- [ ] Testing en iOS
- [ ] Build para producción

---

*Guía React Native - AgroMind IA*  
*Última actualización: 17 de diciembre de 2025*
