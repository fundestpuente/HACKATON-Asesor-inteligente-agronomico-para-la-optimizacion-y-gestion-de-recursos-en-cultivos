import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AIVisualizationProps {
  title: string;
  icon: string;
  description: string;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

/**
 * Componente de visualización para análisis de IA
 * Muestra un card atractivo con gradiente para representar resultados de IA
 */
const AIVisualization: React.FC<AIVisualizationProps> = ({
  title,
  icon,
  description,
  color = 'purple',
}) => {
  const colorMap: Record<string, [string, string]> = {
    purple: ['#667eea', '#764ba2'],
    blue: ['#4CAF50', '#66BB6A'],
    green: ['#4CAF50', '#81C784'],
    orange: ['#FF9800', '#FFB74D'],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colorMap[color]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  icon: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  description: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default AIVisualization;
