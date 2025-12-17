// Script para limpiar AsyncStorage y poder ver el onboarding screen
// Ejecuta este archivo importándolo temporalmente en App.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage limpiado exitosamente. Recarga la app para ver el onboarding.');
  } catch (error) {
    console.error('❌ Error al limpiar AsyncStorage:', error);
  }
};

// Para usar: importa y llama clearAsyncStorage() en App.tsx dentro de useEffect
