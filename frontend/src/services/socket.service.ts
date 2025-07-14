
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public connect(url: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(url);

      this.socket.on('connect', () => {
        console.log(`Connected to ${url}`);
        resolve(this.socket as Socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from socket server');
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.log('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.log('Socket not initialized');
      return;
    }

    this.socket.off(event, callback);
  }

  public emit(event: string, data: any): void {
    if (!this.socket) {
      console.log('Socket not initialized');
      return;
    }

    this.socket.emit(event, data);
  }
}

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socketService = new SocketService();

socketService.connect(URL).catch(error => console.error('Socket connection error:', error));

export type SocketEvent = 
  | 'material_created' 
  | 'material_updated' 
  | 'material_deleted'
  | 'stock_created'
  | 'stock_updated'
  | 'stock_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted';
