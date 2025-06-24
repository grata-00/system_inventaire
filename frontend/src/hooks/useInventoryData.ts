
import { useState, useEffect } from 'react';
import { inventoryApiService, StockItem } from '../services/inventory.api.service';

interface Product {
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

export const useInventoryData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching inventory data from stocks API...');
      const response = await inventoryApiService.getStocks();
      
      if (response.success && response.data) {
        console.log('Raw stocks data received:', response.data);
        
        // Transform data with imageUrl support
        const transformedData = response.data
          .filter((item: StockItem) => item.material)
          .map((item: StockItem) => {
            console.log('Processing stock item:', item);
            
            return {
              id: item.id,
              name: item.material?.name || 'Unknown Material',
              quantity: item.quantity,
              lastUpdated: item.updatedAt || item.createdAt,
              status: item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.minQuantity ? 'Low Stock' : 'In Stock',
              image: item.material?.image,
              imageUrl: item.material?.imageUrl || item.material?.image, // Use imageUrl or fallback to image
              stockId: item.id,
              materialId: item.materialId,
              location: item.location,
              minQuantity: item.minQuantity,
              maxQuantity: item.maxQuantity
            };
          });
        
        console.log('Inventory data transformed:', transformedData);
        setProducts(transformedData);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Error loading data');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      
      if (err.response?.status === 500) {
        setError('Server error. Check that backend is running and configured correctly.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Check that backend is running.');
      } else {
        setError(err.message || 'Error loading data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchInventory
  };
};

export const useInventory = useInventoryData;
