
import { apiService } from './api.service';
import { ApiResponse } from '../types/entities';

export interface Delivery {
  id: string;
  deliveryNumber: string;
  projectName: string;
  clientName: string;
  commercialId?: string;
  deliveryAddress?: string;
  products: DeliveryProduct[];
  totalQuantity: number;
  deliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'Préparée' | 'En transit' | 'Livrée' | 'Annulée';
  driverName?: string;
  vehicleInfo?: string;
  signature?: string;
  notes?: string;
  source?: string; // Added source field
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  commercial?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DeliveryProduct {
  name: string;
  quantity: number;
  initialStock?: number;
  stockId?: string;
}

export interface CreateDeliveryData {
  projectName: string;
  clientName: string;
  commercialId?: string;
  deliveryAddress?: string;
  products: DeliveryProduct[];
  deliveryDate?: string;
  driverName?: string;
  vehicleInfo?: string;
  notes?: string;
  source?: string; // Added source field
}

export class DeliveriesApiService {
  // Get all deliveries
  async getDeliveries(): Promise<ApiResponse<Delivery[]>> {
    console.log('DeliveriesApiService: Getting deliveries');
    return apiService.get<Delivery[]>('/deliveries');
  }

  // Get delivery by ID
  async getDeliveryById(id: string): Promise<ApiResponse<Delivery>> {
    console.log('DeliveriesApiService: Getting delivery by ID:', id);
    return apiService.get<Delivery>(`/deliveries/${id}`);
  }

  // Create new delivery
  async createDelivery(deliveryData: CreateDeliveryData): Promise<ApiResponse<Delivery>> {
    console.log('DeliveriesApiService: Creating delivery with data:', deliveryData);
    return apiService.post<Delivery>('/deliveries', deliveryData);
  }

  // Update delivery status
  async updateDeliveryStatus(id: string, status: string, signature?: string, actualDeliveryDate?: string): Promise<ApiResponse<Delivery>> {
    console.log('DeliveriesApiService: Updating delivery status:', id, status);
    return apiService.patch<Delivery>(`/deliveries/${id}/status`, { status, signature, actualDeliveryDate });
  }

  // Update delivery
  async updateDelivery(id: string, deliveryData: Partial<CreateDeliveryData>): Promise<ApiResponse<Delivery>> {
    console.log('DeliveriesApiService: Updating delivery:', id, deliveryData);
    return apiService.put<Delivery>(`/deliveries/${id}`, deliveryData);
  }

  // Delete delivery
  async deleteDelivery(id: string): Promise<ApiResponse<void>> {
    console.log('DeliveriesApiService: Deleting delivery:', id);
    return apiService.delete<void>(`/deliveries/${id}`);
  }
}

export const deliveriesApiService = new DeliveriesApiService();
