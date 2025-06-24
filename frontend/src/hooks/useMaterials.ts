
import { useState, useEffect } from 'react';
import { materialsApiService, Material, CreateMaterialData } from '../services/materials.api.service';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching materials data...');
      const response = await materialsApiService.getMaterials();
      
      if (response.success && response.data) {
        console.log('Materials data received:', response.data);
        setMaterials(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des matériaux');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des matériaux:', err);
      setError(err.message || 'Erreur lors du chargement des matériaux');
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData: CreateMaterialData, imageFile?: File) => {
    try {
      console.log('Creating material...');
      const response = await materialsApiService.createMaterial(materialData, imageFile);
      
      if (response.success) {
        console.log('Material created successfully');
        await fetchMaterials(); // Recharger la liste
        return response;
      } else {
        console.error('Create material error:', response.error);
        setError(response.error || 'Erreur lors de la création du matériau');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création du matériau:', err);
      setError(err.message || 'Erreur lors de la création du matériau');
      return { success: false, error: err.message };
    }
  };

  const updateMaterial = async (id: string, materialData: Partial<CreateMaterialData>, imageFile?: File) => {
    try {
      console.log('Updating material:', id);
      const response = await materialsApiService.updateMaterial(id, materialData, imageFile);
      
      if (response.success) {
        console.log('Material updated successfully');
        await fetchMaterials(); // Recharger la liste
        return response;
      } else {
        console.error('Update material error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour du matériau');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du matériau:', err);
      setError(err.message || 'Erreur lors de la mise à jour du matériau');
      return { success: false, error: err.message };
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      console.log('Deleting material:', id);
      const response = await materialsApiService.deleteMaterial(id);
      
      if (response.success) {
        console.log('Material deleted successfully');
        await fetchMaterials(); // Recharger la liste
        return response;
      } else {
        console.error('Delete material error:', response.error);
        setError(response.error || 'Erreur lors de la suppression du matériau');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression du matériau:', err);
      setError(err.message || 'Erreur lors de la suppression du matériau');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
  };
};
