import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Crop } from '../../types';
import { COLORS } from '../../constants/colors';

interface CropCardProps {
  crop: Crop;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Tarjeta que muestra información básica de un cultivo
 */
const CropCard: React.FC<CropCardProps> = ({ crop, onView, onEdit, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cultivo',
      `¿Estás seguro de que deseas eliminar "${crop.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  // Determinar color según estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'harvested':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  // Traducciones de estado
  const getStatusText = (status: string) => {
    const translations: Record<string, string> = {
      active: 'Activo',
      harvested: 'Cosechado',
      failed: 'Fallido',
    };
    return translations[status.toLowerCase()] || status;
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con nombre y estado */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>🌾 {crop.name || 'Sin nombre'}</Text>
          <Text style={styles.type}>{crop.crop_type || 'Sin tipo'}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(crop.status || 'active') },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(crop.status || 'active')}</Text>
        </View>
      </View>

      {/* Información del cultivo */}
      <View style={styles.infoSection}>
        {crop.area ? (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Área:</Text>
            <Text style={styles.infoValue}>{crop.area} m²</Text>
          </View>
        ) : null}

        {crop.location_lat !== undefined && crop.location_long !== undefined ? (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>
              {crop.location_lat.toFixed(2)}° / {crop.location_long.toFixed(2)}°
            </Text>
          </View>
        ) : null}

        {crop.created_at ? (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Creado:</Text>
            <Text style={styles.infoValue}>
              {new Date(crop.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
        ) : null}
        
        {!crop.area && (crop.location_lat === undefined || crop.location_long === undefined) && !crop.created_at ? (
          <Text style={styles.infoLabel}>Sin información adicional</Text>
        ) : null}
      </View>

      {/* Botones de acción */}
      {(onView || onEdit || onDelete) ? (
        <View style={styles.actionButtons}>
          {onView ? (
            <TouchableOpacity style={styles.button} onPress={onView}>
              <Text style={[styles.buttonText, styles.primaryText]}>Ver</Text>
            </TouchableOpacity>
          ) : null}

          {onEdit ? (
            <TouchableOpacity style={styles.button} onPress={onEdit}>
              <Text style={[styles.buttonText, styles.primaryText]}>Editar</Text>
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity style={styles.button} onPress={handleDelete}>
              <Text style={[styles.buttonText, styles.dangerText]}>Eliminar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  type: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: '#F44336',
  },
});

export default CropCard;
