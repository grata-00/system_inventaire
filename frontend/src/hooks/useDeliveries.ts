
import { useState, useEffect } from 'react';
import { deliveriesApiService, Delivery, CreateDeliveryData } from '../services/deliveries.api.service';
import { useAuth } from '../contexts/AuthContext';

export const useDeliveries = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching deliveries...');
      const response = await deliveriesApiService.getDeliveries();
      
      if (response.success && response.data) {
        console.log('Deliveries received:', response.data);
        setDeliveries(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des livraisons');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des livraisons:', err);
      setError(err.message || 'Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryById = async (id: string) => {
    try {
      console.log('Getting delivery by ID:', id);
      const response = await deliveriesApiService.getDeliveryById(id);
      
      if (response.success && response.data) {
        console.log('Delivery details received:', response.data);
        return response.data;
      } else {
        console.error('Get delivery error:', response.error);
        setError(response.error || 'Erreur lors de la récupération des détails de livraison');
        return null;
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des détails de livraison:', err);
      setError(err.message || 'Erreur lors de la récupération des détails de livraison');
      return null;
    }
  };

  const createDelivery = async (deliveryData: CreateDeliveryData) => {
    try {
      console.log('Creating delivery...');
      
      // Add source based on current user role
      const enrichedDeliveryData = {
        ...deliveryData,
        source: user?.role === 'service_facturation' ? 'service_facturation' : 
                user?.role === 'responsable_achat' ? 'responsable_achat' : 
                'other',
        commercialId: deliveryData.commercialId || user?.id // Use current user as commercial if not specified
      };
      
      console.log('Creating delivery with enriched data:', enrichedDeliveryData);
      
      const response = await deliveriesApiService.createDelivery(enrichedDeliveryData);
      
      if (response.success) {
        console.log('Delivery created successfully');
        await fetchDeliveries();
        return response;
      } else {
        console.error('Create delivery error:', response.error);
        setError(response.error || 'Erreur lors de la création de la livraison');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la livraison:', err);
      setError(err.message || 'Erreur lors de la création de la livraison');
      return { success: false, error: err.message };
    }
  };

  const updateDeliveryStatus = async (id: string, status: string, signature?: string) => {
    try {
      console.log('Updating delivery status:', id, status);
      const actualDeliveryDate = status === 'Livrée' ? new Date().toISOString() : undefined;
      const response = await deliveriesApiService.updateDeliveryStatus(id, status, signature, actualDeliveryDate);
      
      if (response.success) {
        console.log('Delivery status updated successfully');
        await fetchDeliveries();
        return response;
      } else {
        console.error('Update delivery status error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour du statut de livraison');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut de livraison:', err);
      setError(err.message || 'Erreur lors de la mise à jour du statut de livraison');
      return { success: false, error: err.message };
    }
  };

  const updateDelivery = async (id: string, deliveryData: Partial<CreateDeliveryData>) => {
    try {
      console.log('Updating delivery:', id);
      const response = await deliveriesApiService.updateDelivery(id, deliveryData);
      
      if (response.success) {
        console.log('Delivery updated successfully');
        await fetchDeliveries();
        return response;
      } else {
        console.error('Update delivery error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour de la livraison');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la livraison:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la livraison');
      return { success: false, error: err.message };
    }
  };

  const deleteDelivery = async (id: string) => {
    try {
      console.log('Deleting delivery:', id);
      const response = await deliveriesApiService.deleteDelivery(id);
      
      if (response.success) {
        console.log('Delivery deleted successfully');
        await fetchDeliveries();
        return response;
      } else {
        console.error('Delete delivery error:', response.error);
        setError(response.error || 'Erreur lors de la suppression de la livraison');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la livraison:', err);
      setError(err.message || 'Erreur lors de la suppression de la livraison');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    loading,
    error,
    refetch: fetchDeliveries,
    getDeliveryById,
    createDelivery,
    updateDeliveryStatus,
    updateDelivery,
    deleteDelivery
  };
};
