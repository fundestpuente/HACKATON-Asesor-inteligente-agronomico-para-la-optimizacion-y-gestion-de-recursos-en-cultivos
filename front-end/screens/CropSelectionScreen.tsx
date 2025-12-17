import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { CROPS, CROP_NAMES, CROP_IMAGES, Crop } from '../constants/crops';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

type CropSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CropSelection'
>;

interface Props {
  navigation: CropSelectionScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48 - 16) / 3; // 3 items per row with spacing

const CropSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const handleNext = () => {
    if (!selectedCrop) {
      Alert.alert('Selección requerida', 'Por favor selecciona un cultivo');
      return;
    }
    navigation.navigate('DataInput', { crop: selectedCrop });
  };

  const renderCropItem = ({ item }: { item: Crop }) => {
    const isSelected = selectedCrop === item;

    return (
      <TouchableOpacity
        style={[styles.cropCard, isSelected && styles.cropCardSelected]}
        onPress={() => setSelectedCrop(item)}
        activeOpacity={0.8}
      >
        {/* Imagen del cultivo */}
        <View style={styles.imageContainer}>
          <Image
            source={CROP_IMAGES[item]}
            style={styles.cropImage}
            resizeMode="cover"
          />
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Nombre del cultivo */}
        <View style={styles.cropInfo}>
          <Text style={styles.cropName} numberOfLines={2}>
            {CROP_NAMES[item]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con título */}
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu cultivo</Text>
        <Text style={styles.subtitle}>Elige el tipo de cultivo que deseas analizar</Text>
      </View>

      {/* Grid de cultivos - 3 por fila */}
      <FlatList
        data={CROPS}
        renderItem={renderCropItem}
        keyExtractor={(item) => item}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {/* Botón Siguiente */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!selectedCrop}
        >
          <LinearGradient
            colors={selectedCrop ? ['#4CAF50', '#66BB6A'] : ['#BDBDBD', '#9E9E9E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Siguiente</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFEF5',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1B5E20',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#66BB6A',
    fontFamily: 'Montserrat_400Regular',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cropCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  cropCardSelected: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH - 20,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cropInfo: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonWrapper: {
    width: '100%',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default CropSelectionScreen;
