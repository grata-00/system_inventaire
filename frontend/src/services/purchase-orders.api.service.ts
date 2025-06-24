

// import { apiService } from './api.service';
// import { ApiResponse, PaginatedResponse, PurchaseOrder } from '../types/entities';

// export class PurchaseOrdersApiService {
//   async getPurchaseOrders(params?: any): Promise<PaginatedResponse<PurchaseOrder>> {
//     console.log('PurchaseOrdersApiService: Getting purchase orders');
//     const response = await apiService.get<PurchaseOrder[]>('/purchase-orders', { params });
    
//     if (response.success && response.data) {
//       return {
//         success: true,
//         data: response.data,
//         pagination: {
//           page: 1,
//           limit: 10,
//           total: response.data.length,
//           totalPages: 1
//         }
//       };
//     }
    
//     return {
//       success: false,
//       data: [],
//       pagination: {
//         page: 1,
//         limit: 10,
//         total: 0,
//         totalPages: 0
//       },
//       error: response.error
//     };
//   }

//   async confirmOrder(id: string, supplier?: string, notes?: string): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchaseOrdersApiService: Confirming order', id, supplier, notes);
//     try {
//       const response = await apiService.patch<PurchaseOrder>(`/purchase-orders/${id}/confirm`, {
//         supplier,
//         notes
//       });
//       return response;
//     } catch (error: any) {
//       console.error('Error confirming order:', error);
//       return {
//         success: false,
//         error: error.message || 'Erreur lors de la confirmation'
//       };
//     }
//   }

//   async confirmPurchaseOrder(id: string, supplier?: string, notes?: string): Promise<ApiResponse<PurchaseOrder>> {
//     return this.confirmOrder(id, supplier, notes);
//   }

//   async sendToLogistics(id: string, deliveryInstructions?: string): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchaseOrdersApiService: Sending to logistics', id, deliveryInstructions);
//     try {
//       const response = await apiService.patch<PurchaseOrder>(`/purchase-orders/${id}/send-to-logistics`, {
//         deliveryInstructions
//       });
//       return response;
//     } catch (error: any) {
//       console.error('Error sending to logistics:', error);
//       return {
//         success: false,
//         error: error.message || 'Erreur lors de l\'envoi vers la logistique'
//       };
//     }
//   }

//   async updateOrderStatus(id: string, status: string): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchaseOrdersApiService: Updating order status', id, status);
//     try {
//       const response = await apiService.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status });
//       return response;
//     } catch (error: any) {
//       console.error('Error updating order status:', error);
//       return {
//         success: false,
//         error: error.message || 'Erreur lors de la mise à jour du statut'
//       };
//     }
//   }

//   async updatePurchaseOrderStatus(id: string, status: string): Promise<ApiResponse<PurchaseOrder>> {
//     return this.updateOrderStatus(id, status);
//   }

//   async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchaseOrdersApiService: Getting purchase order by ID', id);
//     return apiService.get<PurchaseOrder>(`/purchase-orders/${id}`);
//   }
// }

// export const purchaseOrdersApiService = new PurchaseOrdersApiService();
// export type { PurchaseOrder };

import { ApiResponse, PaginatedResponse } from '../types/entities';
import { apiService } from './api.service';

export interface PurchaseOrderData {
  id: string;
  orderNumber: string;
  supplier: string;
  products: Array<{
    name: string;
    quantity: number;
    estimatedPrice?: number;
  }>;
  totalAmount: number;
  status: 'Brouillon' | 'Confirmée' | 'Envoyée_Logistique' | 'En_Livraison' | 'Livrée' | 'Annulée';
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  purchaseRequestId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  orderNumber: string;
  supplier: string;
  products: Array<{
    name: string;
    quantity: number;
    estimatedPrice?: number;
  }>;
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  purchaseRequestId?: string;
}

export interface UpdatePurchaseOrderData {
  supplier?: string;
  products?: Array<{
    name: string;
    quantity: number;
    estimatedPrice?: number;
  }>;
  totalAmount?: number;
  expectedDeliveryDate?: string;
  notes?: string;
}

export const purchaseOrdersApiService = {
  async getPurchaseOrders(params?: any): Promise<PaginatedResponse<PurchaseOrderData>> {
    try {
      console.log('Fetching purchase orders with params:', params);
      const response = await apiService.get('/purchase-orders', { params });
      console.log('Purchase orders API response:', response);
      
      if (!response.data) {
        return {
          success: false,
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          },
          error: 'Aucune donnée reçue'
        };
      }

      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            totalPages: 1
          }
        };
      }

      return {
        success: true,
        data: (response.data as any).data || [],
        pagination: (response.data as any).pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        error: error.response?.data?.message || error.message || 'Erreur lors de la récupération des bons de commande'
      };
    }
  },

  async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrderData>> {
    try {
      console.log('Fetching purchase order by id:', id);
      const response = await apiService.get(`/purchase-orders/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching purchase order by id:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de la récupération du bon de commande'
      };
    }
  },

  async confirmPurchaseOrder(id: string, supplier?: string, notes?: string): Promise<ApiResponse<PurchaseOrderData>> {
    try {
      console.log('Confirming purchase order:', id);
      const response = await apiService.patch(`/purchase-orders/${id}/confirm`, { 
        supplier, 
        notes 
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error confirming purchase order:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de la confirmation du bon de commande'
      };
    }
  },

  async sendToLogistics(id: string, deliveryInstructions?: string): Promise<ApiResponse<PurchaseOrderData>> {
    try {
      console.log('Sending purchase order to logistics:', id);
      const response = await apiService.patch(`/purchase-orders/${id}/send-to-logistics`, { 
        deliveryInstructions 
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error sending to logistics:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de l\'envoi vers la logistique'
      };
    }
  },

  async updatePurchaseOrderStatus(id: string, status: string): Promise<ApiResponse<PurchaseOrderData>> {
    try {
      const response = await apiService.patch(`/purchase-orders/${id}/status`, { status });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du statut'
      };
    }
  }
};

export type { PurchaseOrderData as PurchaseOrder };