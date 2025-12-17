import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useCrops } from '../../hooks/useCrops';
import { predictFertilizer } from '../../services/api';

// Para el slider de pH
let Slider: any = null;
if (Platform.OS !== 'web') {
  Slider = require('@react-native-community/slider').default;
} else {
  Slider = null;
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'FertilizerPredictor'>;
type R = RouteProp<RootStackParamList, 'FertilizerPredictor'>;

interface Props { navigation: Nav; route: R }

interface FertilizerResult {
  success?: boolean;
  nutrientes_requeridos?: {
    N?: number;
    P?: number;
    K?: number;
  };
  datos_clima?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
  };
  recomendacion?: string;
  prediction_id?: number;
  saved?: boolean;
  [key: string]: any;
}

const FertilizerPredictorScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialCropId = route.params?.cropId;
  const { crops, fetchCrops } = useCrops();

  const [cropId, setCropId] = useState<number | null>(initialCropId || null);
  const [ph, setPh] = useState(6.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);

  // Refrescar cultivos al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('🌾 FertilizerPredictorScreen: Componente enfocado, cargando cultivos');
      fetchCrops();
    }, [fetchCrops])
  );

  // Mostrar cultivos disponibles cuando cambian
  useEffect(() => {
    console.log('🌾 FertilizerPredictorScreen: Cultivos disponibles:', crops.length);
    crops.forEach((crop) => {
      console.log(`   - ID ${crop.id}: ${crop.name} (${crop.crop_type})`);
    });
  }, [crops]);

  const handlePredict = async () => {
    if (!cropId) {
      Alert.alert('Error', 'Por favor selecciona un cultivo primero');
      return;
    }

    setLoading(true);
    try {
      const body = {
        ph: parseFloat(ph.toFixed(1)),
      };
      console.log('📊 Enviando request a /predict:');
      console.log('   - Cultivo (crop_id):', cropId);
      console.log('   - Body:', body);
      const res = await predictFertilizer(body, cropId);
      console.log('✅ Respuesta recibida:', res);
      setResult(res);
    } catch (err: any) {
      console.error('❌ Error:', err);
      Alert.alert('Error', err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setResult(null)}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📊 Predicción de Nutrientes</Text>

        {/* Información del cultivo */}
        {result.crop_name && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌾 Cultivo Analizado</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{result.crop_name}</Text>
            </View>
            {result.crop_type && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipo:</Text>
                <Text style={styles.infoValue}>{result.crop_type}</Text>
              </View>
            )}
          </View>
        )}

        {/* Success Indicator */}
        {result.success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Predicción Generada Exitosamente</Text>
          </View>
        )}

        {/* Información de Predicción */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Información de Predicción</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de Predicción:</Text>
            <Text style={styles.infoValue}>{result.prediction_id || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guardado:</Text>
            <Text style={styles.infoValue}>
              {result.saved ? '✓ Sí' : '✗ No'}
            </Text>
          </View>
        </View>

        {/* Nutrientes Requeridos */}
        {result.nutrientes_requeridos && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🥗 Nutrientes Requeridos (kg/ha)</Text>
            <View style={styles.nutrientGrid}>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Nitrógeno (N)</Text>
                <Text style={styles.nutrientValue}>
                  {String((result.nutrientes_requeridos.N || 0).toFixed(2))}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Fósforo (P)</Text>
                <Text style={styles.nutrientValue}>
                  {String((result.nutrientes_requeridos.P || 0).toFixed(2))}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Potasio (K)</Text>
                <Text style={styles.nutrientValue}>
                  {String((result.nutrientes_requeridos.K || 0).toFixed(2))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Datos Climáticos */}
        {result.datos_clima && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡️ Condiciones Climáticas Detectadas</Text>
            <View style={styles.envGrid}>
              {result.datos_clima.temperature !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Temperatura</Text>
                  <Text style={styles.envValue}>
                    {String(Number(result.datos_clima.temperature).toFixed(1))}°C
                  </Text>
                </View>
              )}
              {result.datos_clima.humidity !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Humedad</Text>
                  <Text style={styles.envValue}>
                    {String(Number(result.datos_clima.humidity).toFixed(0))}%
                  </Text>
                </View>
              )}
              {result.datos_clima.rainfall !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Lluvia</Text>
                  <Text style={styles.envValue}>
                    {String(Number(result.datos_clima.rainfall).toFixed(1))} mm
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recomendación de Plan de Fertilización */}
        {result.recomendacion && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>� Plan de Fertilización Sugerido</Text>
            <Text style={styles.recommendationText}>
              {result.recomendacion}
            </Text>
          </View>
        )}

        {/* Parámetros utilizados */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Parámetros Utilizados</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>pH del agua:</Text>
            <Text style={styles.infoValue}>{ph.toFixed(1)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { marginBottom: 32 }]}
          onPress={() => setResult(null)}
        >
          <Text style={styles.buttonText}>Hacer otra predicción</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Predecir Nutrientes</Text>

      {/* Selector de cultivo */}
      <TouchableOpacity
        style={[
          styles.cropSelector,
          ...(cropId ? [styles.cropSelectorSelected] : [styles.cropSelectorWarning]),
        ]}
        onPress={() => setShowCropSelector(true)}
      >
        {cropId ? (
          <>
            <Text style={styles.cropSelectorLabel}>Cultivo seleccionado</Text>
            <Text style={styles.cropSelectorValue}>
              {crops.find((c) => c.id === cropId)?.name || `ID ${cropId}`}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cropSelectorLabel}>Selecciona un cultivo</Text>
            <Text style={styles.cropSelectorValueEmpty}>Toca para elegir</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Modal para seleccionar cultivo */}
      <Modal
        visible={showCropSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCropSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un cultivo</Text>
              <TouchableOpacity onPress={() => setShowCropSelector(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {crops.length === 0 ? (
              <View style={styles.noCropsContainer}>
                <Text style={styles.noCropsText}>No tienes cultivos disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={crops}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cropOption,
                      ...(cropId === item.id ? [styles.cropOptionSelected] : []),
                    ]}
                    onPress={() => {
                      setCropId(item.id);
                      setShowCropSelector(false);
                    }}
                  >
                    <View style={styles.cropOptionContent}>
                      <Text style={styles.cropOptionName}>{item.name}</Text>
                      <Text style={styles.cropOptionType}>{item.crop_type}</Text>
                    </View>
                    {cropId === item.id && (
                      <Text style={styles.cropOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Card con formulario */}
      <View style={styles.card}>
        {/* pH con slider */}
        <View style={styles.fieldGroup}>
          <View style={styles.phHeader}>
            <Text style={styles.fieldLabel}>pH del agua</Text>
            <View style={styles.phBadge}>
              <Text style={styles.phValue}>{ph.toFixed(1)}</Text>
            </View>
          </View>

          {Platform.OS === 'web' ? (
            // Input range para web
            <input
              type="range"
              min="0"
              max="14"
              step="0.1"
              value={ph}
              onChange={(e: any) => setPh(parseFloat(e.target.value))}
              style={styles.webSlider}
            />
          ) : Slider ? (
            // Slider nativo para móvil
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={14}
              step={0.1}
              value={ph}
              onValueChange={setPh}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#4CAF50"
            />
          ) : (
            <TextInput
              style={styles.input}
              value={ph.toFixed(1)}
              onChangeText={(text: string) => {
                const val = parseFloat(text);
                if (!isNaN(val) && val >= 0 && val <= 14) {
                  setPh(val);
                }
              }}
              keyboardType="decimal-pad"
              placeholder="6.0"
            />
          )}

          <View style={styles.phScale}>
            <Text style={styles.phScaleLabel}>0</Text>
            <Text style={styles.phScaleLabel}>7</Text>
            <Text style={styles.phScaleLabel}>14</Text>
          </View>
          <Text style={styles.fieldHint}>
            {ph < 5.5 ? '🔴 Muy ácido' : ph < 6.5 ? '🟢 Ácido (óptimo)' : ph < 7.5 ? '🟢 Neutro (bueno)' : '🔵 Alcalino'}
          </Text>
        </View>
      </View>

      {/* Botón predecir */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePredict}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Predecir Nutrientes</Text>
        )}
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF5',
    paddingTop: 0,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B5E20',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cropSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cropSelectorSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cropSelectorWarning: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  cropSelectorLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  cropSelectorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  cropSelectorValueEmpty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '600',
  },
  noCropsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCropsText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  cropOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cropOptionSelected: {
    backgroundColor: '#F0F8F0',
  },
  cropOptionContent: {
    flex: 1,
  },
  cropOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cropOptionType: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  cropOptionCheck: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '700',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  phHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  webSlider: {
    width: '100%',
    height: 8,
    marginBottom: 8,
    cursor: 'pointer',
  },
  phScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  phScaleLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  spacer: {
    height: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
    textTransform: 'capitalize',
  },
  nutrientGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutrient: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
  },
  envGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  envItem: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  envLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  envValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B5E20',
  },
  recommendation: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    borderRadius: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

export default FertilizerPredictorScreen;
