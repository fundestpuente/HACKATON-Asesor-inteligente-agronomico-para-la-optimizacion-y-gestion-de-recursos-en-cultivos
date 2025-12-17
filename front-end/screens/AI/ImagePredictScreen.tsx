import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useCrops } from '../../hooks/useCrops';
import { COLORS } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ImagePredict'>;
type R = RouteProp<RootStackParamList, 'ImagePredict'>;

interface Props {
  navigation: Nav;
  route: R;
}

const ImagePredictScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialCropId = route.params?.cropId;
  const { crops, fetchCrops } = useCrops();
  
  const [cropId, setCropId] = useState<number | null>(initialCropId || null);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Refrescar cultivos al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('📱 ImagePredictScreen: Componente enfocado, cargando cultivos');
      fetchCrops();
    }, [fetchCrops])
  );

  // Mostrar cultivos disponibles cuando cambian
  useEffect(() => {
    console.log('🌾 ImagePredictScreen: Cultivos disponibles:', crops.length);
    crops.forEach((crop) => {
      console.log(`   - ID ${crop.id}: ${crop.name} (${crop.crop_type})`);
    });
  }, [crops]);

  /**
   * Seleccionar imagen de la galería
   */
  const pickImage = async () => {
    try {
      console.log('🖼️ pickImage: Intentando seleccionar imagen');
      // @ts-ignore
      const ImagePicker = require('expo-image-picker');

      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🖼️ pickImage: Permiso resultado:', res.granted);
      
      if (!res.granted) {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la galería de fotos');
        return;
      }

      console.log('🖼️ pickImage: Abriendo selector de imagen');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      console.log('🖼️ pickImage: Resultado:', {
        cancelled: (result as any).cancelled,
        assetsLength: (result as any).assets?.length,
      });

      if (!result.cancelled) {
        const asset = (result as any).assets?.[0] || result;
        console.log('🖼️ pickImage: Imagen seleccionada:', {
          uri: asset.uri?.substring(0, 100),
          fileName: asset.fileName,
          filename: asset.filename,
          type: asset.type,
        });
        setImage(asset);
        setResult(null);
      } else {
        console.log('�️ pickImage: Usuario canceló la selección');
      }
    } catch (err) {
      console.error('❌ pickImage: Error -', err);
      Alert.alert(
        'Error',
        'Instala expo-image-picker: npm install expo-image-picker'
      );
    }
  };

  /**
   * Tomar foto con cámara
   */
  const takePhoto = async () => {
    try {
      // @ts-ignore
      const ImagePicker = require('expo-image-picker');

      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (!res.granted) {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.cancelled) {
        const asset = (result as any).assets?.[0] || result;
        setImage(asset);
        setResult(null);
        console.log('📷 ImagePredictScreen: Foto tomada', asset.uri);
      }
    } catch (err) {
      console.error('❌ ImagePredictScreen: Error tomando foto -', err);
      Alert.alert('Error', 'No se pudo usar la cámara');
    }
  };

  /**
   * Enviar imagen para predicción (MOCK)
   */
  const handlePredict = async () => {
    console.log('🤖 handlePredict: Iniciado (MOCK)');
    
    if (!cropId) {
      console.log('❌ handlePredict: No hay crop_id seleccionado');
      Alert.alert('Error', 'Selecciona un cultivo primero');
      return;
    }

    if (!image) {
      console.log('❌ handlePredict: No hay imagen seleccionada');
      Alert.alert('Error', 'Selecciona una imagen primero');
      return;
    }

    setPredicting(true);
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock: Generar predicción aleatoria
      const isHealthy = Math.random() > 0.5;
      const status = isHealthy ? 'Planta Saludable' : 'Planta Enferma';
      const confidence = Math.floor(Math.random() * (99 - 75) + 75); // 75-99%

      const mockResponse = {
        prediction_id: `mock_${Date.now()}`,
        status: status,
        confidence: confidence,
        crop_id: cropId,
        timestamp: new Date().toISOString(),
      };

      console.log('');
      console.log('='.repeat(60));
      console.log('🤖 handlePredict: PREDICCIÓN MOCK COMPLETADA');
      console.log('='.repeat(60));
      console.log('');
      console.log('📋 RESULTADO:');
      console.log('   Estado:', status);
      console.log('   Confianza:', `${confidence}%`);
      console.log('   Cultivo ID:', cropId);
      console.log('');

      setResult(mockResponse);

      // Mostrar resultado
      Alert.alert(
        '✅ Predicción Completada',
        `${status}\nConfianza: ${confidence}%`
      );
    } catch (error: any) {
      console.error('');
      console.error('❌ handlePredict: Error en predicción');
      console.error('   Error:', error);
      
      const errorMsg =
        error?.response?.data?.detail ||
        error?.message ||
        error?.toString?.() ||
        'Error al procesar la imagen';
      
      console.error('   Mensaje final:', errorMsg);
      console.error('='.repeat(60));
      
      Alert.alert('Error', errorMsg);
    } finally {
      setPredicting(false);
    }
  };

  /**
   * Limpiar selección
   */
  const clearImage = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sección de selección de cultivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona tu cultivo</Text>
          
          {cropId && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>✓ Cultivo seleccionado: ID {cropId}</Text>
            </View>
          )}

          {crops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌾</Text>
              <Text style={styles.emptyText}>No tienes cultivos creados</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CropForm')}
              >
                <Text style={styles.createButtonText}>+ Crear cultivo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={crops}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cropOption,
                    cropId === item.id && styles.cropOptionSelected,
                  ]}
                  onPress={() => {
                    console.log('🌾 Cultivo seleccionado:', item.id, '-', item.name);
                    setCropId(item.id);
                  }}
                >
                  <View style={styles.cropOptionContent}>
                    <Text
                      style={[
                        styles.cropOptionName,
                        cropId === item.id && styles.cropOptionNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.cropOptionType}>
                      {item.crop_type} (ID: {item.id})
                    </Text>
                  </View>
                  {cropId === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Cargando cultivos...</Text>
              }
            />
          )}
        </View>

        {/* Sección de selección de imagen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Selecciona una imagen</Text>

          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={pickImage}
              disabled={predicting}
            >
              <Text style={styles.actionIcon}>🖼️</Text>
              <Text style={styles.actionText}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
              disabled={predicting}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Cámara</Text>
            </TouchableOpacity>
          </View>

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearImage}
                disabled={predicting}
              >
                <Text style={styles.clearButtonText}>Cambiar imagen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sección de predicción */}
        {image && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.predictButton, predicting && styles.buttonDisabled]}
              onPress={handlePredict}
              disabled={!cropId || !image || predicting}
            >
              {predicting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.predictButtonText}>🤖 Analizar imagen</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Resultado */}
        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>🤖 Análisis de IA completado</Text>

            {/* Visualización de predicción */}
            <View style={styles.predictionVisualization}>
              <View style={[
                styles.statusIndicator,
                {
                  backgroundColor: (result.status === 'Planta Saludable' || result.data?.class === 'Healthy') ? '#4CAF50' : '#FF9800'
                }
              ]}>
                <Text style={styles.statusEmoji}>
                  {(result.status === 'Planta Saludable' || result.data?.class === 'Healthy') ? '✓' : '!'}
                </Text>
              </View>
              <View style={styles.predictionTextContainer}>
                <Text style={styles.predictionStatus}>
                  {result.status || result.data?.class || 'Análisis completado'}
                </Text>
                <Text style={styles.predictionConfidence}>
                  Confianza: {result.confidence || result.data?.confidence || '0'}%
                </Text>
              </View>
            </View>

            <View style={styles.resultCard}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>🔍 Clasificación:</Text>
                <Text style={styles.resultValue}>{result.status || result.data?.class || 'N/A'}</Text>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>📊 Nivel de confianza:</Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceBarFill,
                      {
                        width: `${(result.confidence || result.data?.confidence || 0)}%`,
                        backgroundColor: (result.confidence || result.data?.confidence || 0) > 70 ? '#4CAF50' : '#FF9800'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.confidencePercentage}>{result.confidence || result.data?.confidence || 0}%</Text>
              </View>

              {result.prediction_id && (
                <>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>🔑 ID de predicción:</Text>
                    <Text style={styles.resultValue}>#{result.prediction_id}</Text>
                  </View>
                </>
              )}
            </View>

            {(result.status || result.data?.class) && (
              <TouchableOpacity
                style={styles.recommendationButton}
                onPress={() => {
                  const estado = result.status || 'Desconocido';
                  const recomendacion = result.status === 'Planta Saludable' 
                    ? 'Tu planta está saludable. Mantén el riego regular y la exposición al sol adecuada.'
                    : 'Tu planta podría estar enferma. Considera aumentar el riego, mejorar el drenaje o consultar a un especialista.';
                  Alert.alert(
                    'Recomendaciones',
                    recomendacion
                  );
                }}
              >
                <Text style={styles.recommendationButtonText}>
                  💡 Ver recomendaciones
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  cropOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f1f8f5',
  },
  cropOptionContent: {
    flex: 1,
  },
  cropOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cropOptionNameSelected: {
    color: COLORS.primary,
  },
  cropOptionType: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  galleryButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  cameraButton: {
    backgroundColor: '#fce4ec',
    borderWidth: 2,
    borderColor: '#c2185b',
  },
  actionIcon: {
    fontSize: 32,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  imagePreviewContainer: {
    marginTop: 16,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  clearButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  predictButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  predictButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resultSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#f1f8f5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resultItem: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  predictionVisualization: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  predictionConfidence: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidencePercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  recommendationButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recommendationButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default ImagePredictScreen;
