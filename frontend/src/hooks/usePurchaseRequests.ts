import { useState, useEffect } from 'react';
import { purchaseRequestsApiService, PurchaseRequest, CreatePurchaseRequestData } from '../services/purchase-requests.api.service';
import { socketService } from '../services/socket.service';

export const usePurchaseRequests = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching purchase requests...');
      const response = await purchaseRequestsApiService.getPurchaseRequests(params);
      
      if (response.success && response.data) {
        console.log('Purchase requests received:', response.data);
        setRequests(response.data);
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

  const createRequest = async (requestData: CreatePurchaseRequestData) => {
    try {
      console.log('Creating purchase request...');
      const response = await purchaseRequestsApiService.createPurchaseRequest(requestData);
      
      if (response.success) {
        console.log('Purchase request created successfully');
        await fetchRequests();
        return response;
      } else {
        console.error('Create request error:', response.error);
        setError(response.error || 'Erreur lors de la création de la demande');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la demande:', err);
      setError(err.message || 'Erreur lors de la création de la demande');
      return { success: false, error: err.message };
    }
  };

  const directorApproval = async (id: string, approved: boolean, comment?: string) => {
    try {
      console.log('Director approval for purchase request...', { id, approved, comment });
      const response = await purchaseRequestsApiService.directorApproval(id, approved, comment);
      
      if (response.success) {
        console.log('Director approval processed successfully');
        
        // Update the local state immediately for better UX
        setRequests(prevRequests => 
          prevRequests.map(request => {
            if (request.id === id && response.data) {
              return {
                ...response.data,
                // Ensure we maintain the structure
                directorApprovals: response.data.directorApprovals || {},
                status: response.data.status,
                rejectionReason: response.data.rejectionReason
              };
            }
            return request;
          })
        );
        
        // Also fetch fresh data to ensure consistency
        await fetchRequests();
        return response;
      } else {
        console.error('Director approval error:', response.error);
        setError(response.error || 'Erreur lors du traitement de l\'approbation');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors du traitement de l\'approbation:', err);
      setError(err.message || 'Erreur lors du traitement de l\'approbation');
      return { success: false, error: err.message };
    }
  };

  const approveRequest = async (id: string, notes?: string) => {
    try {
      console.log('Approving purchase request...');
      const response = await purchaseRequestsApiService.approvePurchaseRequest(id, notes);
      
      if (response.success) {
        console.log('Purchase request approved successfully');
        await fetchRequests();
        return response;
      } else {
        console.error('Approve request error:', response.error);
        setError(response.error || 'Erreur lors de l\'approbation');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation:', err);
      setError(err.message || 'Erreur lors de l\'approbation');
      return { success: false, error: err.message };
    }
  };

  const updateRequestStatus = async (id: string, status: string, rejectionReason?: string) => {
    try {
      console.log('Updating purchase request status...');
      const response = await purchaseRequestsApiService.updatePurchaseRequestStatus(id, status, rejectionReason);
      
      if (response.success) {
        console.log('Purchase request status updated successfully');
        
        // Update local state immediately
        setRequests(prevRequests => 
          prevRequests.map(request => {
            if (request.id === id && response.data) {
              return {
                ...response.data,
                status: response.data.status,
                rejectionReason: response.data.rejectionReason
              };
            }
            return request;
          })
        );
        
        await fetchRequests();
        return response;
      } else {
        console.error('Update status error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour du statut');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError(err.message || 'Erreur lors de la mise à jour du statut');
      return { success: false, error: err.message };
    }
  };

  const updateRequest = async (id: string, data: any) => {
    try {
      console.log('Updating purchase request...');
      const response = await purchaseRequestsApiService.updatePurchaseRequest(id, data);
      
      if (response.success) {
        console.log('Purchase request updated successfully');
        await fetchRequests();
        return response;
      } else {
        console.error('Update request error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour de la demande');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la demande:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la demande');
      return { success: false, error: err.message };
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      console.log('Deleting purchase request...');
      const response = await purchaseRequestsApiService.deletePurchaseRequest(id);
      
      if (response.success) {
        console.log('Purchase request deleted successfully');
        await fetchRequests();
        return response;
      } else {
        console.error('Delete request error:', response.error);
        setError(response.error || 'Erreur lors de la suppression de la demande');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la demande:', err);
      setError(err.message || 'Erreur lors de la suppression de la demande');
      return { success: false, error: err.message };
    }
  };

  const updateLogisticsStatus = async (id: string, status: string) => {
    try {
      const response = await purchaseRequestsApiService.updateLogisticsStatus(id, status);
      if (response.success) {
        await fetchRequests();
        return response;
      } else {
        setError(response.error || 'Erreur lors de la mise à jour du statut logistique');
        return response;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du statut logistique');
      return { success: false, error: err.message };
    }
  };

  const transferToLogistics = async (id: string) => {
    try {
      const response = await purchaseRequestsApiService.transferToLogistics(id);
      if (response.success) {
        await fetchRequests();
        return response;
      } else {
        setError(response.error || "Erreur lors du transfert à la logistique");
        return response;
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du transfert à la logistique");
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRequests();

    // -- NOUVEAUTÉ: écoute les updates via socket.io --
    function handlePurchaseRequestUpdated(updatedRequest: any) {
      setRequests(prev =>
        prev.map(req =>
          req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
        )
      );
    }

    socketService.on('purchase_request_updated', handlePurchaseRequestUpdated);

    return () => {
      socketService.off('purchase_request_updated', handlePurchaseRequestUpdated);
    };
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    directorApproval,
    approveRequest,
    updateRequestStatus,
    updateLogisticsStatus,
    transferToLogistics
  };
};