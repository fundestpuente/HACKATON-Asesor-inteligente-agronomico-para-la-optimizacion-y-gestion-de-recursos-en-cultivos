// 🔧 CONFIGURACIÓN DE LA API
// Cambia esta IP a la de tu computadora cuando estés desarrollando

// Para obtener tu IP:
// Windows: ipconfig | findstr /i "IPv4"
// Mac/Linux: ifconfig | grep "inet "

// IMPORTANTE: Tu dispositivo móvil y tu PC deben estar en la misma red WiFi

export const API_CONFIG = {
  // IP de tu computadora en la red local (WiFi)
  // Tu IP actual: 192.168.100.31
  BASE_URL: 'http://192.168.100.31:8000',

  // Endpoints
  ENDPOINTS: {
    PREDICT: '/predict',
  },

  // Timeout en milisegundos
  TIMEOUT: 30000,
};

// URL completa del endpoint de predicción
export const PREDICT_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREDICT}`;
