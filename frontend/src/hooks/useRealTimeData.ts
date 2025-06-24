
import { useState, useEffect, useCallback } from 'react';
import { socketService, SocketEvent } from '../services/socket.service';

export function useRealTimeData<T>(
  initialData: T[],
  events: {
    created?: SocketEvent;
    updated?: SocketEvent;
    deleted?: SocketEvent;
  }
) {
  const [data, setData] = useState<T[]>(initialData);

  const handleCreate = useCallback((newItem: T) => {
    setData(prevData => [newItem, ...prevData]);
  }, []);

  const handleUpdate = useCallback((updatedItem: T & { id: string }) => {
    setData(prevData => 
      prevData.map(item => 
        (item as any).id === updatedItem.id ? updatedItem : item
      )
    );
  }, []);

  const handleDelete = useCallback((deletedItem: { id: string }) => {
    setData(prevData => 
      prevData.filter(item => (item as any).id !== deletedItem.id)
    );
  }, []);

  useEffect(() => {
    // S'abonner aux événements WebSocket
    if (events.created) {
      socketService.on(events.created, handleCreate);
    }
    if (events.updated) {
      socketService.on(events.updated, handleUpdate);
    }
    if (events.deleted) {
      socketService.on(events.deleted, handleDelete);
    }

    // Nettoyer les listeners
    return () => {
      if (events.created) {
        socketService.off(events.created, handleCreate);
      }
      if (events.updated) {
        socketService.off(events.updated, handleUpdate);
      }
      if (events.deleted) {
        socketService.off(events.deleted, handleDelete);
      }
    };
  }, [events, handleCreate, handleUpdate, handleDelete]);

  return {
    data,
    setData,
    refreshData: setData
  };
}
