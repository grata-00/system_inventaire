import { apiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../types/entities';

export interface StockItem {
  id: string;
  materialId: string;
  quantity: number;
  location?: string;
  minQuantity: number;
  maxQuantity?: number;
  lastMovement?: 'Entrée' | 'Sortie' | 'Ajustement';
  lastMovementDate?: string;
  lastMovementQuantity?: number;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  material?: {
    id: string;
    name: string;
    image?: string;
    imageUrl?: string; // Add imageUrl property
    restockDate?: string;
  };
  updater?: {
    firstName: string;
    lastName: string;
  };
}

export interface StockMovement {
  materialId: string;
  quantity: number;
  movement: 'Entrée' | 'Sortie' | 'Ajustement';
  location?: string;
}

export interface InventoryFilters {
  search?: string;
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  page?: number;
  limit?: number;
}

export class InventoryApiService {
  // Récupérer tous les stocks
  async getStocks(filters?: InventoryFilters): Promise<ApiResponse<StockItem[]>> {
    console.log('InventoryApiService: Getting stocks with filters:', filters);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/stocks${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<StockItem[]>(endpoint);
      console.log('InventoryApiService: Stocks response:', response);
      return response;
    } catch (error) {
      console.error('InventoryApiService: Error getting stocks:', error);
      throw error;
    }
  }

  // Récupérer un stock par ID
  async getStockById(id: string): Promise<ApiResponse<StockItem>> {
    console.log('InventoryApiService: Getting stock by ID:', id);
    return apiService.get<StockItem>(`/stocks/${id}`);
  }

  // Créer un nouveau stock
  async createStock(stockData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StockItem>> {
    console.log('InventoryApiService: Creating stock:', stockData);
    return apiService.post<StockItem>('/stocks', stockData);
  }

  // Mettre à jour un stock - fix signature to match usage
  async updateStock(materialId: string, quantity: number, movement?: 'Entrée' | 'Sortie' | 'Ajustement'): Promise<ApiResponse<StockItem>> {
    console.log('InventoryApiService: Updating stock:', { materialId, quantity, movement });
    return apiService.post<StockItem>('/stocks/movement', { materialId, quantity, movement });
  }

  // Supprimer un stock
  async deleteStock(id: string): Promise<ApiResponse<void>> {
    console.log('InventoryApiService: Deleting stock:', id);
    return apiService.delete<void>(`/stocks/${id}`);
  }

  // Effectuer un mouvement de stock
  async createStockMovement(movement: StockMovement): Promise<ApiResponse<StockItem>> {
    console.log('InventoryApiService: Creating stock movement:', movement);
    return apiService.post<StockItem>('/stocks/movement', movement);
  }

  // Add processDelivery method
  async processDelivery(deliveryId: string, products: Array<{ stockId: string; quantity: number }>): Promise<ApiResponse<any>> {
    console.log('InventoryApiService: Processing delivery:', { deliveryId, products });
    return apiService.post<any>(`/deliveries/${deliveryId}/process`, { products });
  }

  // Récupérer l'historique des mouvements
  async getStockMovements(materialId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = materialId ? `/stocks/movements/${materialId}` : '/stocks/movements';
    console.log('InventoryApiService: Getting stock movements from:', endpoint);
    return apiService.get<any[]>(endpoint);
  }

  // Vérifier les stocks faibles
  async getLowStocks(): Promise<ApiResponse<StockItem[]>> {
    console.log('InventoryApiService: Getting low stocks');
    return apiService.get<StockItem[]>('/stocks/low');
  }

  // Exporter les données d'inventaire
  async exportInventory(format: 'csv' | 'xlsx' = 'csv'): Promise<ApiResponse<Blob>> {
    console.log('InventoryApiService: Exporting inventory in format:', format);
    return apiService.get<Blob>(`/stocks/export?format=${format}`);
  }
}

export const inventoryApiService = new InventoryApiService();
