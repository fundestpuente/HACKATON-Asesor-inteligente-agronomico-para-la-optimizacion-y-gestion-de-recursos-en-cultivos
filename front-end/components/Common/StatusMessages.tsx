import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

/**
 * Componente de carga
 */
export const LoadingSpinner: React.FC<LoadingProps> = ({
  message,
  size = 'large',
  color = '#4CAF50',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Componente de error
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onDismiss && (
        <Text style={styles.dismissText} onPress={onDismiss}>
          Cerrar
        </Text>
      )}
    </View>
  );
};

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Componente de éxito
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onDismiss }) => {
  return (
    <View style={styles.successContainer}>
      <Text style={styles.successTitle}>Éxito</Text>
      <Text style={styles.successMessage}>{message}</Text>
      {onDismiss && (
        <Text style={styles.dismissText} onPress={onDismiss}>
          Cerrar
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 12,
  },
});

export default { LoadingSpinner, ErrorMessage, SuccessMessage };
