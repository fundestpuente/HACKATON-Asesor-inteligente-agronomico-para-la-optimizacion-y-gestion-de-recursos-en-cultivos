import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../hooks/useAuth';
import { useCrops } from '../hooks/useCrops';
import { COLORS } from '../constants/colors';
import CropCard from '../components/Common/CropCard';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { crops, loading: cropsLoading, fetchCrops } = useCrops();

  // Refrescar cultivos cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      fetchCrops();
    }, [fetchCrops])
  );

  const handleLogout = () => {
    signOut();
  };

  return (
    <View style={styles.container}>
      {/* Header con saludo y botón logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.username}!</Text>
          <Text style={styles.subtitle}>Gestiona tus cultivos inteligentemente</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('CropsList')}
            >
              <Text style={styles.quickActionIcon}>🌾</Text>
              <Text style={styles.quickActionText}>Mis Cultivos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('HydroRecipe')}
            >
              <Text style={styles.quickActionIcon}>💧</Text>
              <Text style={styles.quickActionText}>Recetas Hidro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('FertilizerPredictor')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Predicciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de Cultivos Recientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Cultivos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CropsList')}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {cropsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : crops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No tienes cultivos aún</Text>
              <Text style={styles.emptyText}>
                Crea tu primer cultivo para comenzar
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CropForm')}
              >
                <Text style={styles.createButtonText}>+ Crear Cultivo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={crops}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <CropCard
                  crop={item}
                  onView={() => navigation.navigate('CropDetail', { id: item.id })}
                  onEdit={() => navigation.navigate('CropForm', { id: item.id })}
                  onDelete={() => fetchCrops()}
                />
              )}
            />
          )}
        </View>

        {/* Sección de Información */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Tip del día</Text>
          <Text style={styles.infoText}>
            Mantén un registro regular del pH de tu suelo para optimizar la absorción de nutrientes en tus cultivos.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
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
  infoSection: {
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});

export default HomeScreen;
