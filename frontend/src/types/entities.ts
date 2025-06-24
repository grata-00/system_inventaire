export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'commercial' | 'directeur_general' | 'directeur_commercial' | 'directeur_financier' | 'responsable_achat' | 'service_facturation' | 'logistique' | 'magasinier' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'commercial' | 'directeur_general' | 'directeur_commercial' | 'directeur_financier' | 'responsable_achat' | 'service_facturation' | 'logistique' | 'magasinier' | 'user';

export interface Material {
  id: string;
  name: string;
  quantity: number;
  restockDate: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
}

export interface Stock {
  id: string;
  materialId: string;
  quantity: number;
  location: string;
  minQuantity: number;
  maxQuantity: number;
  lastUpdated: string;
  createdBy: string;
  updatedBy: string;
  material?: Material;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  lastUpdated: string;
  status: 'en_stock' | 'stock_limite' | 'rupture_stock';
  image?: string;
  imageUrl?: string;
  stockId?: string;
  materialId?: string;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface ProjectRecord {
  id: string;
  projectNumber: string;
  customerName: string;
  projectName: string;
  clientName: string;
  commercialName: string;
  projectAddress?: string;
  description: string;
  orderNumber?: string;
  orderDescription?: string;
  pricedBy?: string;
  quantity?: string | number;
  orderAmount?: number;
  price?: number;
  expectedSalesCoefficient?: number;
  effectiveSalesCoefficient?: number;
  poundRate?: number;
  dollarRate?: number;
  transportAmount?: number;
  paymentMethod?: 'Espèces' | 'Chèque' | 'Virement' | 'Carte bancaire' | 'virement' | 'cheque' | 'en_compte' | 'espece';
  expectedDeliveryDate?: Date;
  effectiveDeliveryDate?: Date | string;
  remarks?: string;
  status: 'En cours' | 'Terminé' | 'En attente' | 'Annulé';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  clientName?: string;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  records?: ProjectRecord[];
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  requester?: User;
  approver?: User;
}

export interface PurchaseOrder {
  id: string;
  purchaseRequestId?: string;
  orderNumber: string;
  supplier: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  purchaseRequest?: PurchaseRequest;
}

export interface Delivery {
  id: string;
  purchaseOrderId?: string;
  deliveryNumber: string;
  supplier: string;
  items: DeliveryItem[];
  deliveryDate: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  purchaseOrder?: PurchaseOrder;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  condition?: 'new' | 'used' | 'damaged';
}

export interface StockMovement {
  id: string;
  materialId: string;
  quantity: number;
  movement: 'Entrée' | 'Sortie' | 'Ajustement';
  location?: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
  material?: Material;
  creator?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}