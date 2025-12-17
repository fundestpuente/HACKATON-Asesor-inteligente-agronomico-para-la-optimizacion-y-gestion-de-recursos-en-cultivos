import axios from 'axios';

// 🔑 IMPORTANTE: Reemplaza esto con tu API key real de OpenWeatherMap
// Obtén tu clave gratis en: https://openweathermap.org/api
const OPENWEATHER_API_KEY = '1fd8a5b7c8d1234567890abcdef12345';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
}

export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    console.log('🌤️ Solicitando datos climáticos para:', { latitude, longitude });
    
    const response = await axios.get(BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric', // Temperatura en Celsius
        lang: 'es', // Idioma español
      },
      timeout: 10000, // 10 segundos de timeout
    });

    const data = response.data;
    console.log('✅ Datos climáticos recibidos:', data);

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
    };

    console.log('📊 Datos procesados:', weatherData);
    return weatherData;
    
  } catch (error) {
    console.error('❌ Error al obtener datos climáticos:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          'API Key inválida. Por favor, verifica tu clave de OpenWeatherMap.'
        );
      }
      if (error.response?.status === 404) {
        throw new Error(
          'No se encontraron datos para esta ubicación.'
        );
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error(
          'Timeout: La solicitud tomó demasiado tiempo. Verifica tu conexión.'
        );
      }
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener datos climáticos. Verifica tu conexión a internet.'
      );
    }
    throw new Error('Error al obtener datos climáticos');
  }
};
