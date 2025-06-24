
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export type UserRole = 'admin' | 'commercial' | 'directeur_general' | 'directeur_commercial' | 'directeur_financier' | 'responsable_achat' | 'service_facturation' | 'logistique' | 'magasinier';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Actif' | 'En attente' | 'Terminé' | 'Annulé';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryProduct {
  name: string;
  quantity: number;
  date: string;
  comments?: string;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  projectId: string;
  project?: Project;
  projectName?: string;
  clientName?: string;
  customsReference?: string;
  deliveryDate: Date | string;
  plannedDeliveryDate: Date | string;
  deliveredBy: string;
  receivedBy: string;
  materialQuantity?: number;
  status: 'En attente' | 'En transit' | 'Livré' | 'Retardé';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  signature?: string;
  photos?: string[];
  driverName?: string;
  vehicleInfo?: string;
  deliveryAddress?: string;
  products?: DeliveryProduct[];
  actualDeliveryDate?: Date;
}

export interface ProjectRecord {
  id: string;
  projectNumber: string;
  customerName: string;
  projectAddress?: string;
  description: string;
  orderNumber?: string;
  orderDescription?: string;
  pricedBy?: string;
  quantity?: number;
  orderAmount?: number;
  price?: number;
  expectedSalesCoefficient?: number;
  effectiveSalesCoefficient?: number;
  poundRate?: number;
  dollarRate?: number;
  transportAmount?: number;
  paymentMethod?: 'Espèces' | 'Chèque' | 'Virement' | 'Carte bancaire';
  expectedDeliveryDate?: Date;
  effectiveDeliveryDate?: Date;
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

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  products: PurchaseProduct[];
  totalAmount: number;
  status: 'Brouillon' | 'Confirmée' | 'Envoyée_Logistique' | 'En_Livraison' | 'Livrée' | 'Annulée';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  purchaseRequestId?: string;
  createdBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  sentToLogisticsBy?: string;
  sentToLogisticsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseProduct {
  name: string;
  quantity: number;
  estimatedPrice?: number;
}

export interface DirectorApproval {
  approved: boolean;
  comment?: string;
  approvedAt: string;
  directorName: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  projectName: string;
  commercialName: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
  requestedProducts: any[];
  totalEstimatedCost: number;
  deliveryDate?: string;
  estimationDate?: string;
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  status: 'En attente' | 'En cours d\'approbation' | 'Approuvée' | 'Rejetée' | 'Commandée' | 'Confirmée_Achat' | 'Envoyée_Logistique';
  notes?: string;
  rejectionReason?: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  sentToLogisticsBy?: string;
  sentToLogisticsAt?: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrderPdf?: string;
  purchaseOrderFile?: string;
  directorApprovals: {
    directeur_general?: DirectorApproval;
    directeur_commercial?: DirectorApproval;
    directeur_financier?: DirectorApproval;
  };
  approvals: Array<{
    userId: string;
    userName: string;
    userRole: string;
    approvedAt: string;
    notes?: string;
  }>;
  approvalCount: number;
  isFullyApproved: boolean;
  requiredApprovalsCount: number;
  requester?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  // Relations pour les bons de commande
  purchaseOrders?: PurchaseOrder[];
  // Ajoute le champ de suivi global issu du backend (calculé côté API)
  trackingStatus?: "À traiter" | "En traitement" | "Expédiée" | "Livrée" | "Annulée";
}