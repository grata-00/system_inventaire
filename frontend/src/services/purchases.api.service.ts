
// import { apiService } from './api.service';
// import { ApiResponse, PaginatedResponse } from '../types/entities';

// export interface PurchaseRequest {
//   id: string;
//   requestNumber: string;
//   projectName: string;
//   requestedProducts: PurchaseProduct[];
//   totalEstimatedCost: number;
//   priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
//   status: 'En attente' | 'Approuvée' | 'Rejetée' | 'Commandée';
//   notes?: string;
//   rejectionReason?: string;
//   requestedBy: string;
//   approvedBy?: string;
//   approvedAt?: string;
//   createdAt: string;
//   updatedAt: string;
//   requesterFirstName?: string;
//   requesterLastName?: string;
//   approverFirstName?: string;
//   approverLastName?: string;
// }

// export interface PurchaseProduct {
//   name: string;
//   quantity: number;
//   estimatedPrice?: number;
// }

// export interface CreatePurchaseRequestData {
//   projectName: string;
//   requestedProducts: PurchaseProduct[];
//   totalEstimatedCost?: number;
//   priority?: string;
//   notes?: string;
// }

// export interface PurchaseOrder {
//   id: string;
//   orderNumber: string;
//   supplier: string;
//   products: PurchaseProduct[];
//   totalAmount: number;
//   status: 'Brouillon' | 'Envoyée' | 'Reçue' | 'Annulée';
//   orderDate: string;
//   expectedDeliveryDate?: string;
//   actualDeliveryDate?: string;
//   notes?: string;
//   purchaseRequestId?: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export class PurchasesApiService {
//   // === PURCHASE REQUESTS ===
  
//   // Récupérer toutes les demandes d'achat
//   async getPurchaseRequests(): Promise<ApiResponse<PurchaseRequest[]>> {
//     console.log('PurchasesApiService: Getting purchase requests');
//     return apiService.get<PurchaseRequest[]>('/purchases');
//   }

//   // Récupérer une demande d'achat par ID
//   async getPurchaseRequestById(id: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchasesApiService: Getting purchase request by ID:', id);
//     return apiService.get<PurchaseRequest>(`/purchases/${id}`);
//   }

//   // Créer une nouvelle demande d'achat
//   async createPurchaseRequest(requestData: CreatePurchaseRequestData): Promise<ApiResponse<PurchaseRequest>> {
  
//     const request=
//     {
//       requestNumber:requestData.requestNumber,
//       deliveryDate:requestData.deliveryDate,
//       estimationDate:requestData.estimationDate,
//       totalEstimatedCost:requestData.estimatedPrice,
//       quantity:requestData.quantity,
//       projectName:requestData.projectName,
//       requestedProducts:requestData.productName,
//       status:requestData.status,
//       requestedBy:requestData.createdBy.id
//     }
    
//     return apiService.post<PurchaseRequest>('/purchases', request);
//   }

//   // Approuver une demande d'achat
//   async approvePurchaseRequest(id: string, notes?: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchasesApiService: Approving purchase request:', id);
//     return apiService.patch<PurchaseRequest>(`/purchases/${id}/approve`, { notes });
//   }

//   // Rejeter une demande d'achat
//   async rejectPurchaseRequest(id: string, rejectionReason: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchasesApiService: Rejecting purchase request:', id);
//     return apiService.patch<PurchaseRequest>(`/purchases/${id}/reject`, { rejectionReason });
//   }

//   // === PURCHASE ORDERS ===
  
//   // Récupérer tous les bons de commande
//   async getPurchaseOrders(): Promise<ApiResponse<PurchaseOrder[]>> {
//     console.log('PurchasesApiService: Getting purchase orders');
//     return apiService.get<PurchaseOrder[]>('/purchase-orders');
//   }

//   // Créer un bon de commande
//   async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchasesApiService: Creating purchase order:', orderData);
//     return apiService.post<PurchaseOrder>('/purchase-orders', orderData);
//   }

//   // Mettre à jour un bon de commande
//   async updatePurchaseOrder(id: string, orderData: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
//     console.log('PurchasesApiService: Updating purchase order:', id, orderData);
//     return apiService.put<PurchaseOrder>(`/purchase-orders/${id}`, orderData);
//   }
// }

// export const purchasesApiService = new PurchasesApiService();

import { apiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../types/entities';

export interface PurchaseRequestData {
  id: string;
  requestNumber: string;
  projectName: string;
  requestedProducts: PurchaseProduct[];
  totalEstimatedCost: number;
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  status: 'En attente' | 'Approuvée' | 'Rejetée' | 'Commandée';
  notes?: string;
  rejectionReason?: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  requesterFirstName?: string;
  requesterLastName?: string;
  approverFirstName?: string;
  approverLastName?: string;
}

export interface PurchaseProduct {
  name: string;
  quantity: number;
  estimatedPrice?: number;
}

export interface CreatePurchaseRequestData {
  projectName: string;
  requestedProducts: PurchaseProduct[];
  totalEstimatedCost?: number;
  priority?: string;
  notes?: string;
}

export interface PurchaseOrderData {
  id: string;
  orderNumber: string;
  supplier: string;
  products: PurchaseProduct[];
  totalAmount: number;
  status: 'Brouillon' | 'Envoyée' | 'Reçue' | 'Annulée';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  purchaseRequestId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class PurchasesApiService {
  // === PURCHASE REQUESTS ===
  
  // Récupérer toutes les demandes d'achat
  async getPurchaseRequests(): Promise<ApiResponse<PurchaseRequestData[]>> {
    console.log('PurchasesApiService: Getting purchase requests');
    return apiService.get<PurchaseRequestData[]>('/purchases');
  }

  // Récupérer une demande d'achat par ID
  async getPurchaseRequestById(id: string): Promise<ApiResponse<PurchaseRequestData>> {
    console.log('PurchasesApiService: Getting purchase request by ID:', id);
    return apiService.get<PurchaseRequestData>(`/purchases/${id}`);
  }

  // Créer une nouvelle demande d'achat
  async createPurchaseRequest(requestData: CreatePurchaseRequestData): Promise<ApiResponse<PurchaseRequestData>> {
    console.log('PurchasesApiService: Creating purchase request:', requestData);
    return apiService.post<PurchaseRequestData>('/purchases', requestData);
  }

  // Approuver une demande d'achat
  async approvePurchaseRequest(id: string, notes?: string): Promise<ApiResponse<PurchaseRequestData>> {
    console.log('PurchasesApiService: Approving purchase request:', id);
    return apiService.patch<PurchaseRequestData>(`/purchases/${id}/approve`, { notes });
  }

  // Rejeter une demande d'achat
  async rejectPurchaseRequest(id: string, rejectionReason: string): Promise<ApiResponse<PurchaseRequestData>> {
    console.log('PurchasesApiService: Rejecting purchase request:', id);
    return apiService.patch<PurchaseRequestData>(`/purchases/${id}/reject`, { rejectionReason });
  }

  // === PURCHASE ORDERS ===
  
  // Récupérer tous les bons de commande
  async getPurchaseOrders(): Promise<ApiResponse<PurchaseOrderData[]>> {
    console.log('PurchasesApiService: Getting purchase orders');
    return apiService.get<PurchaseOrderData[]>('/purchase-orders');
  }

  // Créer un bon de commande
  async createPurchaseOrder(orderData: Omit<PurchaseOrderData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PurchaseOrderData>> {
    console.log('PurchasesApiService: Creating purchase order:', orderData);
    return apiService.post<PurchaseOrderData>('/purchase-orders', orderData);
  }

  // Mettre à jour un bon de commande
  async updatePurchaseOrder(id: string, orderData: Partial<PurchaseOrderData>): Promise<ApiResponse<PurchaseOrderData>> {
    console.log('PurchasesApiService: Updating purchase order:', id, orderData);
    return apiService.put<PurchaseOrderData>(`/purchase-orders/${id}`, orderData);
  }
}

export const purchasesApiService = new PurchasesApiService();