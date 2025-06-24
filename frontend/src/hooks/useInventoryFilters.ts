
import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity?: number;
  imageUrl?: string;
  location?: string;
  lastUpdated: string;
  status: string;
}

export const useInventoryFilters = (products: Product[]) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const getStockStatus = (quantity: number, minQuantity: number = 5) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minQuantity) return 'low-stock';
    return 'in-stock';
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by search term
      const matchesSearch = searchFilter === '' || 
        product.name.toLowerCase().includes(searchFilter.toLowerCase());

      // Filter by stock status
      const productStatus = getStockStatus(product.quantity, product.minQuantity);
      const matchesStatus = statusFilter === 'all' || statusFilter === productStatus;

      return matchesSearch && matchesStatus;
    });
  }, [products, statusFilter, searchFilter]);

  const stockCounts = useMemo(() => {
    const counts = {
      total: products.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0
    };

    products.forEach((product) => {
      const status = getStockStatus(product.quantity, product.minQuantity);
      switch (status) {
        case 'in-stock':
          counts.inStock++;
          break;
        case 'low-stock':
          counts.lowStock++;
          break;
        case 'out-of-stock':
          counts.outOfStock++;
          break;
      }
    });

    return counts;
  }, [products]);

  return {
    filteredProducts,
    statusFilter,
    setStatusFilter,
    searchFilter,
    setSearchFilter,
    stockCounts,
    getStockStatus
  };
};

export default useInventoryFilters;