
import { apiService } from './api.service';
import { User, UserRole, ApiResponse } from '../types/entities';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthApiService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return apiService.post<User>('/auth/register', data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    return apiService.post<AuthResponse>('/auth/refresh');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.put<void>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>('/auth/profile', data);
  }
}

export const authApiService = new AuthApiService();
