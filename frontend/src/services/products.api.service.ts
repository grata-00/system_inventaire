
import { apiService } from './api.service';
import { Product, ApiResponse, PaginatedResponse } from '../types/entities';

export class ProductsApiService {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<PaginatedResponse<Product>> {
    return apiService.getPaginated<Product>('/products', params);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`/products/${id}`);
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, image?: File): Promise<ApiResponse<Product>> {
    if (image) {
      return apiService.uploadFile('/products', image, productData);
    }
    return apiService.post<Product>('/products', productData);
  }

  async updateProduct(id: string, productData: Partial<Product>, image?: File): Promise<ApiResponse<Product>> {
    if (image) {
      return apiService.uploadFile(`/products/${id}`, image, productData);
    }
    return apiService.put<Product>(`/products/${id}`, productData);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/products/${id}`);
  }

  async updateStock(id: string, quantity: number): Promise<ApiResponse<Product>> {
    return apiService.put<Product>(`/products/${id}/stock`, { quantity });
  }
}

export const productsApiService = new ProductsApiService();
