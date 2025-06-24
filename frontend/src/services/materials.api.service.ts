
import { apiService } from './api.service';
import { Material, ApiResponse, PaginatedResponse } from '../types/entities';

export interface CreateMaterialData {
  name: string;
  quantity: number;
  restockDate: string;
}

export type { Material };

export class MaterialsApiService {
  async getMaterials(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Material>> {
    console.log('MaterialsApiService: Getting materials with params:', params);
    return apiService.getPaginated<Material>('/materials', params);
  }

  async getMaterialById(id: string): Promise<ApiResponse<Material>> {
    console.log('MaterialsApiService: Getting material by ID:', id);
    return apiService.get<Material>(`/materials/${id}`);
  }

  async createMaterial(materialData: CreateMaterialData, imageFile?: File): Promise<ApiResponse<Material>> {
    try {
      console.log('MaterialsApiService: Creating material:', materialData, 'with image:', !!imageFile);
      
      if (imageFile) {
        // Upload with image file
        const response = await apiService.uploadFile<Material>('/materials', imageFile, materialData);
        console.log('MaterialsApiService: Create with image response:', response);
        return response;
      } else {
        // Create without image
        const response = await apiService.post<Material>('/materials', materialData);
        console.log('MaterialsApiService: Create without image response:', response);
        return response;
      }
    } catch (error: any) {
      console.error('MaterialsApiService: Create material error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateMaterial(id: string, materialData: Partial<CreateMaterialData>, imageFile?: File): Promise<ApiResponse<Material>> {
    try {
      console.log('MaterialsApiService: Updating material:', id, materialData, 'with image:', !!imageFile);
      
      if (imageFile) {
        const response = await apiService.uploadFile<Material>(`/materials/${id}`, imageFile, materialData);
        console.log('MaterialsApiService: Update with image response:', response);
        return response;
      } else {
        const response = await apiService.put<Material>(`/materials/${id}`, materialData);
        console.log('MaterialsApiService: Update without image response:', response);
        return response;
      }
    } catch (error: any) {
      console.error('MaterialsApiService: Update material error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteMaterial(id: string): Promise<ApiResponse<void>> {
    try {
      console.log('MaterialsApiService: Deleting material:', id);
      const response = await apiService.delete<void>(`/materials/${id}`);
      console.log('MaterialsApiService: Delete response:', response);
      return response;
    } catch (error: any) {
      console.error('MaterialsApiService: Delete material error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const materialsApiService = new MaterialsApiService();
