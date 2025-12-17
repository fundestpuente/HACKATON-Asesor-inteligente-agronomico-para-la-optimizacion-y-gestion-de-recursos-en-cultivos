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
import { generateRecipe } from '../../services/api';

// Para el slider de pH
let Slider: any = null;
if (Platform.OS !== 'web') {
  Slider = require('@react-native-community/slider').default;
} else {
  // Para web usaremos un input range
  Slider = null;
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'HydroRecipe'>;
type R = RouteProp<RootStackParamList, 'HydroRecipe'>;

interface Props { navigation: Nav; route: R }

interface RecipeResult {
  macronutrientes?: any;
  micronutrientes?: any;
  recomendaciones?: string[];
  receta_optimizada?: any;
  [key: string]: any;
}

const HydroRecipeScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialCropId = route.params?.cropId;
  const { crops, fetchCrops } = useCrops();
  
  const [cropId, setCropId] = useState<number | null>(initialCropId || null);
  const [week, setWeek] = useState('2');
  const [tank, setTank] = useState('100');
  const [ph, setPh] = useState(6.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);

  // Refrescar cultivos al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('📋 HydroRecipeScreen: Componente enfocado, cargando cultivos');
      fetchCrops();
    }, [fetchCrops])
  );

  // Mostrar cultivos disponibles cuando cambian
  useEffect(() => {
    console.log('🌾 HydroRecipeScreen: Cultivos disponibles:', crops.length);
    crops.forEach((crop) => {
      console.log(`   - ID ${crop.id}: ${crop.name} (${crop.crop_type})`);
    });
  }, [crops]);

  const handleGenerate = async () => {
    if (!week || !tank) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    if (!cropId) {
      Alert.alert('Error', 'No se encontró el cultivo. Por favor selecciona uno primero.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        week: parseInt(week, 10),
        tank_liters: parseFloat(tank),
        ph_water: parseFloat(ph.toFixed(1)),
      };
      console.log('📋 Enviando request a /generate-recipe:');
      console.log('   - Cultivo (crop_id):', cropId);
      console.log('   - Body:', body);
      const res = await generateRecipe(body, cropId);
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

        <Text style={styles.title}>📋 Receta Hidropónica Generada</Text>

        {/* Información del tanque */}
        {result.tank_info && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🪣 Información del Tanque</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cultivo:</Text>
              <Text style={styles.infoValue}>{result.tank_info.crop || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Volumen:</Text>
              <Text style={styles.infoValue}>{result.tank_info.volume} L</Text>
            </View>
          </View>
        )}

        {/* Ambiente */}
        {result.environment && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡️ Ambiente</Text>
            <View style={styles.envGrid}>
              <View style={styles.envItem}>
                <Text style={styles.envLabel}>Temperatura</Text>
                <Text style={styles.envValue}>
                  {parseFloat(result.environment.temperature).toFixed(1)}°C
                </Text>
              </View>
              <View style={styles.envItem}>
                <Text style={styles.envLabel}>Humedad</Text>
                <Text style={styles.envValue}>
                  {parseFloat(result.environment.humidity).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Metas de nutrientes */}
        {result.meta && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Metas de Nutrientes (ppm)</Text>
            <View style={styles.nutrientGrid}>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Nitrógeno (N)</Text>
                <Text style={styles.nutrientValue}>
                  {parseFloat(result.meta.target_ppm?.N || 0).toFixed(1)}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Fósforo (P)</Text>
                <Text style={styles.nutrientValue}>
                  {parseFloat(result.meta.target_ppm?.P || 0).toFixed(1)}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Potasio (K)</Text>
                <Text style={styles.nutrientValue}>
                  {parseFloat(result.meta.target_ppm?.K || 0).toFixed(1)}
                </Text>
              </View>
            </View>
            {result.meta.target_ec && (
              <View style={styles.ecRow}>
                <Text style={styles.ecLabel}>Conductividad Eléctrica (EC):</Text>
                <Text style={styles.ecValue}>
                  {parseFloat(result.meta.target_ec).toFixed(3)} dS/m
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Mix A */}
        {result.mix_A && result.mix_A.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 Tank A (Solución A)</Text>
            {result.mix_A.map((item: any, idx: number) => (
              <View key={idx} style={styles.chemicalCard}>
                <Text style={styles.chemicalName}>{item.name}</Text>
                <View style={styles.chemicalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={styles.detailValue}>{parseFloat(item.grams_total).toFixed(2)} g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Por litro:</Text>
                    <Text style={styles.detailValue}>{parseFloat(item.dose_per_liter).toFixed(3)} g/L</Text>
                  </View>
                </View>
                <Text style={styles.instruction}>
                  ℹ️ {item.human_instruction}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Mix B */}
        {result.mix_B && result.mix_B.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 Tank B (Solución B)</Text>
            {result.mix_B.map((item: any, idx: number) => (
              <View key={idx} style={styles.chemicalCard}>
                <Text style={styles.chemicalName}>{item.name}</Text>
                <View style={styles.chemicalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={styles.detailValue}>{parseFloat(item.grams_total).toFixed(2)} g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Por litro:</Text>
                    <Text style={styles.detailValue}>{parseFloat(item.dose_per_liter).toFixed(3)} g/L</Text>
                  </View>
                </View>
                <Text style={styles.instruction}>
                  ℹ️ {item.human_instruction}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Información de guardado */}
        {result.recipe_id && (
          <View style={[styles.card, styles.cardSuccess]}>
            <Text style={styles.successText}>
              ✓ Receta guardada exitosamente
            </Text>
            <Text style={styles.recipeIdText}>ID de Receta: {result.recipe_id}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { marginBottom: 32 }]}
          onPress={() => setResult(null)}
        >
          <Text style={styles.buttonText}>Generar otra receta</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Generar Receta Hidropónica</Text>

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
        {/* Semana */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Semana de crecimiento</Text>
          <TextInput
            style={styles.input}
            value={week}
            onChangeText={setWeek}
            keyboardType="number-pad"
            placeholder="1-12"
            maxLength={2}
          />
          <Text style={styles.fieldHint}>Rango: 1-12 semanas</Text>
        </View>

        {/* Litros del tanque */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Volumen del tanque</Text>
          <TextInput
            style={styles.input}
            value={tank}
            onChangeText={setTank}
            keyboardType="decimal-pad"
            placeholder="100"
          />
          <Text style={styles.fieldHint}>En litros</Text>
        </View>

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
              onChangeText={(text) => {
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

      {/* Botón generar */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Generar Receta</Text>
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
  nutrientList: {
    gap: 8,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  nutrientName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  nutrientVal: {
    fontSize: 14,
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
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paramLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  paramValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
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
  ecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ecLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  ecValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  chemicalCard: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  chemicalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  chemicalDetails: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
  instruction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  cardSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  recipeIdText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default HydroRecipeScreen;
