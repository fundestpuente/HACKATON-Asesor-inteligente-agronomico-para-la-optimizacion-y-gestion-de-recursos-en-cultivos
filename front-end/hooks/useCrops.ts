import { useState, useCallback, useEffect } from 'react';
import client from '../services/api';
import { Crop } from '../types';

/**
 * Hook para manejar operaciones de cultivos
 */
export const useCrops = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Cargar cultivos del usuario
   */
  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌾 useCrops: Cargando cultivos');
      
      const response = await client.get<Crop[]>('/crops');
      setCrops(response.data);
      
      console.log('✅ useCrops: Cultivos cargados', response.data.length);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Error al cargar cultivos';
      setError(errorMessage);
      console.error('❌ useCrops: Error -', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo cultivo
   */
  const createCrop = useCallback(
    async (cropData: any) => {
      try {
        console.log('🌾 useCrops: Creando cultivo', cropData.name);
        
        const response = await client.post<Crop>('/crops', cropData);
        setCrops((prev) => [...prev, response.data]);
        
        console.log('✅ useCrops: Cultivo creado', response.data.id);
        return { success: true, crop: response.data };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || 'Error al crear cultivo';
        console.error('❌ useCrops: Error al crear -', errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Actualizar cultivo
   */
  const updateCrop = useCallback(
    async (cropId: number, cropData: any) => {
      try {
        console.log('🌾 useCrops: Actualizando cultivo', cropId);
        
        const response = await client.put<Crop>(`/crops/${cropId}`, cropData);
        setCrops((prev) =>
          prev.map((c) => (c.id === cropId ? response.data : c))
        );
        
        console.log('✅ useCrops: Cultivo actualizado');
        return { success: true, crop: response.data };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || 'Error al actualizar cultivo';
        console.error('❌ useCrops: Error al actualizar -', errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Obtener cultivo por ID
   */
  const getCropById = useCallback(async (cropId: number) => {
    try {
      console.log('🌾 useCrops: Obteniendo detalles del cultivo', cropId);
      
      const response = await client.get<Crop>(`/crops/${cropId}`);
      
      console.log('✅ useCrops: Detalles obtenidos');
      return { success: true, crop: response.data };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Error al obtener cultivo';
      console.error('❌ useCrops: Error al obtener -', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Eliminar cultivo
   */
  const deleteCrop = useCallback(
    async (cropId: number) => {
      try {
        console.log('🌾 useCrops: Eliminando cultivo', cropId);
        
        await client.delete(`/crops/${cropId}`);
        setCrops((prev) => prev.filter((c) => c.id !== cropId));
        
        console.log('✅ useCrops: Cultivo eliminado');
        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || 'Error al eliminar cultivo';
        console.error('❌ useCrops: Error al eliminar -', errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Refrescar lista de cultivos
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCrops();
    setRefreshing(false);
  }, [fetchCrops]);

  // Cargar cultivos al montar el hook
  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return {
    crops,
    loading,
    error,
    refreshing,
    fetchCrops,
    createCrop,
    updateCrop,
    getCropById,
    deleteCrop,
    onRefresh,
  };
};
