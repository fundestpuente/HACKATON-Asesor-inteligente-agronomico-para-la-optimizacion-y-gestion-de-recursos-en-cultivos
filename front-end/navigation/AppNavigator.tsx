import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Crop } from '../constants/crops';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import CropSelectionScreen from '../screens/CropSelectionScreen';
import DataInputScreen from '../screens/DataInputScreen';
import ResultScreen from '../screens/ResultScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import CropListScreen from '../screens/Crops/CropListScreen';
import CropDetailScreen from '../screens/Crops/CropDetailScreen';
import CropFormScreen from '../screens/Crops/CropFormScreen';
import ImagePredictScreen from '../screens/AI/ImagePredictScreen';
import HydroRecipeScreen from '../screens/AI/HydroRecipeScreen';
import FertilizerPredictorScreen from '../screens/AI/FertilizerPredictorScreen';
import { addLogoutListener } from '../services/api';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
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
  CropDetail: { id: number };
  CropForm: { id?: number } | undefined;
  ImagePredict: { cropId?: number } | undefined;
  HydroRecipe: { cropId?: number } | undefined;
  FertilizerPredictor: { cropId?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigator: React.FC = () => {
  useEffect(() => {
    // Cuando se haga logout desde el cliente (clearTokensAndNotify), navegar a Welcome
    const unsub = addLogoutListener(() => {
      try {
        if (navigationRef.isReady()) {
          navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      } catch (e) {
        // ignore
      }
    });

    return () => unsub();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CropSelection" component={CropSelectionScreen} />
        <Stack.Screen name="CropList" component={CropListScreen} />
        <Stack.Screen name="CropDetail" component={CropDetailScreen} />
        <Stack.Screen name="CropForm" component={CropFormScreen} />
        <Stack.Screen name="DataInput" component={DataInputScreen} />
        <Stack.Screen name="ImagePredict" component={ImagePredictScreen} />
        <Stack.Screen name="HydroRecipe" component={HydroRecipeScreen} />
        <Stack.Screen name="FertilizerPredictor" component={FertilizerPredictorScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
