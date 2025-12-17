import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootNavigator';
import { CROP_NAMES } from '../constants/crops';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../config';
import { predict } from '../services/api';

type DataInputScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DataInput'
>;

type DataInputScreenRouteProp = RouteProp<RootStackParamList, 'DataInput'>;

interface Props {
  navigation: DataInputScreenNavigationProp;
  route: DataInputScreenRouteProp;
}

const FARMER_ID_KEY = '@agroia_farmer_id';
const LOCATION_KEY = '@agroia_location';

const DataInputScreen: React.FC<Props> = ({ navigation, route }) => {
  const { crop } = route.params;

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [phValue, setPhValue] = useState(7.0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gettingRecommendation, setGettingRecommendation] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setLoadingLocation(true);
    try {
      // Cargar ubicación guardada
      const locationStr = await AsyncStorage.getItem(LOCATION_KEY);
      if (locationStr) {
        const locationData = JSON.parse(locationStr);
        setLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      }
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert('Error', 'No se pudo cargar la ubicación');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!location) {
      Alert.alert('Error', 'Ubicación no disponible. Por favor, regresa y captura la ubicación nuevamente.');
      return;
    }

    setGettingRecommendation(true);
    try {
      console.log('🚀 Enviando solicitud al backend...');
      
      // Preparar datos para el backend
      const requestData = {
        crop: crop.toLowerCase(),
        ph: phValue,
        latitud: location.latitude,
        longitud: location.longitude,
      };

      console.log('📤 Datos enviados:', requestData);
      console.log('🌐 Enviando predict con payload:', requestData);

      const data = await predict(requestData);

      console.log('✅ Respuesta recibida:', data);

      if (data?.success) {
        // Preparar datos de nutrientes con valores por defecto
        const nutrientes = {
          N: data?.nutrientes_requeridos?.N || 0,
          P: data?.nutrientes_requeridos?.P || 0,
          K: data?.nutrientes_requeridos?.K || 0,
        };

        // Preparar datos de clima con valores por defecto
        const clima = {
          temperature: data?.datos_clima?.temperature || 0,
          humidity: data?.datos_clima?.humidity || 0,
          rainfall: data?.datos_clima?.rainfall || 0,
        };

        // Navegar a la pantalla de resultados con todos los datos
        navigation.navigate('Result', {
          crop: crop,
          cropName: CROP_NAMES[crop],
          ph: phValue,
          latitude: location.latitude,
          longitude: location.longitude,
          nutrientes: nutrientes,
          clima: clima,
          recomendacion: data.recomendacion || 'Sin recomendaciones disponibles',
        });
      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('❌ Error al obtener recomendación:', error);
      
      let errorMessage = 'No se pudo obtener la recomendación';
      
      // Manejo genérico de errores (axios o cualquier excepción)
      if (error && typeof error === 'object') {
        // @ts-ignore
        const code = (error as any).code;
        // @ts-ignore
        const response = (error as any).response;
        // @ts-ignore
        const request = (error as any).request;

        if (code === 'ECONNABORTED') {
          errorMessage = 'Timeout: La solicitud tomó demasiado tiempo. Verifica tu conexión.';
        } else if (response) {
          // @ts-ignore
          errorMessage = `Error del servidor: ${response.status}\n${response.data?.detail || ''}`;
        } else if (request) {
          errorMessage = 'No se pudo conectar con el servidor.\n\n' +
            `Intentando conectar a: ${API_CONFIG.BASE_URL}\n\n` +
            '✅ Verifica que el servidor esté corriendo (python api.py)\n' +
            '✅ Confirma que tu dispositivo y PC estén en la misma red WiFi\n' +
            '✅ Si cambió tu IP, actualiza config.ts con tu IP actual';
        }
      }
      
      Alert.alert('Error de conexión', errorMessage);
    } finally {
      setGettingRecommendation(false);
    }
  };

  const getPhColor = (ph: number) => {
    if (ph < 6.0) return '#FF5722'; // Ácido - Rojo
    if (ph >= 6.0 && ph <= 8.0) return '#4CAF50'; // Neutro - Verde
    return '#2196F3'; // Alcalino - Azul
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Datos de captura</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cultivo seleccionado - Circular */}
        <View style={styles.cropSection}>
          <Text style={styles.sectionLabel}>Cultivo seleccionado</Text>
          <View style={styles.cropCircle}>
            <Image
              source={require('../assets/agricultura.png')}
              style={styles.cropImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.cropName}>{CROP_NAMES[crop]}</Text>
        </View>

        {/* Ubicación capturada */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionLabel}>Ubicación capturada</Text>
          {loadingLocation ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando ubicación...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>📍 Latitud:</Text>
                <Text style={styles.locationValue}>{location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>📍 Longitud:</Text>
                <Text style={styles.locationValue}>{location.longitude.toFixed(6)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noLocationCard}>
              <Text style={styles.noLocationText}>No se pudo obtener la ubicación</Text>
            </View>
          )}
        </View>

        {/* Selector de pH con Slider */}
        <View style={styles.phSection}>
          <Text style={styles.sectionLabel}>pH del suelo</Text>
          <View style={styles.phCard}>
            <View style={styles.phValueContainer}>
              <Text style={[styles.phValue, { color: getPhColor(phValue) }]}>
                {phValue.toFixed(1)}
              </Text>
              <Text style={styles.phLabel}>
                {phValue < 6.0 ? 'Ácido' : phValue <= 8.0 ? 'Neutro' : 'Alcalino'}
              </Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0.0</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={14}
                step={0.1}
                value={phValue}
                onValueChange={setPhValue}
                minimumTrackTintColor={getPhColor(phValue)}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={getPhColor(phValue)}
              />
              <Text style={styles.sliderLabel}>14.0</Text>
            </View>
            
            <View style={styles.phGuide}>
              <View style={styles.phGuideItem}>
                <View style={[styles.phDot, { backgroundColor: '#FF5722' }]} />
                <Text style={styles.phGuideText}>Ácido (0-5.9)</Text>
              </View>
              <View style={styles.phGuideItem}>
                <View style={[styles.phDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.phGuideText}>Neutro (6.0-8.0)</Text>
              </View>
              <View style={styles.phGuideItem}>
                <View style={[styles.phDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.phGuideText}>Alcalino (8.1-14)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Espacio adicional antes del botón */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Botón fijo en la parte inferior */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleGetRecommendation}
          activeOpacity={0.85}
          disabled={gettingRecommendation || !location}
        >
          <LinearGradient
            colors={
              gettingRecommendation || !location
                ? ['#9E9E9E', '#BDBDBD']
                : ['#4CAF50', '#66BB6A']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {gettingRecommendation ? (
              <View style={styles.loadingButtonContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Obteniendo...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Obtener recomendación de IA</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFEF5',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1B5E20',
    fontFamily: 'Montserrat_600SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cropSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 16,
  },
  cropCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  cropName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 12,
  },
  locationSection: {
    marginBottom: 32,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 12,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Montserrat_500Medium',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    fontFamily: 'Montserrat_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherLabel: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Montserrat_500Medium',
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'Montserrat_600SemiBold',
  },
  noLocationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 14,
    color: '#D32F2F',
    fontFamily: 'Montserrat_500Medium',
  },
  phSection: {
    marginBottom: 32,
  },
  phCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phValueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  phValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  phLabel: {
    fontSize: 16,
    color: '#757575',
    fontFamily: 'Montserrat_500Medium',
    marginTop: 4,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Montserrat_500Medium',
    width: 30,
    textAlign: 'center',
  },
  phGuide: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  phGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  phGuideText: {
    fontSize: 11,
    color: '#757575',
    fontFamily: 'Montserrat_400Regular',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonWrapper: {
    width: '100%',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default DataInputScreen;
