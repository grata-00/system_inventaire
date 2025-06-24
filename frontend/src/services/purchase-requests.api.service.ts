// import { apiService } from './api.service';
// import { ApiResponse } from '../types/entities';

// export interface PurchaseRequest {
//   id: string;
//   requestNumber: string;
//   projectName: string;
//   commercialName: string;
//   productName: string;
//   quantity: number;
//   estimatedPrice: number;
//   requestedProducts: any[];
//   totalEstimatedCost: number;
//   deliveryDate: string | null;
//   estimationDate: string | null;
//   priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
//   status: string;
//   notes: string | null;
//   rejectionReason: string | null;
//   requestedBy: string;
//   approvedBy: string | null;
//   approvedAt: string | null;
//   purchaseOrderFile: string | null;
//   purchaseOrderPdf: string | null;
//   directorApprovals: any;
//   approvals: any[];
//   approvalCount: number;
//   isFullyApproved: boolean;
//   requiredApprovalsCount: number;
//   createdAt: string;
//   updatedAt: string;
//   requester?: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//   };
//   approver?: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//   };
// }

// export interface CreatePurchaseRequestData {
//   projectName: string;
//   productName: string;
//   quantity: number;
//   estimatedPrice: number;
//   deliveryDate: string;
//   estimationDate: string;
//   priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
//   requestedProducts: any[];
//   totalEstimatedCost: number;
//   purchaseOrderFile?: string;
// }

// export class PurchaseRequestsApiService {
//   async getPurchaseRequests(params?: any): Promise<ApiResponse<PurchaseRequest[]>> {
//     console.log('PurchaseRequestsApiService: Getting purchase requests');
//     return apiService.get<PurchaseRequest[]>('/purchase-requests', { params });
//   }

//   async createPurchaseRequest(data: CreatePurchaseRequestData): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchaseRequestsApiService: Creating purchase request');
//     return apiService.post<PurchaseRequest>('/purchase-requests', data);
//   }

//   async updatePurchaseRequest(id: string, data: any): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchaseRequestsApiService: Updating purchase request', id, data);
//     return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}`, data);
//   }

//   async deletePurchaseRequest(id: string): Promise<ApiResponse<void>> {
//     console.log('PurchaseRequestsApiService: Deleting purchase request', id);
//     return apiService.delete<void>(`/purchase-requests/${id}`);
//   }

//   async approvePurchaseRequest(id: string, notes?: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchaseRequestsApiService: Approving purchase request', id, notes);
//     return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/approve`, { notes });
//   }

//   async updatePurchaseRequestStatus(id: string, status: string, rejectionReason?: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchaseRequestsApiService: Updating purchase request status', id, status, rejectionReason);
//     return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/status`, { status, rejectionReason });
//   }

//   async directorApproval(id: string, approved: boolean, comment?: string): Promise<ApiResponse<PurchaseRequest>> {
//     console.log('PurchaseRequestsApiService: Director approving purchase request', id, approved, comment);
//     return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/director-approval`, { approved, comment });
//   }

//   async updateLogisticsStatus(id: string, status: string) {
//     return apiService.patch(`/purchase-requests/${id}/update-logistics-status`, { status });
//   }

//   async transferToLogistics(id: string) {
//     console.log('PurchaseRequestsApiService: Transferring to logistics', id);
//     return apiService.patch(`/purchase-requests/${id}/transfer-to-logistics`);
//   }

//   async getPurchaseRequestById(id: string): Promise<ApiResponse<PurchaseRequest>> {
//     return apiService.get<PurchaseRequest>(`/purchase-requests/${id}`);
//   }
// }

// export const purchaseRequestsApiService = new PurchaseRequestsApiService();

import { apiService } from './api.service';
import { ApiResponse } from '../types/entities';

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  projectName: string;
  commercialName: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
  requestedProducts: any[];
  totalEstimatedCost: number;
  deliveryDate: string | null;
  estimationDate: string | null;
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  status: 'En attente' | 'En cours d\'approbation' | 'Approuvée' | 'Rejetée' | 'Commandée' | 'Confirmée_Achat' | 'Envoyée_Logistique';
  notes: string | null;
  rejectionReason: string | null;
  requestedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  purchaseOrderFile: string | null;
  purchaseOrderPdf: string | null;
  directorApprovals: any;
  approvals: any[];
  approvalCount: number;
  isFullyApproved: boolean;
  requiredApprovalsCount: number;
  createdAt: string;
  updatedAt: string;
  requester?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  purchaseOrders?: any[];
}

export interface CreatePurchaseRequestData {
  projectName: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
  deliveryDate: string;
  estimationDate: string;
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  requestedProducts: any[];
  totalEstimatedCost: number;
  purchaseOrderFile?: string;
}

export class PurchaseRequestsApiService {
  async getPurchaseRequests(params?: any): Promise<ApiResponse<PurchaseRequest[]>> {
    console.log('PurchaseRequestsApiService: Getting purchase requests');
    return apiService.get<PurchaseRequest[]>('/purchase-requests', { params });
  }

  async createPurchaseRequest(data: CreatePurchaseRequestData): Promise<ApiResponse<PurchaseRequest>> {
    console.log('PurchaseRequestsApiService: Creating purchase request');
    return apiService.post<PurchaseRequest>('/purchase-requests', data);
  }

  async updatePurchaseRequest(id: string, data: any): Promise<ApiResponse<PurchaseRequest>> {
    console.log('PurchaseRequestsApiService: Updating purchase request', id, data);
    return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}`, data);
  }

  async deletePurchaseRequest(id: string): Promise<ApiResponse<void>> {
    console.log('PurchaseRequestsApiService: Deleting purchase request', id);
    return apiService.delete<void>(`/purchase-requests/${id}`);
  }

  async approvePurchaseRequest(id: string, notes?: string): Promise<ApiResponse<PurchaseRequest>> {
    console.log('PurchaseRequestsApiService: Approving purchase request', id, notes);
    return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/approve`, { notes });
  }

  async updatePurchaseRequestStatus(id: string, status: string, rejectionReason?: string): Promise<ApiResponse<PurchaseRequest>> {
    console.log('PurchaseRequestsApiService: Updating purchase request status', id, status, rejectionReason);
    return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/status`, { status, rejectionReason });
  }

  async directorApproval(id: string, approved: boolean, comment?: string): Promise<ApiResponse<PurchaseRequest>> {
    console.log('PurchaseRequestsApiService: Director approving purchase request', id, approved, comment);
    return apiService.patch<PurchaseRequest>(`/purchase-requests/${id}/director-approval`, { approved, comment });
  }

  async updateLogisticsStatus(id: string, status: string) {
    return apiService.patch(`/purchase-requests/${id}/update-logistics-status`, { status });
  }

  async transferToLogistics(id: string) {
    console.log('PurchaseRequestsApiService: Transferring to logistics', id);
    return apiService.patch(`/purchase-requests/${id}/transfer-to-logistics`);
  }

  async getPurchaseRequestById(id: string): Promise<ApiResponse<PurchaseRequest>> {
    return apiService.get<PurchaseRequest>(`/purchase-requests/${id}`);
  }
}

export const purchaseRequestsApiService = new PurchaseRequestsApiService();