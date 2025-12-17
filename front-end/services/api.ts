import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  Crop,
  CreateCropRequest,
  UpdateCropRequest,
  Prediction,
  PredictRequest,
  PredictResponse,
  HydroRecipe,
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  ImagePrediction,
  PredictImageResponse,
  CropStats,
  ApiErrorResponse,
} from '../types';

// Base URL de la API (desde config.ts)
export const API_BASE_URL = API_CONFIG.BASE_URL;

const ACCESS_TOKEN_KEY = '@agromind_access_token';
const REFRESH_TOKEN_KEY = '@agromind_refresh_token';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

// --- Interceptor de request: inyecta Authorization si hay access token ---
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        console.log('📡 Request interceptor: Token encontrado, agregando Authorization header');
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        } as any;
      } else {
        console.log('📡 Request interceptor: No hay token disponible');
      }
    } catch (err) {
      console.error('📡 Request interceptor: Error al obtener token -', err);
      // Ignorar error de lectura de token y dejar pasar la petición sin header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor para refrescar tokens automaticamente en 401 ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      client
        .request(config)
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // enqueue request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        // Llamar al endpoint de refresh directamente sin usar el interceptor
        const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        const newAccess = refreshRes.data?.access_token;
        if (!newAccess) throw new Error('Refresh failed');

        await saveTokens(newAccess);
        processQueue(null, newAccess);

        // Set header y reintentar original
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        } else {
          originalRequest.headers = { Authorization: `Bearer ${newAccess}` } as any;
        }

        return client.request(originalRequest);
      } catch (err) {
            processQueue(err, null);
            await clearTokensAndNotify();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;
    const message = axiosErr.response?.data?.message || axiosErr.message;
    console.error('📡 Axios Error:', {
      status: axiosErr.response?.status,
      message: message,
      data: axiosErr.response?.data,
    });
    throw new Error(message);
  }
  console.error('📡 Unknown Error:', error);
  throw new Error('Error desconocido al comunicarse con el servidor');
};

// Token helpers
export const saveTokens = async (accessToken: string, refreshToken?: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

// llamar notifyLogout cuando limpiamos tokens
export const clearTokensAndNotify = async () => {
  await clearTokens();
  notifyLogout();
};

// --- Auth logout listeners: la app puede registrarse para recibir notificación cuando los tokens se borran ---
type LogoutHandler = () => void;
const logoutHandlers: LogoutHandler[] = [];

export const addLogoutListener = (fn: LogoutHandler) => {
  logoutHandlers.push(fn);
  return () => {
    const idx = logoutHandlers.indexOf(fn);
    if (idx >= 0) logoutHandlers.splice(idx, 1);
  };
};

const notifyLogout = () => {
  logoutHandlers.forEach((h) => {
    try { h(); } catch (e) { /* ignore handler errors */ }
  });
};


export const getAccessToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

// ---------------------------
// Auth endpoints
// ---------------------------

export const register = async (payload: RegisterRequest): Promise<User> => {
  try {
    const res = await client.post<User>('/auth/register', payload);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('📡 api.login: Enviando solicitud a /auth/login');
    const res = await client.post<AuthResponse>('/auth/login', payload);
    console.log('📡 api.login: Respuesta recibida:', res.status);
    const data = res.data;
    if (data?.access_token) {
      console.log('📡 api.login: Token recibido, guardando...');
      await saveTokens(data.access_token, data.refresh_token);
      console.log('📡 api.login: Tokens guardados correctamente');
    }
    return data;
  } catch (err) {
    console.error('📡 api.login: Error -', err);
    handleAxiosError(err);
    throw err;
  }
};

export const refresh = async (): Promise<{ access_token: string; token_type?: string }> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    const res = await client.post<{ access_token: string; token_type?: string }>('/auth/refresh', { refresh_token: refreshToken });
    const data = res.data;
    if (data?.access_token) await saveTokens(data.access_token);
    return data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const me = async (): Promise<User> => {
  try {
    console.log('📡 api.me: Obteniendo datos del usuario autenticado...');
    const res = await client.get<User>('/auth/me');
    console.log('📡 api.me: Usuario obtenido:', res.data.username);
    return res.data;
  } catch (err) {
    console.error('📡 api.me: Error -', err);
    handleAxiosError(err);
    throw err;
  }
};

export const changePassword = async (payload: ChangePasswordRequest): Promise<{ message: string }> => {
  try {
    const res = await client.post<{ message: string }>('/auth/change-password', payload);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

// ---------------------------
// Crops endpoints
// ---------------------------

export const createCrop = async (cropData: CreateCropRequest): Promise<Crop> => {
  try {
    const res = await client.post<Crop>('/crops', cropData);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const listCrops = async (params?: {
  crop_type?: string;
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<{ items: Crop[]; total: number; skip: number; limit: number }> => {
  try {
    const res = await client.get<{ items: Crop[]; total: number; skip: number; limit: number }>('/crops', { params });
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const getCrop = async (id: string | number): Promise<Crop> => {
  try {
    const res = await client.get<Crop>(`/crops/${id}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const updateCrop = async (id: string | number, patch: UpdateCropRequest): Promise<Crop> => {
  try {
    const res = await client.put<Crop>(`/crops/${id}`, patch);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const deleteCrop = async (id: string | number): Promise<{ message: string }> => {
  try {
    const res = await client.delete<{ message: string }>(`/crops/${id}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const getCropPredictions = async (id: string | number): Promise<Prediction[]> => {
  try {
    const res = await client.get<Prediction[]>(`/crops/${id}/predictions`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const getCropHydroRecipes = async (id: string | number): Promise<HydroRecipe[]> => {
  try {
    const res = await client.get<HydroRecipe[]>(`/crops/${id}/hydro-recipes`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

export const getCropStats = async (id: string | number): Promise<CropStats> => {
  try {
    const res = await client.get<CropStats>(`/crops/${id}/stats`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

// ---------------------------
// AI endpoints - Predictions
// ---------------------------

export const predict = async (
  body: PredictRequest,
  cropId?: string | number
): Promise<PredictResponse> => {
  try {
    const url = cropId ? `/predict?crop_id=${encodeURIComponent(String(cropId))}` : '/predict';
    const res = await client.post<PredictResponse>(url, body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    throw err;
  }
};

// ---------------------------
// AI endpoints - Hydro Recipes
// ---------------------------

export const generateRecipe = async (
  body: GenerateRecipeRequest,
  cropId?: string | number
): Promise<GenerateRecipeResponse> => {
  try {
    const cropIdInt = cropId ? parseInt(String(cropId), 10) : null;
    const url = cropIdInt ? `/generate-recipe?crop_id=${cropIdInt}` : '/generate-recipe';
    
    console.log('');
    console.log('='.repeat(60));
    console.log('🌱 generateRecipe: INICIANDO');
    console.log('='.repeat(60));
    console.log('URL:', `${API_BASE_URL}${url}`);
    console.log('Crop ID:', cropIdInt);
    console.log('Body:', body);
    console.log('');
    
    const res = await client.post<GenerateRecipeResponse>(url, body);
    
    console.log('✅ Respuesta exitosa');
    console.log('Datos:', res.data);
    console.log('');
    
    return res.data;
  } catch (err) {
    console.error('❌ Error en generateRecipe:', err);
    handleAxiosError(err);
    throw err;
  }
};

// ---------------------------
// AI endpoints - Fertilizer Prediction
// ---------------------------

export const predictFertilizer = async (
  body: { ph: number },
  cropId?: string | number
): Promise<any> => {
  try {
    const cropIdInt = cropId ? parseInt(String(cropId), 10) : null;
    const url = cropIdInt ? `/predict?crop_id=${cropIdInt}` : '/predict';
    
    console.log('');
    console.log('='.repeat(60));
    console.log('🧪 predictFertilizer: INICIANDO PREDICCIÓN');
    console.log('='.repeat(60));
    console.log('URL:', `${API_BASE_URL}${url}`);
    console.log('Crop ID:', cropIdInt);
    console.log('Body:', body);
    console.log('');
    
    const res = await client.post<any>(url, body);
    
    console.log('✅ Respuesta exitosa');
    console.log('Datos:', res.data);
    console.log('');
    
    return res.data;
  } catch (err) {
    console.error('❌ Error en predictFertilizer:', err);
    handleAxiosError(err);
    throw err;
  }
};

// ---------------------------
// AI endpoints - Image Prediction
// ---------------------------

export const predictImage = async (
  file: any,
  cropId?: string | number
): Promise<PredictImageResponse> => {
  try {
    if (!cropId) {
      throw new Error('crop_id es requerido para predecir imagen');
    }

    const token = await getAccessToken();
    
    // Convertir cropId a integer
    const cropIdInt = parseInt(String(cropId), 10);
    if (isNaN(cropIdInt)) {
      throw new Error(`crop_id inválido: ${cropId}`);
    }

    const url = `${API_BASE_URL}/predict-image?crop_id=${cropIdInt}`;
    
    console.log('='.repeat(60));
    console.log('📸 predictImage: INICIANDO PREDICCIÓN DE IMAGEN');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 PARÁMETROS:');
    console.log('   URL completa:', url);
    console.log('   crop_id:', cropIdInt, `(tipo: ${typeof cropIdInt})`);
    console.log('');
    console.log('📁 ARCHIVO:');
    console.log('   Nombre:', file?.name);
    console.log('   Tipo:', file?.type);
    console.log('   URI (primeros 100 caracteres):', file?.uri?.substring(0, 100));
    console.log('   URI (longitud total):', file?.uri?.length);
    console.log('');
    console.log('🔐 AUTENTICACIÓN:');
    console.log('   Token disponible:', !!token);
    if (token) {
      console.log('   Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
    }
    console.log('');
    
    // Crear FormData
    const fd = new FormData();
    
    console.log('📦 PROCESANDO ARCHIVO:');
    
    // Detectar si estamos en web o en React Native
    const isWeb = typeof (globalThis as any).window !== 'undefined' && typeof File !== 'undefined';
    console.log('   Plataforma:', isWeb ? 'WEB' : 'NATIVE');
    
    let fileToAppend: any;
    
    if (isWeb && file.uri && file.uri.startsWith('blob:')) {
      // Ya es un blob en web
      console.log('   ✓ Ya es un blob');
      fileToAppend = file;
    } else if (isWeb && file.uri && file.uri.startsWith('data:')) {
      // Data URL en web - convertir a blob
      console.log('   → Convirtiendo data URL a blob');
      const response = await fetch(file.uri);
      const blob = await response.blob();
      console.log('   ✓ Data URL convertida a blob');
      fileToAppend = new File([blob], file.name || 'image.jpg', { type: file.type || 'image/jpeg' });
    } else if (isWeb && file.uri && file.uri.startsWith('http')) {
      // URL remota en web - descargar y convertir a blob
      console.log('   → Descargando desde URL remota');
      const response = await fetch(file.uri);
      const blob = await response.blob();
      console.log('   ✓ URL remota descargada y convertida a blob');
      fileToAppend = new File([blob], file.name || 'image.jpg', { type: file.type || 'image/jpeg' });
    } else if (isWeb && file.uri && file.uri.startsWith('file:')) {
      // Archivo local en web (file:// URL) - convertir a blob
      console.log('   → Convirtiendo file:// URL a blob');
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        console.log('   ✓ file:// URL convertida a blob, tamaño:', blob.size, 'bytes');
        fileToAppend = new File([blob], file.name || 'image.jpg', { type: file.type || 'image/jpeg' });
      } catch (error) {
        console.log('   ✗ Error al convertir file:// URL:', error);
        // Fallback: if fetch fails on file:// URL, try to use File directly if available
        if (file instanceof File) {
          console.log('   → Usando File object como fallback');
          fileToAppend = file;
        } else {
          throw error;
        }
      }
    } else if (isWeb && file instanceof File) {
      // Ya es un File object
      console.log('   ✓ Ya es un File object');
      fileToAppend = file;
    } else {
      // React Native o archivo local
      console.log('   → Tratando como archivo React Native (uri + name + type)');
      fileToAppend = {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'image.jpg',
      };
      console.log('   ✓ Archivo React Native preparado');
    }
    
    console.log('   Tipo final:', fileToAppend instanceof File ? 'File' : typeof fileToAppend);
    fd.append('file', fileToAppend as any);
    console.log('   ✓ Archivo agregado a FormData');
    console.log('');
    
    // Preparar headers
    const headers: any = {
      'Accept': 'application/json',
      // NO setear Content-Type: multipart/form-data, fetch lo hará automáticamente
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🌐 HEADERS:');
    Object.keys(headers).forEach((key) => {
      const value = headers[key];
      if (key === 'Authorization') {
        console.log(`   ${key}: Bearer ${value.substring(7, 57)}...`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    console.log('');
    
    console.log('🚀 ENVIANDO REQUEST:');
    console.log('   Método: POST');
    console.log('   URL: ' + url);
    console.log('   Content-Type: multipart/form-data (automático)');
    console.log('');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: fd,
    });

    console.log('� RESPUESTA RECIBIDA:');
    console.log('   Status: ' + response.status);
    console.log('   StatusText: ' + response.statusText);
    console.log('');
    
    let data: any;
    try {
      data = await response.json();
      console.log('📄 RESPONSE BODY:');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('   ❌ Error parsing JSON:', e);
      throw new Error('No se pudo parsear la respuesta del servidor');
    }

    console.log('');
    if (!response.ok) {
      console.error('❌ ERROR HTTP DETECTADO');
      console.error('   Status:', response.status);
      console.error('   Detail:', data?.detail);
      console.error('   Full data:', data);
      console.error('='.repeat(60));
      throw new Error(data?.detail || data?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ PREDICCIÓN EXITOSA');
    console.log('='.repeat(60));
    return data;
  } catch (err: any) {
    console.error('');
    console.error('❌ ERROR EN predictImage:');
    console.error('   Tipo:', err?.name);
    console.error('   Mensaje:', err?.message);
    console.error('   Stack:', err?.stack?.substring(0, 200));
    console.error('='.repeat(60));
    throw err;
  }
};

// Export el cliente por si se necesita hacer llamadas ad-hoc
export default client;
