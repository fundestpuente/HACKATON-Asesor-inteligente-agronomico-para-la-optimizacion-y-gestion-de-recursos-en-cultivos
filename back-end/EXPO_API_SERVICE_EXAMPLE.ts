/**
 * 📱 Ejemplo de Configuración API para Expo React Native
 * Archivo: app/services/api.ts (o api.js)
 * 
 * Este archivo configura la conexión con el backend AgroMind IA
 * en 192.168.100.31:8000
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ URL del Backend - Configura según tu ambiente
export const API_URL = 'http://192.168.100.31:8000';

// ✅ Crear instancia de axios con configuración base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🔐 Interceptor de REQUEST
 * Agrega el token de autenticación a cada petición
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token del almacenamiento
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        // Agregar token al header
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token agregado al request:', token.substring(0, 20) + '...');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 🔄 Interceptor de RESPONSE
 * Maneja errores 401 y renueva el token automáticamente
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status}:`, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Unauthorized/Token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('⚠️ Token expirado, intentando renovar...');

      try {
        // Obtener refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        if (!refreshToken) {
          console.error('❌ No hay refresh token disponible');
          throw new Error('No refresh token');
        }

        // Hacer petición para renovar token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        // Guardar nuevo token
        const newAccessToken = response.data.access_token;
        await AsyncStorage.setItem('access_token', newAccessToken);
        console.log('✅ Token renovado exitosamente');

        // Reintentar petición original con nuevo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si refresh falla, borrar tokens y redirigir a login
        console.error('❌ Error renovando token:', refreshError);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        
        // Aquí puedes redirigir a la pantalla de login
        // navigation.navigate('Auth', { screen: 'Login' });
        
        return Promise.reject(refreshError);
      }
    }

    // Log de otros errores
    console.error(
      `❌ Error ${error.response?.status}:`,
      error.response?.data?.detail || error.message
    );

    return Promise.reject(error);
  }
);

/**
 * 📞 SERVICIO DE AUTENTICACIÓN
 */
export const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (email: string, username: string, password: string) => {
    return apiClient.post('/auth/register', {
      email,
      username,
      password,
    });
  },

  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Guardar tokens
    await AsyncStorage.setItem('access_token', response.data.access_token);
    await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Obtener perfil del usuario actual
   */
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Renovar token manualmente
   */
  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  /**
   * Cerrar sesión (limpiar tokens)
   */
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
  },
};

/**
 * 🌾 SERVICIO DE CULTIVOS
 */
export const cropsService = {
  /**
   * Obtener lista de cultivos del usuario
   */
  getCrops: async (limit: number = 10, offset: number = 0) => {
    return apiClient.get('/crops', {
      params: { limit, offset },
    });
  },

  /**
   * Obtener cultivo por ID
   */
  getCropById: async (cropId: number) => {
    return apiClient.get(`/crops/${cropId}`);
  },

  /**
   * Crear nuevo cultivo
   */
  createCrop: async (cropData: {
    name: string;
    crop_type: string;
    location_lat?: number;
    location_long?: number;
    area?: number;
  }) => {
    return apiClient.post('/crops', cropData);
  },

  /**
   * Actualizar cultivo
   */
  updateCrop: async (cropId: number, cropData: any) => {
    return apiClient.put(`/crops/${cropId}`, cropData);
  },

  /**
   * Eliminar cultivo
   */
  deleteCrop: async (cropId: number) => {
    return apiClient.delete(`/crops/${cropId}`);
  },

  /**
   * Obtener predicciones de un cultivo
   */
  getCropPredictions: async (cropId: number) => {
    return apiClient.get(`/crops/${cropId}/predictions`);
  },

  /**
   * Obtener recetas hidropónicas de un cultivo
   */
  getCropRecipes: async (cropId: number) => {
    return apiClient.get(`/crops/${cropId}/recipes`);
  },

  /**
   * Obtener estadísticas del cultivo
   */
  getCropStats: async (cropId: number) => {
    return apiClient.get(`/crops/${cropId}/stats`);
  },
};

/**
 * 🧪 SERVICIO DE PREDICCIONES (IA)
 */
export const predictionsService = {
  /**
   * Generar predicción de fertilizante
   */
  predictFertilizer: async (cropId: number | null, ph: number) => {
    const params = cropId ? { crop_id: cropId } : {};
    return apiClient.post(
      '/predict',
      { ph },
      { params }
    );
  },

  /**
   * Generar receta hidropónica
   */
  generateHydroRecipe: async (
    cropId: number | null,
    waterVolume: number,
    temperature: number,
    phLevel: number
  ) => {
    const params = cropId ? { crop_id: cropId } : {};
    return apiClient.post(
      '/generate-recipe',
      {
        water_volume: waterVolume,
        temperature: temperature,
        ph_level: phLevel,
      },
      { params }
    );
  },

  /**
   * Detectar enfermedad en planta (usando imagen)
   */
  detectDisease: async (imageUri: string) => {
    const formData = new FormData();
    
    // Agregar imagen
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'plant-image.jpg',
    } as any);

    return apiClient.post('/detect-disease', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

/**
 * 🧠 FUNCIONES AUXILIARES
 */
export const apiHelpers = {
  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Obtener usuario guardado localmente
   */
  getLocalUser: async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Obtener token de acceso
   */
  getAccessToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('access_token');
  },

  /**
   * Obtener token de refresco
   */
  getRefreshToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('refresh_token');
  },

  /**
   * Prueba de conexión al servidor
   */
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/docs`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  },
};

/**
 * 📤 Exportar cliente API por defecto
 */
export default apiClient;

/**
 * 📝 EJEMPLO DE USO EN COMPONENTES
 * 
 * import { authService, cropsService } from '../services/api';
 * 
 * // En un componente
 * const LoginScreen = () => {
 *   const handleLogin = async () => {
 *     try {
 *       const data = await authService.login(email, password);
 *       console.log('✅ Login exitoso:', data.user);
 *     } catch (error) {
 *       console.error('❌ Error:', error);
 *     }
 *   };
 * };
 * 
 * // Obtener cultivos
 * const CropsScreen = () => {
 *   useEffect(() => {
 *     cropsService.getCrops()
 *       .then(res => setCrops(res.data))
 *       .catch(err => console.error('Error:', err));
 *   }, []);
 * };
 * 
 * // Hacer predicción
 * const PredictScreen = () => {
 *   const handlePredict = async () => {
 *     try {
 *       const result = await predictionsService.predictFertilizer(cropId, ph);
 *       console.log('Nutrientes:', result.data.nutrientes_requeridos);
 *     } catch (error) {
 *       console.error('Error en predicción:', error);
 *     }
 *   };
 * };
 */
