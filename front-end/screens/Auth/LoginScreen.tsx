import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { LoginRequest } from '../../types';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginNavigationProp;
}

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, isLoading, error, clearError } = useAuth();

  /**
   * Validar formulario
   */
  const validateLogin = (values: LoginFormValues) => {
    const errors: Record<string, string> = {};

    if (!values.username.trim()) {
      errors.username = 'El usuario es requerido';
    }

    if (!values.password) {
      errors.password = 'La contraseña es requerida';
    } else if (values.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return errors;
  };

  /**
   * Manejar envío del formulario
   */
  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      console.log('🔐 LoginScreen: Iniciando login con', values.username);
      await signIn({
        username: values.username.trim(),
        password: values.password,
      });
      console.log('✅ LoginScreen: Login completado exitosamente');
      // La navegación se manejará automáticamente por el contexto/navegador
    } catch (error: any) {
      console.error('❌ LoginScreen: Error en login -', error?.message || error);
      // El error ya se muestra en el contexto
    }
  };

  const form = useForm<LoginFormValues>(
    { username: '', password: '' },
    handleLoginSubmit,
    validateLogin
  );

  /**
   * Mostrar error de autenticación
   */
  useEffect(() => {
    if (error) {
      Alert.alert('Error de iniciar sesión', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const isFormValid = form.values.username.trim() !== '' && form.values.password !== '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AgroMind IA</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
        {/* Usuario */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.username ? styles.inputError : undefined,
              ]}
              placeholder="nombre_usuario"
              placeholderTextColor="#999"
              value={form.values.username}
              onChangeText={(value) => form.handleChange('username', value)}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {form.errors.username && (
              <Text style={styles.errorText}>{form.errors.username}</Text>
            )}
          </View>

          {/* Contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.password ? styles.inputError : undefined,
              ]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#999"
              value={form.values.password}
              onChangeText={(value) => form.handleChange('password', value)}
              secureTextEntry
              editable={!isLoading}
            />
            {form.errors.password && (
              <Text style={styles.errorText}>{form.errors.password}</Text>
            )}
          </View>

          {/* Error general del formulario */}
          {form.submitError && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{form.submitError}</Text>
            </View>
          )}

          {/* Botón de login */}
          <TouchableOpacity
            style={[
              styles.button,
              (!isFormValid || isLoading) && styles.buttonDisabled,
            ]}
            onPress={form.handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Link a registro */}
          <TouchableOpacity
            onPress={() => navigation.replace('Register')}
            disabled={isLoading}
          >
            <Text style={styles.link}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.linkBold}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '500',
  },
  alertBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
    padding: 12,
    borderRadius: 6,
  },
  alertText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});

export default LoginScreen;
