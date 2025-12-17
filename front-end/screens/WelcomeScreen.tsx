import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { COLORS } from '../constants/colors';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../assets/agricultura.png')} style={styles.icon} resizeMode="contain" />
        <Text style={styles.appName}>AgroMind</Text>
        <Text style={styles.subtitle}>Asesor Inteligente para tu Cultivo</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonTextPrimary}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonTextSecondary}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  buttonPrimary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  buttonTextPrimary: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  buttonTextSecondary: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});

export default WelcomeScreen;
