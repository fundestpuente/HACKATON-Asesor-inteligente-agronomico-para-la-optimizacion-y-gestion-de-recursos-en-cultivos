import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { listCrops } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CropList'>;

interface Props { navigation: NavigationProp }

const CropListScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listCrops();
      setCrops(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo cargar los cultivos');
    } finally { setLoading(false); }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CropDetail', { id: item.id })}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.sub}>{item.crop_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mis cultivos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CropForm')}>
          <Text style={styles.link}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4CAF50" /> : (
        <FlatList data={crops} renderItem={renderItem} keyExtractor={(i) => String(i.id)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFEF5' },
  header: { fontSize: 22, fontWeight: '700', color: '#1B5E20' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  link: { color: '#2E7D32' },
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#666', marginTop: 4 },
});

export default CropListScreen;
