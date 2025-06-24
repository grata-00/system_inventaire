import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types/entities';

class ApiService {
  private api: AxiosInstance;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 50;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 60000,
      withCredentials: false,
    });

    // Request interceptor with rate limiting
    this.api.interceptors.request.use(
      (config) => {
        // Reset counter every minute
        const now = Date.now();
        if (now - this.lastResetTime > 60000) {
          this.requestCount = 0;
          this.lastResetTime = now;
        }

        // Check if we're hitting rate limits
        if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
          console.warn('Rate limit approaching, delaying request...');
          return new Promise(resolve => {
            setTimeout(() => resolve(config), 1000);
          });
        }

        this.requestCount++;

        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url} (${this.requestCount}/${this.MAX_REQUESTS_PER_MINUTE})`);
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response received for ${response.config.url}:`, response.status);
        return response;
      },
      (error) => {
        console.error('Response interceptor error:', error);
        
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error - possible CORS issue or backend not running');
        }

        if (error.response?.status === 429) {
          console.warn('Rate limit hit, backing off...');
          // Add exponential backoff for 429 errors
          const delay = Math.min(1000 * Math.pow(2, this.requestCount % 5), 10000);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              // Retry the request
              this.api.request(error.config).then(resolve).catch(reject);
            }, delay);
          });
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing backend connection...');
      const response = await this.api.get('/test');
      console.log('Backend connection successful:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Backend connection failed - Check if backend is running and CORS is configured');
      console.error('Expected backend URL:', this.api.defaults.baseURL);
      return false;
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error: any) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error: any) {
      console.error(`PATCH ${url} error:`, error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error: any) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  }

  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return response.data;
    } catch (error: any) {
      console.error(`GET paginated ${url} error:`, error);
      throw error;
    }
  }

  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<ApiResponse<T>> {
    try {
      console.log('Uploading file:', file.name, 'to:', url);
      
      const formData = new FormData();
      formData.append('image', file);
      
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('File upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();