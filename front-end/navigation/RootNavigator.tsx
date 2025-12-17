import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { addLogoutListener } from '../services/api';

// Pantallas
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CropSelectionScreen from '../screens/CropSelectionScreen';
import CropListScreen from '../screens/Crops/CropListScreen';
import CropDetailScreen from '../screens/Crops/CropDetailScreen';
import CropFormScreen from '../screens/Crops/CropFormScreen';
import DataInputScreen from '../screens/DataInputScreen';
import ResultScreen from '../screens/ResultScreen';
import ImagePredictScreen from '../screens/AI/ImagePredictScreen';
import HydroRecipeScreen from '../screens/AI/HydroRecipeScreen';
import FertilizerPredictorScreen from '../screens/AI/FertilizerPredictorScreen';
import { Crop } from '../constants/crops';

export type RootStackParamList = {
  // Auth Stack
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;

  // App Stack
  Home: undefined;
  CropSelection: undefined;
  DataInput: { crop: Crop };
  Result: {
    crop: Crop;
    cropName: string;
    ph: number;
    latitude: number;
    longitude: number;
    nutrientes: {
      N: number;
      P: number;
      K: number;
    };
    clima: {
      temperature: number;
      humidity: number;
      rainfall: number;
    };
    recomendacion: string;
  };
  CropList: undefined;
  CropsList: undefined;
  CropDetail: { id: number };
  CropForm: { id?: number } | undefined;
  ImagePredict: { cropId?: number } | undefined;
  HydroRecipe: { cropId?: number } | undefined;
  FertilizerPredictor: { cropId?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Root Navigator - Maneja el flujo condicional Auth/App
 */
const RootNavigator: React.FC = () => {
  const { isLoading, isSignedIn, user } = useAuth();

  useEffect(() => {
    console.log('🔐 RootNavigator - isLoading:', isLoading, 'isSignedIn:', isSignedIn, 'user:', user?.username);
  }, [isLoading, isSignedIn, user]);

  useEffect(() => {
    // Manejar logout desde el interceptor de API
    const unsub = addLogoutListener(() => {
      try {
        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      } catch (e) {
        console.error('Error resetting navigation on logout:', e);
      }
    });

    return () => unsub();
  }, []);

  // Actualizar navegación cuando isSignedIn cambia
  useEffect(() => {
    if (!isLoading && navigationRef.isReady()) {
      if (isSignedIn) {
        console.log('📱 Navegando a Home...');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        console.log('🔓 Navegando a Welcome...');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [isSignedIn, isLoading]);

  // Mostrar splash mientras se restaura la sesión
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFEF5' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: '#1b5e20',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        }}
        initialRouteName={isSignedIn ? 'Home' : 'Welcome'}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        {/* App Screens */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CropSelection" 
          component={CropSelectionScreen}
          options={{ title: 'Seleccionar Cultivo' }}
        />
        <Stack.Screen 
          name="CropList" 
          component={CropListScreen}
          options={{ title: 'Mis Cultivos' }}
        />
        <Stack.Screen 
          name="CropsList" 
          component={CropListScreen}
          options={{ title: 'Mis Cultivos' }}
        />
        <Stack.Screen 
          name="CropDetail" 
          component={CropDetailScreen}
          options={{ title: 'Detalles del Cultivo' }}
        />
        <Stack.Screen 
          name="CropForm" 
          component={CropFormScreen}
          options={({ route }) => ({
            title: (route.params as any)?.id ? 'Editar Cultivo' : 'Crear Cultivo',
          })}
        />
        <Stack.Screen 
          name="DataInput" 
          component={DataInputScreen}
          options={{ title: 'Datos de Entrada' }}
        />
        <Stack.Screen 
          name="ImagePredict" 
          component={ImagePredictScreen}
          options={{ title: 'Detectar Enfermedad' }}
        />
        <Stack.Screen 
          name="HydroRecipe" 
          component={HydroRecipeScreen}
          options={{ title: 'Receta Hidropónica' }}
        />
        <Stack.Screen 
          name="FertilizerPredictor" 
          component={FertilizerPredictorScreen}
          options={{ title: 'Predecir Nutrientes' }}
        />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen}
          options={{ title: 'Resultados' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export { navigationRef };
export default RootNavigator;
