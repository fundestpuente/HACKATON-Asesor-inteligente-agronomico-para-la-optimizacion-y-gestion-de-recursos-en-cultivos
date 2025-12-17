import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getCrop, getCropPredictions, getCropHydroRecipes, getCropStats, deleteCrop, predictFertilizer } from '../../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CropDetail'>;
type RouteP = RouteProp<RootStackParamList, 'CropDetail'>;

interface Props { navigation: NavProp; route: RouteP }

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

const CropDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState<any>(null);
  const [predictingFertilizer, setPredictingFertilizer] = useState(false);
  const [fertilizerResult, setFertilizerResult] = useState<FertilizerResult | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCrop(id);
      setCrop(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo cargar el cultivo');
    } finally { setLoading(false); }
  };

  const handlePredictFertilizer = async () => {
    setPredictingFertilizer(true);
    try {
      const body = { ph: 6.5 };
      const res = await predictFertilizer(body, id);
      setFertilizerResult(res);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo hacer la predicción');
    } finally {
      setPredictingFertilizer(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirmar', '¿Eliminar este cultivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteCrop(id); Alert.alert('Eliminado'); navigation.goBack(); } catch (e:any) { Alert.alert('Error', e?.message || String(e)); }
      } }
    ]);
  };

  if (loading || !crop) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  // Si hay resultado de predicción, mostrar ese
  if (fertilizerResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setFertilizerResult(null)}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📊 Predicción de Nutrientes</Text>

        {/* Success Indicator */}
        {fertilizerResult.success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Predicción Generada Exitosamente</Text>
          </View>
        )}

        {/* Información de Predicción */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Información de Predicción</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de Predicción:</Text>
            <Text style={styles.infoValue}>{fertilizerResult.prediction_id || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guardado:</Text>
            <Text style={styles.infoValue}>
              {fertilizerResult.saved ? '✓ Sí' : '✗ No'}
            </Text>
          </View>
        </View>

        {/* Nutrientes Requeridos */}
        {fertilizerResult.nutrientes_requeridos && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🥗 Nutrientes Requeridos (kg/ha)</Text>
            <View style={styles.nutrientGrid}>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Nitrógeno (N)</Text>
                <Text style={styles.nutrientValue}>
                  {String((fertilizerResult.nutrientes_requeridos.N || 0).toFixed(2))}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Fósforo (P)</Text>
                <Text style={styles.nutrientValue}>
                  {String((fertilizerResult.nutrientes_requeridos.P || 0).toFixed(2))}
                </Text>
              </View>
              <View style={styles.nutrient}>
                <Text style={styles.nutrientLabel}>Potasio (K)</Text>
                <Text style={styles.nutrientValue}>
                  {String((fertilizerResult.nutrientes_requeridos.K || 0).toFixed(2))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Datos Climáticos */}
        {fertilizerResult.datos_clima && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡️ Condiciones Climáticas Detectadas</Text>
            <View style={styles.envGrid}>
              {fertilizerResult.datos_clima.temperature !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Temperatura</Text>
                  <Text style={styles.envValue}>
                    {String(Number(fertilizerResult.datos_clima.temperature).toFixed(1))}°C
                  </Text>
                </View>
              )}
              {fertilizerResult.datos_clima.humidity !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Humedad</Text>
                  <Text style={styles.envValue}>
                    {String(Number(fertilizerResult.datos_clima.humidity).toFixed(0))}%
                  </Text>
                </View>
              )}
              {fertilizerResult.datos_clima.rainfall !== undefined && (
                <View style={styles.envItem}>
                  <Text style={styles.envLabel}>Lluvia</Text>
                  <Text style={styles.envValue}>
                    {String(Number(fertilizerResult.datos_clima.rainfall).toFixed(1))} mm
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recomendación de Plan de Fertilización */}
        {fertilizerResult.recomendacion && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Plan de Fertilización Sugerido</Text>
            <Text style={styles.recommendationText}>
              {fertilizerResult.recomendacion}
            </Text>
          </View>
        )}

        {/* Parámetros utilizados */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Parámetros Utilizados</Text>
          {crop && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cultivo:</Text>
              <Text style={styles.infoValue}>{crop.nombre || crop.name}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>pH del agua:</Text>
            <Text style={styles.infoValue}>6.5</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { marginBottom: 32 }]}
          onPress={() => setFertilizerResult(null)}
        >
          <Text style={styles.buttonText}>Hacer otra predicción</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Vista principal del cultivo
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{crop.name}</Text>
      <Text style={styles.sub}>Tipo: {crop.crop_type}</Text>
      <Text style={styles.meta}>Área: {crop.area ?? '-'} | Estado: {crop.status}</Text>

      <View style={{ height: 12 }} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HydroRecipe', { cropId: id })}>
        <Text style={styles.buttonText}>Generar receta hidropónica</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { marginTop: 8 }]} 
        onPress={() => navigation.navigate('FertilizerPredictor', { cropId: id })}
      >
        <Text style={styles.buttonText}>Predecir nutrientes</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      <TouchableOpacity style={[styles.dangerButton]} onPress={handleDelete}><Text style={styles.dangerText}>Eliminar cultivo</Text></TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1B5E20' },
  sub: { color: '#666', marginTop: 6 },
  meta: { color: '#444', marginTop: 8 },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  dangerButton: { marginTop: 8, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E53935' },
  dangerText: { color: '#E53935', fontWeight: '700' },
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

export default CropDetailScreen;
