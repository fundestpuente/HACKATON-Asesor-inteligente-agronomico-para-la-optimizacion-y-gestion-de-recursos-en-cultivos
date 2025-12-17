import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { createCrop, getCrop, updateCrop } from '../../services/api';
import { COLORS } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CropForm'>;
type R = RouteProp<RootStackParamList, 'CropForm'>;

interface Props {
  navigation: Nav;
  route: R;
}

const CROP_TYPES = [
  { id: 'algodon', label: 'Algodón', image: require('../../assets/images/crops/algodon.jpg') },
  { id: 'cafe', label: 'Café', image: require('../../assets/images/crops/cafe.jpg') },
  { id: 'coco', label: 'Coco', image: require('../../assets/images/crops/coco.jpg') },
  { id: 'frijol_negro', label: 'Frijol Negro', image: require('../../assets/images/crops/frijol_negro.jpg') },
  { id: 'frijol_rojo', label: 'Frijol Rojo', image: require('../../assets/images/crops/frijol_rojo.jpg') },
  { id: 'garbanzo', label: 'Garbanzo', image: require('../../assets/images/crops/garbanzo.jpg') },
  { id: 'lenteja', label: 'Lenteja', image: require('../../assets/images/crops/lenteja.jpg') },
  { id: 'maiz', label: 'Maíz', image: require('../../assets/images/crops/maiz.jpg') },
  { id: 'mango', label: 'Mango', image: require('../../assets/images/crops/mango.jpg') },
  { id: 'manzana', label: 'Manzana', image: require('../../assets/images/crops/manzana.jpg') },
  { id: 'platano', label: 'Plátano', image: require('../../assets/images/crops/platano.jpg') },
  { id: 'uvas', label: 'Uvas', image: require('../../assets/images/crops/uvas.jpg') },
  { id: 'yute', label: 'Yute', image: require('../../assets/images/crops/yute.jpg') },
];

const CULTIVATION_TYPES = [
  { id: 'hydroponic', label: 'Hidropónico', icon: '💧', color: '#0288D1' },
  { id: 'greenhouse', label: 'Invernadero', icon: '🏠', color: '#558B2F' },
  { id: 'field', label: 'Campo', icon: '🌾', color: '#E65100' },
];

// Teoría de colores para el tema agrotech
const THEME = {
  // Primario: Verde agricultural profesional
  primary: '#2E7D32',           // Verde principal
  primaryLight: '#66BB6A',      // Verde claro (hover)
  primaryLighter: '#C8E6C9',    // Verde muy claro (background)
  primaryDark: '#1B5E20',       // Verde oscuro (texto enfásis)

  // Secundario: Azul tierra/agua
  secondary: '#0288D1',         // Azul cielo/agua
  secondaryLight: '#4FC3F7',    // Azul claro
  secondaryLighter: '#B3E5FC',  // Azul muy claro

  // Acento: Naranja solar (energía)
  accent: '#F57C00',            // Naranja
  accentLight: '#FFB74D',       // Naranja claro

  // Neutrales
  white: '#FFFFFF',
  background: '#F5F7FA',        // Gris muy claro (fondo app)
  surface: '#FFFFFF',           // Blanco (tarjetas)
  surfaceLight: '#F9FAFC',      // Gris ultra claro
  
  // Texto
  textPrimary: '#212121',       // Gris oscuro
  textSecondary: '#616161',     // Gris medio
  textTertiary: '#9E9E9E',      // Gris claro

  // Estado
  success: '#2E7D32',           // Verde
  warning: '#F57F17',           // Naranja
  error: '#C62828',             // Rojo
  disabled: '#BDBDBD',          // Gris deshabilitado

  // Bordes
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;  // Para 3 columnas con padding

const CropFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const cropId = (route.params as any)?.id;
  const isEditMode = !!cropId;

  const [name, setName] = useState('');
  const [cultivationType, setCultivationType] = useState('hydroponic');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCropImagePicker, setShowCropImagePicker] = useState(false);
  const [showCultivationTypePicker, setShowCultivationTypePicker] = useState(false);

  /**
   * Cargar datos del cultivo si estamos editando
   */
  useEffect(() => {
    if (isEditMode) {
      loadCropData();
    }
  }, [cropId, isEditMode]);

  const loadCropData = async () => {
    try {
      setInitialLoading(true);
      console.log('🌾 CropFormScreen: Cargando cultivo', cropId);

      const data = await getCrop(cropId);
      setName(data.name);
      setCultivationType(data.crop_type);
      if (data.area) setArea(String(data.area));
      if (data.location_lat) setLatitude(data.location_lat);
      if (data.location_long) setLongitude(data.location_long);
      if (data.planting_date) setPlantingDate(data.planting_date);
      if (data.notes) setNotes(data.notes);

      console.log('✅ CropFormScreen: Cultivo cargado');
    } catch (err: any) {
      console.error('❌ CropFormScreen: Error cargando -', err);
      Alert.alert('Error', 'No se pudo cargar el cultivo');
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!cultivationType) {
      newErrors.cultivationType = 'Selecciona un tipo de cultivo';
    }

    if (area && isNaN(parseFloat(area))) {
      newErrors.area = 'El área debe ser un número válido';
    }

    if (!plantingDate) {
      newErrors.plantingDate = 'La fecha de plantación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, cultivationType, area, plantingDate]);

  /**
   * Obtener ubicación con GPS
   */
  const handleGetLocation = async () => {
    try {
      console.log('📍 CropFormScreen: Solicitando permiso de ubicación');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación');
        return;
      }

      setLoading(true);
      console.log('📍 CropFormScreen: Obteniendo coordenadas...');

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      console.log('✅ CropFormScreen: Ubicación obtenida');
      Alert.alert(
        'Ubicación obtenida',
        `Lat: ${location.coords.latitude.toFixed(4)}\nLng: ${location.coords.longitude.toFixed(4)}`
      );
    } catch (error: any) {
      console.error('❌ CropFormScreen: Error obteniendo ubicación -', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guardar cultivo
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        crop_type: cultivationType,
        planting_date: plantingDate,
      };

      if (area) {
        payload.area = parseFloat(area);
      }
      if (latitude && longitude) {
        payload.location_lat = latitude;
        payload.location_long = longitude;
      }
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      console.log('🌾 CropFormScreen: Payload a enviar:', JSON.stringify(payload, null, 2));

      if (isEditMode) {
        console.log('🌾 CropFormScreen: Actualizando cultivo', cropId);
        await updateCrop(cropId, payload);
        console.log('✅ CropFormScreen: Cultivo actualizado');
        Alert.alert('Éxito', 'Cultivo actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        console.log('🌾 CropFormScreen: Creando cultivo');
        await createCrop(payload);
        console.log('✅ CropFormScreen: Cultivo creado');
        Alert.alert('Éxito', 'Cultivo creado correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
          },
        ]);
      }
    } catch (err: any) {
      console.error('❌ CropFormScreen: Error guardando -', err);
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Error al guardar el cultivo';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: THEME.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Cargando cultivo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: THEME.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER MEJORADO */}
        <View style={styles.headerSection}>
          <View style={styles.headerGradient}>
            <Text style={styles.headerIcon}>
              {isEditMode ? '✏️' : '🌱'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Editar Cultivo' : 'Nuevo Cultivo'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode ? 'Actualiza la información de tu cultivo' : 'Registra un nuevo cultivo en tu granja'}
              </Text>
            </View>
          </View>
          
          {/* Progress indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressNumber}>Paso 1</Text>
              <Text style={styles.progressSeparator}> de </Text>
              <Text style={styles.progressNumber}>2</Text>
            </Text>
          </View>
        </View>

        {/* SECCIÓN 1: NOMBRE DEL CULTIVO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nombre del Cultivo</Text>
            <Text style={styles.sectionDescription}>Personaliza el nombre para identificarlo fácilmente</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputBox, errors.name && styles.inputBoxError]}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Papa Royal, Tomate Premium..."
                placeholderTextColor={THEME.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                editable={!loading}
              />
            </View>
            {errors.name && (
              <Text style={styles.errorMessage}>
                <Text style={styles.errorIcon}>⚠️ </Text>
                {errors.name}
              </Text>
            )}
          </View>
        </View>

        {/* SECCIÓN 2: TIPO DE SIEMBRA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Método de Cultivo</Text>
            <Text style={styles.sectionDescription}>Elige cómo deseas cultivar</Text>
          </View>

          <View style={styles.cultivationGrid}>
            {CULTIVATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                activeOpacity={0.7}
                style={[
                  styles.cultivationOption,
                  cultivationType === type.id && styles.cultivationOptionActive,
                ]}
                onPress={() => {
                  setCultivationType(type.id);
                  if (errors.cultivationType) setErrors({ ...errors, cultivationType: '' });
                }}
                disabled={loading}
              >
                <Text style={styles.cultivationIcon}>{type.icon}</Text>
                <Text style={[
                  styles.cultivationLabel,
                  cultivationType === type.id && styles.cultivationLabelActive,
                ]}>
                  {type.label}
                </Text>
                {cultivationType === type.id && (
                  <View style={styles.cultivationCheckmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {errors.cultivationType && (
            <Text style={styles.errorMessage}>
              <Text style={styles.errorIcon}>⚠️ </Text>
              {errors.cultivationType}
            </Text>
          )}
        </View>

        {/* SECCIÓN 4: ÁREA DE CULTIVO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Área de Cultivo</Text>
            <Text style={styles.sectionDescription}>Especifica el tamaño de tu terreno</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputBox, errors.area && styles.inputBoxError]}>
              <Text style={styles.inputIcon}>📐</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 50"
                placeholderTextColor={THEME.textTertiary}
                value={area}
                onChangeText={(text) => {
                  setArea(text);
                  if (errors.area) setErrors({ ...errors, area: '' });
                }}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <Text style={styles.inputSuffix}>m²</Text>
            </View>
            {errors.area && (
              <Text style={styles.errorMessage}>
                <Text style={styles.errorIcon}>⚠️ </Text>
                {errors.area}
              </Text>
            )}
            <Text style={styles.helperText}>
              💡 Rango recomendado: 10 - 1000 m²
            </Text>
          </View>
        </View>

        {/* SECCIÓN 5: UBICACIÓN GPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ubicación GPS</Text>
            <Text style={styles.sectionDescription}>Localiza tu cultivo en el mapa</Text>
          </View>

          {latitude && longitude ? (
            <View style={styles.locationDisplayCard}>
              <View style={styles.locationDisplayIcon}>
                <Text style={styles.locationIconText}>�</Text>
              </View>
              <View style={styles.locationDisplayInfo}>
                <Text style={styles.locationDisplayCoord}>
                  {latitude.toFixed(4)}° N, {Math.abs(longitude).toFixed(4)}° E
                </Text>
                <Text style={styles.locationDisplayStatus}>
                  Ubicación capturada
                </Text>
              </View>
              <TouchableOpacity
                style={styles.locationChangeButton}
                onPress={() => {
                  setLatitude(null);
                  setLongitude(null);
                }}
                disabled={loading}
              >
                <Text style={styles.locationChangeText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.gpsActionButton,
                loading && styles.gpsActionButtonDisabled,
              ]}
              onPress={handleGetLocation}
              disabled={loading}
            >
              <Text style={styles.gpsActionIcon}>
                {loading ? '⏳' : '📍'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsActionTitle}>
                  {loading ? 'Obteniendo ubicación...' : 'Usar ubicación actual'}
                </Text>
                <Text style={styles.gpsActionSubtitle}>
                  Activa GPS para precisión mejorada
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* SECCIÓN 6: NOTAS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notas Adicionales</Text>
            <Text style={styles.sectionDescription}>Información extra sobre tu cultivo</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.textAreaBox, errors.notes && styles.inputBoxError]}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ej: Variedad especial, condiciones particulares..."
                placeholderTextColor={THEME.textTertiary}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={(text) => {
                  setNotes(text);
                  if (errors.notes) setErrors({ ...errors, notes: '' });
                }}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.helperText}>
              💡 Información que te ayudará a recordar detalles del cultivo
            </Text>
          </View>
        </View>

        {/* SECCIÓN 7: ACCIONES */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>← Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.white} size="small" />
            ) : (
              <Text style={styles.buttonPrimaryText}>
                {isEditMode ? '✓ Guardar cambios' : '✓ Crear cultivo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// ESTILOS CON TEORÍA DE COLORES PROFESIONAL
// ============================================
const styles = StyleSheet.create({
  // CONTENEDORES BASE
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // HEADER MEJORADO
  headerSection: {
    marginBottom: 24,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: `${THEME.primary}08`,
  },
  headerIcon: {
    fontSize: 40,
    marginRight: 16,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.primaryDark,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  progressBar: {
    height: 6,
    backgroundColor: THEME.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  progressNumber: {
    fontWeight: '700',
    color: THEME.primary,
  },
  progressSeparator: {
    color: THEME.textTertiary,
  },

  // SECCIONES
  section: {
    marginBottom: 24,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.primaryDark,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },

  // INPUTS
  inputContainer: {
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputBoxError: {
    borderColor: THEME.error,
    backgroundColor: `${THEME.error}08`,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textPrimary,
    padding: 0,
  },
  inputSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textTertiary,
    marginLeft: 8,
  },
  textAreaBox: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textPrimary,
    padding: 0,
    minHeight: 80,
  },

  // CULTIVOS (MÉTODO DE SIEMBRA)
  cultivationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cultivationOption: {
    flex: 1,
    backgroundColor: THEME.surfaceLight,
    borderWidth: 2,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cultivationOptionActive: {
    borderColor: THEME.primary,
    borderWidth: 3,
    backgroundColor: `${THEME.primaryLight}12`,
    shadowColor: THEME.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cultivationIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cultivationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
  },
  cultivationLabelActive: {
    color: THEME.primary,
    fontWeight: '800',
  },
  cultivationCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkText: {
    color: THEME.white,
    fontWeight: '800',
    fontSize: 13,
  },

  // UBICACIÓN GPS
  locationDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME.secondary}08`,
    borderWidth: 2,
    borderColor: THEME.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  locationDisplayIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${THEME.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationIconText: {
    fontSize: 22,
  },
  locationDisplayInfo: {
    flex: 1,
  },
  locationDisplayCoord: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primaryDark,
    letterSpacing: -0.3,
  },
  locationDisplayStatus: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  locationChangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.borderLight,
  },
  locationChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },
  gpsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME.secondary}12`,
    borderWidth: 2,
    borderColor: THEME.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  gpsActionButtonDisabled: {
    opacity: 0.6,
  },
  gpsActionIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  gpsActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primaryDark,
  },
  gpsActionSubtitle: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // ERRORES Y AYUDA
  errorMessage: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.error,
    marginTop: 6,
    lineHeight: 16,
  },
  errorIcon: {
    fontWeight: '800',
    marginRight: 2,
  },
  helperText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // BOTONES DE ACCIÓN
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: THEME.white,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.white,
    letterSpacing: -0.3,
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: -0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // UTILITY
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
});

export default CropFormScreen;
