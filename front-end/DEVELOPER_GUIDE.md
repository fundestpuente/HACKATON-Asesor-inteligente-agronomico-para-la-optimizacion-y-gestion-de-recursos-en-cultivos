# 👨‍💻 Guía Rápida de Desarrollo - AgroMind IA Frontend

## 📦 Estructura de Proyecto

```
src/
├── components/          # Componentes reutilizables
├── context/            # Context API (autenticación, etc)
├── hooks/              # Custom hooks
├── navigation/         # React Navigation
├── screens/            # Pantallas de la app
├── services/           # Servicios API
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades (validadores, formateadores)
├── constants/          # Constantes de la app
├── assets/             # Imágenes, iconos, etc
└── App.tsx             # Componente raíz
```

---

## 🔐 Autenticación

### Usar autenticación en cualquier pantalla:

```tsx
import { useAuth } from '../hooks/useAuth';

export const MyScreen = () => {
  const { user, isSignedIn, isLoading, error, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn({ email: 'user@example.com', password: 'password123' });
      // Usuario ahora está logueado, navegación ocurre automáticamente
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      {isSignedIn ? (
        <>
          <Text>Bienvenido {user?.username}</Text>
          <Button onPress={handleLogout} title="Cerrar sesión" />
        </>
      ) : (
        <Button onPress={handleLogin} title="Iniciar sesión" />
      )}
    </View>
  );
};
```

---

## 📝 Crear Formularios

### Usar useForm hook:

```tsx
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';

interface LoginValues {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const validateForm = (values: LoginValues) => {
    const errors: Record<string, string> = {};

    if (!validators.isValidEmail(values.email)) {
      errors.email = 'Email inválido';
    }

    if (values.password.length < 8) {
      errors.password = 'Min 8 caracteres';
    }

    return errors;
  };

  const handleSubmit = async (values: LoginValues) => {
    // Hacer algo con los valores...
    console.log('Submitting:', values);
  };

  const form = useForm<LoginValues>(
    { email: '', password: '' },
    handleSubmit,
    validateForm
  );

  return (
    <View>
      <TextInput
        value={form.values.email}
        onChangeText={(val) => form.handleChange('email', val)}
        placeholder="Email"
      />
      {form.errors.email && <Text style={{ color: 'red' }}>{form.errors.email}</Text>}

      <TextInput
        value={form.values.password}
        onChangeText={(val) => form.handleChange('password', val)}
        placeholder="Contraseña"
        secureTextEntry
      />
      {form.errors.password && <Text style={{ color: 'red' }}>{form.errors.password}</Text>}

      <Button
        onPress={form.handleSubmit}
        disabled={form.isSubmitting}
        title={form.isSubmitting ? 'Enviando...' : 'Enviar'}
      />
    </View>
  );
};
```

---

## 🌾 Trabajar con Cultivos

### Obtener lista de cultivos:

```tsx
import * as api from '../services/api';
import { Crop } from '../types';

export const CropListScreen = () => {
  const [crops, setCrops] = React.useState<Crop[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCrops = async () => {
      try {
        const response = await api.listCrops({ status: 'active', limit: 10 });
        setCrops(response.items);
      } catch (err) {
        console.error('Error loading crops:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCrops();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={crops}
      renderItem={({ item }) => <CropCard crop={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

### Crear un cultivo:

```tsx
const handleCreateCrop = async (formData: CreateCropRequest) => {
  try {
    const newCrop = await api.createCrop(formData);
    console.log('Cultivo creado:', newCrop);
    navigation.navigate('CropDetail', { id: newCrop.id });
  } catch (err) {
    Alert.alert('Error', 'No se pudo crear el cultivo');
  }
};
```

### Actualizar un cultivo:

```tsx
const handleUpdateCrop = async (id: number, updates: UpdateCropRequest) => {
  try {
    const updated = await api.updateCrop(id, updates);
    console.log('Cultivo actualizado:', updated);
  } catch (err) {
    Alert.alert('Error', 'No se pudo actualizar el cultivo');
  }
};
```

### Eliminar un cultivo:

```tsx
const handleDeleteCrop = async (id: number) => {
  Alert.alert(
    'Confirmar eliminación',
    '¿Estás seguro?',
    [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await api.deleteCrop(id);
            console.log('Cultivo eliminado');
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]
  );
};
```

---

## 🤖 API de IA

### Predicción de Fertilizante:

```tsx
const handlePredict = async (cropId: number, ph: number) => {
  try {
    const result = await api.predict({ ph }, cropId);
    console.log('Nutrientes recomendados:', result.nutrientes_requeridos);
    console.log('Recomendación:', result.recomendacion);
  } catch (err) {
    Alert.alert('Error', 'Fallo la predicción');
  }
};
```

### Generador de Recetas Hidropónicas:

```tsx
const handleGenerateRecipe = async (
  cropId: number,
  week: number,
  tankLiters: number,
  phWater: number
) => {
  try {
    const result = await api.generateRecipe(
      {
        week,
        tank_liters: tankLiters,
        ph_water: phWater,
      },
      cropId
    );
    console.log('Receta generada:', result.receta_optimizada);
  } catch (err) {
    Alert.alert('Error', 'Fallo la generación de receta');
  }
};
```

### Detección de Enfermedades:

```tsx
const handleImagePrediction = async (imageFile: any, cropId?: number) => {
  try {
    const result = await api.predictImage(imageFile, cropId);
    console.log('Diagnóstico:', result.data.class);
    console.log('Confianza:', result.data.confidence);
  } catch (err) {
    Alert.alert('Error', 'Fallo el análisis de imagen');
  }
};
```

---

## 🎨 Componentes Comunes

### Header:

```tsx
import { Header } from '../components/Common/Header';

<Header
  title="Mi Pantalla"
  subtitle="Subtítulo opcional"
  onLeftPress={() => navigation.goBack()}
  leftIcon={<BackIcon />}
  backgroundColor="#fff"
  titleColor="#333"
/>
```

### Loading:

```tsx
import { LoadingSpinner } from '../components/Common/StatusMessages';

<LoadingSpinner message="Cargando datos..." size="large" color="#4CAF50" />
```

### Error Message:

```tsx
import { ErrorMessage } from '../components/Common/StatusMessages';

<ErrorMessage
  message="Ocurrió un error al cargar"
  onDismiss={() => setError(null)}
/>
```

---

## 📱 Validación de Datos

### Usar validators:

```tsx
import { validators } from '../utils/validators';

// Email
if (!validators.isValidEmail(email)) {
  // Email inválido
}

// Contraseña
const pwdCheck = validators.isValidPassword(password);
if (!pwdCheck.valid) {
  console.log('Errores:', pwdCheck.errors); // Array de mensajes
}

// Username
if (!validators.isValidUsername(username)) {
  // Username inválido
}

// pH
if (!validators.isValidPH(7.5)) {
  // pH fuera de rango
}

// Coordenadas
if (!validators.isValidLatitude(lat)) {
  // Latitud inválida
}

// Positivo
if (!validators.isPositiveNumber(area)) {
  // Número no positivo
}

// Semana
if (!validators.isValidWeek(week)) {
  // Semana inválida (debe ser 1-20)
}

// Contraseñas coinciden
if (!validators.passwordsMatch(pwd1, pwd2)) {
  // Contraseñas no coinciden
}
```

---

## 🔢 Formateo de Datos

### Usar formatters:

```tsx
import { formatters } from '../utils/formatters';

// Números
formatters.toFixed2(3.14159); // "3.14"

// Fechas
formatters.formatDate('2025-12-17T10:30:00'); // "17 dic 2025, 10:30"
formatters.formatDateOnly('2025-12-17T10:30:00'); // "17 dic 2025"

// Nutrientes
const formatted = formatters.formatNutrients({ N: 150.5, P: 45.2, K: 200.8 });
// { N: "150.50", P: "45.20", K: "200.80" }

// Cultivos
formatters.formatCropStatus('active'); // "Activo"
formatters.formatCropType('tomate'); // "Tomate"

// Otros
formatters.formatArea(250.5); // "250.50 m²"
formatters.formatPH(6.5); // "pH 6.50"
formatters.formatLiters(100); // "100.00 L"
formatters.formatWeek(2); // "Semana 2"

// Truncar texto
formatters.truncate('Lorem ipsum dolor sit amet...', 20); // "Lorem ipsum dolor..."
```

---

## 🧭 Navegación

### Navegar entre pantallas:

```tsx
// Stack Navigator
navigation.navigate('CropDetail', { id: 123 });
navigation.push('CropForm', { id: 456 }); // Stack
navigation.replace('Home'); // Reemplazar actual
navigation.goBack();

// Desde cualquier lugar con navigationRef
import { navigationRef } from '../navigation/RootNavigator';
navigationRef.navigate('Home');
```

### Pasar parámetros:

```tsx
// Enviar
navigation.navigate('CropDetail', { id: 123, name: 'Tomate' });

// Recibir en route
const { route } = useNavigation();
const { id, name } = route.params;
```

---

## 🐛 Debugging

### Ver logs:

```tsx
// API
import * as api from '../services/api';
// Los errores se loguean automáticamente en el interceptor

// Custom logs
console.log('Info:', data);
console.warn('Warning:', message);
console.error('Error:', error);

// Verificar tokens (dev only)
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('@agromind_access_token');
console.log('Token:', token);
```

---

## 📚 Tipos Disponibles

```tsx
import {
  User,
  AuthResponse,
  Crop,
  CropType,
  CropStatus,
  Prediction,
  HydroRecipe,
  ImagePrediction,
  CropStats,
  // ... y muchos más
} from '../types';

// Usar en tus componentes
const handleCrop = (crop: Crop) => {
  console.log('Tipo:', crop.crop_type); // TypeScript autocomplete
};
```

---

## ✅ Checklist para Nuevas Pantallas

- [ ] Crear pantalla en `screens/`
- [ ] Agregar a `RootStackParamList` en `RootNavigator.tsx`
- [ ] Agregar ruta en navigator
- [ ] Usar `useAuth()` si requiere autenticación
- [ ] Usar `useForm()` si tiene formularios
- [ ] Usar `validators` para validación
- [ ] Usar `formatters` para mostrar datos
- [ ] Importar tipos necesarios de `types/`
- [ ] Usar componentes comunes (Header, Loading, etc)
- [ ] Manejar errores con Alert o ErrorMessage

---

## 🚀 Mejores Prácticas

1. **Siempre tipear** variables y funciones con TypeScript
2. **Usar validadores** antes de enviar datos a la API
3. **Manejar errores** con try-catch y mostrar mensajes
4. **Mostrar loading** mientras se cargan datos
5. **Usar formatters** para presentar datos
6. **Reutilizar componentes** comunes
7. **Seguir la estructura** de carpetas
8. **Documentar funciones** complejas
9. **No hardcodear** datos o strings
10. **Probar en ambos** platforms (iOS/Android)

---

**Última actualización:** 17 de diciembre de 2025
