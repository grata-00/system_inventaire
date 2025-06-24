
import { inventoryApiService, StockItem } from './inventory.api.service';
import { materialsApiService, Material } from './materials.api.service';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  lastUpdated: string;
  status: string;
  image?: string;
  imageUrl?: string; // Add imageUrl property
  stockId?: string;
  materialId?: string;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

class InventoryService {
  async getInventory(): Promise<{ inventory: InventoryItem[], loading: boolean, error: string }> {
    try {
      console.log('InventoryService: Fetching inventory from stocks API...');
      const stocksResponse = await inventoryApiService.getStocks();
      
      if (stocksResponse.success && stocksResponse.data) {
        console.log('InventoryService: Stocks data received:', stocksResponse.data);
        
        // Transform stocks data to inventory items with imageUrl
        const inventoryItems = stocksResponse.data
          .filter((item: StockItem) => item.material)
          .map((item: StockItem) => {
            console.log('InventoryService: Processing stock item:', item);
            
            return {
              id: item.id,
              name: item.material?.name || 'Unknown Material',
              quantity: item.quantity,
              lastUpdated: item.updatedAt || item.createdAt,
              status: item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.minQuantity ? 'Low Stock' : 'In Stock',
              image: item.material?.image,
              imageUrl: item.material?.imageUrl, // Include imageUrl from backend
              stockId: item.id,
              materialId: item.materialId,
              location: item.location,
              minQuantity: item.minQuantity,
              maxQuantity: item.maxQuantity
            };
          });
        
        console.log('InventoryService: Inventory items transformed:', inventoryItems);
        
        return {
          inventory: inventoryItems,
          loading: false,
          error: ''
        };
      } else {
        console.error('InventoryService: API response error:', stocksResponse.error);
        return {
          inventory: [],
          loading: false,
          error: stocksResponse.error || 'Error loading inventory data'
        };
      }
    } catch (err: any) {
      console.error('InventoryService: Error fetching inventory:', err);
      return {
        inventory: [],
        loading: false,
        error: err.message || 'Error loading inventory data'
      };
    }
  }

  async updateStock(materialId: string, quantity: number, movement?: 'Entrée' | 'Sortie' | 'Ajustement') {
    try {
      console.log('InventoryService: Updating stock:', { materialId, quantity, movement });
      const response = await inventoryApiService.updateStock(materialId, quantity, movement);
      return response;
    } catch (error: any) {
      console.error('InventoryService: Error updating stock:', error);
      return { success: false, error: error.message };
    }
  }

  async processDelivery(deliveryId: string, products: Array<{ stockId: string; quantity: number }>) {
    try {
      console.log('InventoryService: Processing delivery:', { deliveryId, products });
      const response = await inventoryApiService.processDelivery(deliveryId, products);
      return response;
    } catch (error: any) {
      console.error('InventoryService: Error processing delivery:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteProduct(id: string) {
    try {
      console.log('InventoryService: Deleting material:', id);
      const response = await materialsApiService.deleteMaterial(id);
      return response;
    } catch (error: any) {
      console.error('InventoryService: Error deleting material:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProduct(id: string, productData: any) {
    try {
      console.log('InventoryService: Updating material:', id, productData);
      const response = await materialsApiService.updateMaterial(id, productData);
      return response;
    } catch (error: any) {
      console.error('InventoryService: Error updating material:', error);
      return { success: false, error: error.message };
    }
  }
}

export const inventoryService = new InventoryService();

// Update the useInventory hook to return inventory data
export const useInventory = () => {
  return {
    inventory: [],  // This will be replaced by the hook that actually fetches data
    getInventory: inventoryService.getInventory.bind(inventoryService),
    updateStock: inventoryService.updateStock.bind(inventoryService),
    processDelivery: inventoryService.processDelivery.bind(inventoryService),
    deleteProduct: inventoryService.deleteProduct.bind(inventoryService),
    updateProduct: inventoryService.updateProduct.bind(inventoryService)
  };
};
