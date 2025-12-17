import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { COLORS } from '../constants/colors';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const [textIndex, setTextIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const texts = [
    'Your AI and satellite-powered field advisor',
    'Tu asesor de campo impulsado por IA y satélite',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Cambiar texto
        setTextIndex((prev) => (prev === 0 ? 1 : 0));
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 3500); // Cambiar cada 3.5 segundos

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const handleGetStarted = () => {
    // Animación de escala al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Welcome');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icono de agricultura */}
        <Image
          source={require('../assets/agricultura.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        {/* Nombre de la app */}
        <Text style={styles.appName}>AgroMind</Text>

        {/* Texto animado con transición */}
        <Animated.View style={[styles.subtitleContainer, { opacity: fadeAnim }]}>
          <Text style={styles.subtitle}>{texts[textIndex]}</Text>
        </Animated.View>

        {/* Botón Comenzar */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 44,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 12,
    letterSpacing: -0.5,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitleContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Montserrat_500Medium',
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_700Bold',
  },
});

export default SplashScreen;
