import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import CropCard from '../../components/Common/CropCard';
import { useCrops } from '../../hooks/useCrops';
import { COLORS } from '../../constants/colors';

type CropsListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CropsList'>;

interface Props {
  navigation: CropsListNavigationProp;
}

/**
 * Pantalla para listar todos los cultivos del usuario
 */
const CropsListScreen: React.FC<Props> = ({ navigation }) => {
  const {
    crops,
    loading,
    error,
    refreshing,
    fetchCrops,
    deleteCrop,
    onRefresh,
  } = useCrops();

  /**
   * Recargar cultivos cuando la pantalla está enfocada
   */
  useFocusEffect(
    useCallback(() => {
      console.log('👁️ CropsListScreen: Pantalla enfocada, recargando cultivos');
      fetchCrops();
    }, [fetchCrops])
  );

  /**
   * Manejar eliminación de cultivo
   */
  const handleDeleteCrop = useCallback(
    async (cropId: number) => {
      const result = await deleteCrop(cropId);
      if (result.success) {
        console.log('✅ CropsListScreen: Cultivo eliminado correctamente');
      }
    },
    [deleteCrop]
  );

  /**
   * Render vacío
   */
  const renderEmpty = () => {
    if (loading && crops.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando cultivos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCrops}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📭 No tienes cultivos</Text>
        <Text style={styles.emptySubtext}>
          Crea tu primer cultivo para comenzar
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CropForm')}
        >
          <Text style={styles.createButtonText}>+ Crear Cultivo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render encabezado con botón crear
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Mis Cultivos</Text>
        <Text style={styles.headerSubtitle}>
          {crops.length} cultivo{crops.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.createHeaderButton}
        onPress={() => navigation.navigate('CropForm')}
      >
        <Text style={styles.createHeaderButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={crops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CropCard
            crop={item}
            onView={() => navigation.navigate('CropDetail', { id: item.id })}
            onEdit={() => navigation.navigate('CropForm', { id: item.id })}
            onDelete={() => handleDeleteCrop(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={
          crops.length === 0 ? styles.emptyListContent : undefined
        }
        scrollIndicatorInsets={{ right: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  createHeaderButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createHeaderButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default CropsListScreen;
