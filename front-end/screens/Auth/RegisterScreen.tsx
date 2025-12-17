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
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import apiClient from '../../services/api';

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterNavigationProp;
}

interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generalError, setGeneralError] = React.useState('');

  /**
   * Validar formulario de registro
   */
  const validateRegister = (values: RegisterFormValues) => {
    const errors: Record<string, string> = {};

    // Validar email
    if (!values.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validators.isValidEmail(values.email)) {
      errors.email = 'Por favor ingresa un email válido';
    }

    // Validar username
    if (!values.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (!validators.isValidUsername(values.username)) {
      errors.username = 'El usuario debe tener 3-30 caracteres (letras, números, - y _)';
    }

    // Validar contraseña
    if (!values.password) {
      errors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validators.isValidPassword(values.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Validar confirmación de contraseña
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (!validators.passwordsMatch(values.password, values.confirmPassword)) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  /**
   * Manejar envío del formulario
   */
  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setGeneralError('');
    setIsLoading(true);

    try {
      console.log('📝 RegisterScreen: Iniciando registro de', values.username);

      const response = await apiClient.post('/auth/register', {
        email: values.email.toLowerCase().trim(),
        username: values.username.trim(),
        password: values.password,
      });

      console.log('✅ RegisterScreen: Registro exitoso', response.data);

      Alert.alert(
        '¡Éxito!',
        'Cuenta creada correctamente. Por favor inicia sesión.',
        [
          {
            text: 'Ir a Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ RegisterScreen: Error en registro -', error);

      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Error al crear la cuenta';

      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<RegisterFormValues>(
    {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    handleRegisterSubmit,
    validateRegister
  );


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
          <Text style={styles.subtitle}>Crear Cuenta</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.email ? styles.inputError : undefined,
              ]}
              placeholder="usuario@ejemplo.com"
              placeholderTextColor="#999"
              value={form.values.email}
              onChangeText={(value) => form.handleChange('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {form.errors.email && (
              <Text style={styles.errorText}>{form.errors.email}</Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.username ? styles.inputError : undefined,
              ]}
              placeholder="tu_usuario_aqui"
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
              placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar Contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.confirmPassword ? styles.inputError : undefined,
              ]}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#999"
              value={form.values.confirmPassword}
              onChangeText={(value) =>
                form.handleChange('confirmPassword', value)
              }
              secureTextEntry
              editable={!isLoading}
            />
            {form.errors.confirmPassword && (
              <Text style={styles.errorText}>{form.errors.confirmPassword}</Text>
            )}
          </View>

        {/* Error general del formulario */}
          {generalError && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{generalError}</Text>
            </View>
          )}

          {/* Botón de registro */}
          <TouchableOpacity
            style={[
              styles.button,
              (Object.keys(form.errors).length > 0 || isLoading) && styles.buttonDisabled,
            ]}
            onPress={form.handleSubmit}
            disabled={Object.keys(form.errors).length > 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Registrarme</Text>
            )}
          </TouchableOpacity>

          {/* Link a login */}
          <TouchableOpacity
            onPress={() => navigation.replace('Login')}
            disabled={isLoading}
          >
            <Text style={styles.link}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.linkBold}>Inicia sesión aquí</Text>
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
    gap: 16,
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

export default RegisterScreen;
