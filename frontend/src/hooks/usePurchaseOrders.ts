import { useState, useEffect } from 'react';
import { purchaseOrdersApiService, PurchaseOrder } from '../services/purchase-orders.api.service';

export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching purchase orders...');
      const response = await purchaseOrdersApiService.getPurchaseOrders(params);
      
      if (response.success && response.data) {
        console.log('Purchase orders received:', response.data);
        setOrders(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des bons de commande');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des bons de commande:', err);
      setError(err.message || 'Erreur lors du chargement des bons de commande');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (id: string, supplier?: string, notes?: string) => {
    try {
      console.log('Confirming purchase order...');
      const response = await purchaseOrdersApiService.confirmPurchaseOrder(id, supplier, notes);
      
      if (response.success) {
        console.log('Purchase order confirmed successfully');
        await fetchOrders();
        return response;
      } else {
        console.error('Confirm order error:', response.error);
        setError(response.error || 'Erreur lors de la confirmation');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la confirmation:', err);
      setError(err.message || 'Erreur lors de la confirmation');
      return { success: false, error: err.message };
    }
  };

  const sendToLogistics = async (id: string, deliveryInstructions?: string) => {
    try {
      console.log('Sending order to logistics...');
      const response = await purchaseOrdersApiService.sendToLogistics(id, deliveryInstructions);
      
      if (response.success) {
        console.log('Order sent to logistics successfully');
        await fetchOrders();
        return response;
      } else {
        console.error('Send to logistics error:', response.error);
        setError(response.error || 'Erreur lors de l\'envoi vers la logistique');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi vers la logistique:', err);
      setError(err.message || 'Erreur lors de l\'envoi vers la logistique');
      return { success: false, error: err.message };
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await purchaseOrdersApiService.updatePurchaseOrderStatus(id, status);
      if (response.success) {
        await fetchOrders();
        return response;
      } else {
        setError(response.error || 'Erreur lors de la mise à jour du statut');
        return response;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du statut');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    confirmOrder,
    sendToLogistics,
    updateOrderStatus
  };
};