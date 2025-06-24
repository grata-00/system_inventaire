import { apiService } from './api.service';
import { User, UserRole, ApiResponse, PaginatedResponse } from '../types/entities';

export class UsersApiService {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    try {
      console.log('Getting users with params:', params);
      
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<User[]>(endpoint);
      return response;
    } catch (error: any) {
      console.error('Error getting users:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    console.log('Getting user by ID:', id);
    return apiService.get<User>(`/users/${id}`);
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<ApiResponse<User>> {
    console.log('Creating user with data:', userData);
    return apiService.post<User>('/users', userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    console.log('Updating user:', id, userData);
    return apiService.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    console.log('Deleting user:', id);
    return apiService.delete<void>(`/users/${id}`);
  }

  async activateUser(id: string): Promise<ApiResponse<User>> {
    console.log('Activating user:', id);
    return apiService.patch<User>(`/users/${id}/activate`);
  }

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    console.log('Deactivating user:', id);
    return apiService.patch<User>(`/users/${id}/deactivate`);
  }

  async updateUserRole(id: string, role: UserRole): Promise<ApiResponse<User>> {
    console.log('Updating user role:', id, role);
    return apiService.patch<User>(`/users/${id}/role`, { role });
  }
}

export const usersApiService = new UsersApiService();
