import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import AIVisualization from '../components/AI/AIVisualization';

const { width } = Dimensions.get('window');

type ResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cropName, ph, latitude, longitude, nutrientes, clima, recomendacion } = route.params;

  // Asegurar que recomendacion es siempre un string válido
  const recomendacionText = typeof recomendacion === 'string' 
    ? recomendacion 
    : 'Sin recomendaciones disponibles';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recomendación IA</Text>
        <Text style={styles.headerSubtitle}>{cropName}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Visualización de IA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Análisis de IA</Text>
          <AIVisualization
            title="Sistema de IA"
            icon="🔬"
            description="Análisis avanzado completado"
            color="purple"
          />
          <View style={styles.aiStatusBadges}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✓</Text>
              <Text style={styles.statusLabel}>Suelo analizado</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✓</Text>
              <Text style={styles.statusLabel}>Clima validado</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✓</Text>
              <Text style={styles.statusLabel}>Nutrientes calculados</Text>
            </View>
          </View>
        </View>

        {/* Datos de entrada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Datos de entrada</Text>
          <View style={styles.card}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>pH del suelo:</Text>
              <Text style={styles.dataValue}>{ph.toFixed(1)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Ubicación:</Text>
              <Text style={styles.dataValueSmall}>
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </Text>
            </View>
          </View>
        </View>

        {/* Datos climáticos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ Datos climáticos</Text>
          <View style={styles.card}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🌡️ Temperatura:</Text>
              <Text style={styles.dataValue}>{clima.temperature}°C</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>💧 Humedad:</Text>
              <Text style={styles.dataValue}>{clima.humidity}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🌧️ Precipitación:</Text>
              <Text style={styles.dataValue}>{clima.rainfall} mm</Text>
            </View>
          </View>
        </View>

        {/* Nutrientes requeridos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 Nutrientes requeridos (kg/ha)</Text>
          <View style={styles.nutrientsContainer}>
            <View style={styles.nutrientCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.nutrientGradient}
              >
                <Text style={styles.nutrientSymbol}>N</Text>
                <Text style={styles.nutrientValue}>{nutrientes.N.toFixed(1)}</Text>
                <Text style={styles.nutrientLabel}>Nitrógeno</Text>
              </LinearGradient>
            </View>

            <View style={styles.nutrientCard}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.nutrientGradient}
              >
                <Text style={styles.nutrientSymbol}>P</Text>
                <Text style={styles.nutrientValue}>{nutrientes.P.toFixed(1)}</Text>
                <Text style={styles.nutrientLabel}>Fósforo</Text>
              </LinearGradient>
            </View>

            <View style={styles.nutrientCard}>
              <LinearGradient
                colors={['#2196F3', '#42A5F5']}
                style={styles.nutrientGradient}
              >
                <Text style={styles.nutrientSymbol}>K</Text>
                <Text style={styles.nutrientValue}>{nutrientes.K.toFixed(1)}</Text>
                <Text style={styles.nutrientLabel}>Potasio</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Recomendación detallada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Plan de fertilización</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>{recomendacionText}</Text>
          </View>
        </View>

        {/* Espacio adicional */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButtonWrapper}
          onPress={() => navigation.navigate('CropSelection')}
          activeOpacity={0.85}
        >
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Nuevo análisis</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButtonWrapper}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Ir al inicio</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Montserrat_700Bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: '#546E7A',
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1B5E20',
  },
  dataValueSmall: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  nutrientCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nutrientGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  nutrientSymbol: {
    fontSize: 32,
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#2C3E50',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButtonWrapper: {
    flex: 1,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#4CAF50',
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  aiStatusBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  statusBadge: {
    flex: 1,
    backgroundColor: '#F0F8F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusBadgeText: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: '#1B5E20',
    textAlign: 'center',
  },
});

export default ResultScreen;
