/**
 * Validadores para formularios y datos
 */

export const validators = {
  /**
   * Valida que un email sea válido
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida que una contraseña cumpla los requisitos mínimos
   * - Mínimo 8 caracteres
   * - Al menos una mayúscula
   * - Al menos una minúscula
   * - Al menos un número
   */
  isValidPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Valida que un username sea válido
   * - Mínimo 3 caracteres
   * - Máximo 30 caracteres
   * - Solo letras, números y guiones
   */
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  },

  /**
   * Valida que un pH esté en el rango válido (0-14)
   */
  isValidPH: (ph: number): boolean => {
    return ph >= 0 && ph <= 14;
  },

  /**
   * Valida que un número sea positivo
   */
  isPositiveNumber: (num: number): boolean => {
    return num > 0;
  },

  /**
   * Valida que una semana sea válida (1-20)
   */
  isValidWeek: (week: number): boolean => {
    return week >= 1 && week <= 20;
  },

  /**
   * Valida coordenadas de latitud
   */
  isValidLatitude: (lat: number): boolean => {
    return lat >= -90 && lat <= 90;
  },

  /**
   * Valida coordenadas de longitud
   */
  isValidLongitude: (long: number): boolean => {
    return long >= -180 && long <= 180;
  },

  /**
   * Valida que las contraseñas coincidan
   */
  passwordsMatch: (password1: string, password2: string): boolean => {
    return password1 === password2 && password1.length > 0;
  },
};

/**
 * Obtiene el mensaje de error amigable para errores de API
 */
export const getErrorMessage = (error: any): string => {
  // Si hay respuesta de error del servidor
  if (error?.response?.data) {
    const data = error.response.data;

    // Formato: { detail: string }
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    // Formato: { detail: { [field]: [errors] } }
    if (data.detail && typeof data.detail === 'object') {
      const field = Object.keys(data.detail)[0];
      const fieldErrors = data.detail[field];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }

    // Formato: { message: string }
    if (data.message) {
      return data.message;
    }

    // Formato: { error: string }
    if (data.error) {
      return data.error;
    }
  }

  // Errores de red o sin respuesta
  if (error?.message) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
};
