
import { apiService } from './api.service';
import { ApiResponse } from '../types/entities';

export interface Notification {
  id: string;
  type: 'new_project' | 'new_delivery' | 'new_order' | 'status_update' | 'stock_alert' | 'user_action';
  title: string;
  message: string;
  targetRole?: string;
  targetUserId?: string;
  sourceId?: string;
  sourceType?: string;
  read: boolean;
  readAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateNotificationData {
  type: string;
  title: string;
  message: string;
  targetRole?: string;
  targetUserId?: string;
  sourceId?: string;
  sourceType?: string;
}

export class NotificationsApiService {
  // Récupérer toutes les notifications pour l'utilisateur connecté
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    console.log('NotificationsApiService: Getting notifications');
    return apiService.get<Notification[]>('/notifications');
  }

  // Marquer une notification comme lue
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    console.log('NotificationsApiService: Marking notification as read:', id);
    return apiService.patch<Notification>(`/notifications/${id}/read`);
  }

  // Créer une nouvelle notification (pour les admins)
  async createNotification(notificationData: CreateNotificationData): Promise<ApiResponse<Notification>> {
    console.log('NotificationsApiService: Creating notification:', notificationData);
    return apiService.post<Notification>('/notifications', notificationData);
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<ApiResponse<void>> {
    console.log('NotificationsApiService: Marking all notifications as read');
    return apiService.patch<void>('/notifications/mark-all-read');
  }

  // Supprimer une notification
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    console.log('NotificationsApiService: Deleting notification:', id);
    return apiService.delete<void>(`/notifications/${id}`);
  }
}

export const notificationsApiService = new NotificationsApiService();
