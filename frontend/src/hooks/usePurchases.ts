
import { useState, useEffect } from 'react';
import { purchasesApiService, PurchaseRequest, PurchaseOrder } from '../services/purchases.api.service';

export const usePurchaseRequests = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching purchase requests...');
      const response = await purchasesApiService.getPurchaseRequests();
      
      if (response.success && response.data) {
        console.log('Purchase requests received:', response.data);
        setPurchaseRequests(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des demandes d\'achat');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des demandes d\'achat:', err);
      setError(err.message || 'Erreur lors du chargement des demandes d\'achat');
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseRequest = async (requestData: any) => {
    try {
      console.log('Creating purchase request...');
      const response = await purchasesApiService.createPurchaseRequest(requestData);
      
      if (response.success) {
        console.log('Purchase request created successfully');
        await fetchPurchaseRequests();
        return response;
      } else {
        console.error('Create purchase request error:', response.error);
        setError(response.error || 'Erreur lors de la création de la demande d\'achat');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la demande d\'achat:', err);
      setError(err.message || 'Erreur lors de la création de la demande d\'achat');
      return { success: false, error: err.message };
    }
  };

  const approvePurchaseRequest = async (id: string, notes?: string) => {
    try {
      console.log('Approving purchase request:', id);
      const response = await purchasesApiService.approvePurchaseRequest(id, notes);
      
      if (response.success) {
        console.log('Purchase request approved successfully');
        await fetchPurchaseRequests();
        return response;
      } else {
        console.error('Approve purchase request error:', response.error);
        setError(response.error || 'Erreur lors de l\'approbation de la demande d\'achat');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation de la demande d\'achat:', err);
      setError(err.message || 'Erreur lors de l\'approbation de la demande d\'achat');
      return { success: false, error: err.message };
    }
  };

  const rejectPurchaseRequest = async (id: string, rejectionReason: string) => {
    try {
      console.log('Rejecting purchase request:', id);
      const response = await purchasesApiService.rejectPurchaseRequest(id, rejectionReason);
      
      if (response.success) {
        console.log('Purchase request rejected successfully');
        await fetchPurchaseRequests();
        return response;
      } else {
        console.error('Reject purchase request error:', response.error);
        setError(response.error || 'Erreur lors du rejet de la demande d\'achat');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors du rejet de la demande d\'achat:', err);
      setError(err.message || 'Erreur lors du rejet de la demande d\'achat');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  return {
    purchaseRequests,
    loading,
    error,
    refetch: fetchPurchaseRequests,
    createPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest
  };
};

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching purchase orders...');
      const response = await purchasesApiService.getPurchaseOrders();
      
      if (response.success && response.data) {
        console.log('Purchase orders received:', response.data);
        setPurchaseOrders(response.data);
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

  const createPurchaseOrder = async (orderData: any) => {
    try {
      console.log('Creating purchase order...');
      const response = await purchasesApiService.createPurchaseOrder(orderData);
      
      if (response.success) {
        console.log('Purchase order created successfully');
        await fetchPurchaseOrders();
        return response;
      } else {
        console.error('Create purchase order error:', response.error);
        setError(response.error || 'Erreur lors de la création du bon de commande');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création du bon de commande:', err);
      setError(err.message || 'Erreur lors de la création du bon de commande');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    error,
    refetch: fetchPurchaseOrders,
    createPurchaseOrder
  };
};
