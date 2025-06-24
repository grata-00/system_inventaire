
import { useState, useEffect } from 'react';
import { notificationsApiService, Notification } from '../services/notifications.api.service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching notifications...');
      const response = await notificationsApiService.getNotifications();
      
      if (response.success && response.data) {
        console.log('Notifications received:', response.data);
        setNotifications(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des notifications');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError(err.message || 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      console.log('Marking notification as read:', id);
      const response = await notificationsApiService.markAsRead(id);
      
      if (response.success) {
        console.log('Notification marked as read successfully');
        await fetchNotifications();
        return response;
      } else {
        console.error('Mark as read error:', response.error);
        setError(response.error || 'Erreur lors du marquage de la notification');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors du marquage de la notification:', err);
      setError(err.message || 'Erreur lors du marquage de la notification');
      return { success: false, error: err.message };
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      const response = await notificationsApiService.markAllAsRead();
      
      if (response.success) {
        console.log('All notifications marked as read successfully');
        await fetchNotifications();
        return response;
      } else {
        console.error('Mark all as read error:', response.error);
        setError(response.error || 'Erreur lors du marquage de toutes les notifications');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
      setError(err.message || 'Erreur lors du marquage de toutes les notifications');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
