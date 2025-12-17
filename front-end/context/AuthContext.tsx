import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../services/api';
import { User, LoginRequest, RegisterRequest, ChangePasswordRequest } from '../types';

/**
 * Estados de autenticación
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
}

/**
 * Acciones del reducer
 */
type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload?: { user: User } }
  | { type: 'SIGN_IN'; payload: { user: User } }
  | { type: 'SIGN_UP'; payload: { user: User } }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

/**
 * Contexto de autenticación
 */
export interface AuthContextType extends AuthState {
  signUp: (payload: RegisterRequest) => Promise<void>;
  signIn: (payload: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Estado inicial
 */
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isSignedIn: false,
  error: null,
};

/**
 * Reducer
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload?.user ?? null,
        isSignedIn: !!action.payload?.user,
        isLoading: false,
      };

    case 'SIGN_IN':
      return {
        ...state,
        user: action.payload.user,
        isSignedIn: true,
        isLoading: false,
        error: null,
      };

    case 'SIGN_UP':
      return {
        ...state,
        user: action.payload.user,
        isSignedIn: false, // Después de registrarse, el usuario debe iniciar sesión
        isLoading: false,
        error: null,
      };

    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isSignedIn: false,
        isLoading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Provider de autenticación
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restaurar sesión al iniciar la app
   */
  const restoreToken = useCallback(async () => {
    try {
      console.log('🔄 restoreToken: Intentando restaurar sesión...');
      const accessToken = await AsyncStorage.getItem('@agromind_access_token');

      if (accessToken) {
        console.log('✅ restoreToken: Token encontrado, validando...');
        try {
          // Verificar que el token sea válido llamando a /auth/me
          const user = await authApi.me();
          console.log('✅ restoreToken: Token válido, usuario:', user.username);
          dispatch({ type: 'RESTORE_TOKEN', payload: { user } });
        } catch (error) {
          console.error('❌ restoreToken: Token inválido o expirado');
          // Token inválido o expirado, limpiar
          await authApi.clearTokens();
          dispatch({ type: 'RESTORE_TOKEN' });
        }
      } else {
        console.log('ℹ️ restoreToken: No hay token almacenado');
        dispatch({ type: 'RESTORE_TOKEN' });
      }
    } catch (error) {
      console.error('❌ restoreToken: Error -', error);
      dispatch({ type: 'RESTORE_TOKEN' });
    }
  }, []);

  /**
   * Restaurar token al montar el componente
   */
  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  /**
   * Registrarse
   */
  const signUp = useCallback(async (payload: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authApi.register(payload);
      dispatch({ type: 'SIGN_UP', payload: { user } });
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al registrarse';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Iniciar sesión
   */
  const signIn = useCallback(async (payload: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔐 signIn: Iniciando login con usuario:', payload.username);
      
      // Hacer login para obtener tokens
      const response = await authApi.login(payload);
      console.log('✅ signIn: Login exitoso, obteniendo usuario...');
      
      // Obtener datos del usuario autenticado
      const user = await authApi.me();
      console.log('✅ signIn: Usuario obtenido:', user.username);
      
      // Actualizar estado con el usuario
      dispatch({ type: 'SIGN_IN', payload: { user } });
      console.log('✅ signIn: Estado actualizado a SIGNED_IN');
    } catch (error: any) {
      console.error('❌ signIn: Error -', error?.message);
      const errorMessage = error?.message || 'Error al iniciar sesión';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authApi.clearTokens();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al cerrar sesión';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (payload: ChangePasswordRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authApi.changePassword(payload);
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al cambiar la contraseña';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
