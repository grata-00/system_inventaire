import { ProjectRecord } from "@/pages/ProjectRecords";
import jsPDF from 'jspdf';

// Stockage local des projets (simulé)
const PROJECTS_KEY = 'systemair_projects';
const PROJECT_NOTIFICATIONS_KEY = 'systemair_project_notifications';
const DELIVERY_DETAILS_KEY = 'systemair_delivery_details';
const DELIVERIES_KEY = 'systemair_deliveries';
const INVENTORY_KEY = 'systemair_inventory';

// Type pour la signature
interface DeliverySignature {
  name: string;
  date: string;
  comments: string;
}

// Type pour le produit d'inventaire
interface InventoryProduct {
  id: string;
  name: string;
  reference?: string;
  quantity: number;
  lastUpdated: string;
  updatedBy?: string;
}

// Récupérer tous les projets
export const getProjects = (): ProjectRecord[] => {
  const projects = localStorage.getItem(PROJECTS_KEY);
  return projects ? JSON.parse(projects) : [];
};

// Enregistrer les projets
export const saveProjects = (projects: ProjectRecord[]): void => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

// Trouver un projet par son nom
export const findProjectByName = (projectName: string): ProjectRecord | null => {
  const projects = getProjects();
  return projects.find(project => project.projectName === projectName) || null;
};

// Récupérer l'inventaire complet
export const getInventory = (): InventoryProduct[] => {
  const inventory = localStorage.getItem(INVENTORY_KEY);
  return inventory ? JSON.parse(inventory) : [];
};

// Sauvegarder l'inventaire
export const saveInventory = (inventory: InventoryProduct[]): void => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

// Mettre à jour le stock d'un produit
export const updateProductStock = (productName: string, quantityChange: number, user?: any): void => {
  const inventory = getInventory();
  const productIndex = inventory.findIndex(p => p.name === productName);
  
  if (productIndex >= 0) {
    // Le produit existe déjà dans l'inventaire, mettre à jour sa quantité
    inventory[productIndex].quantity += quantityChange;
    inventory[productIndex].lastUpdated = new Date().toISOString();
    if (user) inventory[productIndex].updatedBy = user.name || user.role;
  } else if (quantityChange > 0) {
    // Le produit n'existe pas encore dans l'inventaire, l'ajouter
    inventory.push({
      id: Date.now().toString(),
      name: productName,
      quantity: quantityChange,
      lastUpdated: new Date().toISOString(),
      updatedBy: user ? (user.name || user.role) : 'système'
    });
  }
  
  saveInventory(inventory);
};

// Récupérer toutes les livraisons
export const getDeliveries = (): any[] => {
  const deliveries = localStorage.getItem(DELIVERIES_KEY);
  return deliveries ? JSON.parse(deliveries) : [];
};

// Sauvegarder les livraisons
export const saveDeliveries = (deliveries: any[]): void => {
  localStorage.setItem(DELIVERIES_KEY, JSON.stringify(deliveries));
};

// Récupérer une livraison spécifique par ID
export const getDeliveryById = (deliveryId: string): any | null => {
  const deliveries = getDeliveries();
  return deliveries.find((delivery: any) => delivery.id === deliveryId) || null;
};

// Supprimer une livraison
export const deleteDelivery = (deliveryId: string): boolean => {
  try {
    const deliveries = getDeliveries();
    const updatedDeliveries = deliveries.filter((delivery: any) => delivery.id !== deliveryId);
    saveDeliveries(updatedDeliveries);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la livraison:', error);
    return false;
  }
};

// Générer un PDF à partir des données du projet
export const generateProjectPDF = (project: ProjectRecord): jsPDF => {
  // Créer une nouvelle instance PDF
  const doc = new jsPDF();
  
  // Ajouter le titre
  doc.setFontSize(20);
  doc.text("SYSTEMAIR - FICHE PROJET", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Ajouter le nom du projet
  doc.setFontSize(16);
  doc.text(project.projectName, doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
  // Ajouter une ligne
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, doc.internal.pageSize.width - 20, 35);

  // Information du projet
  doc.setFontSize(14);
  doc.text("Informations du Projet", 20, 45);
  
  // Détails du projet en tableau
  doc.setFontSize(10);
  doc.text("N° de commande:", 20, 55);
  doc.text(project.orderNumber, 80, 55);
  doc.text("Commercial:", 20, 65);
  doc.text(project.commercialName, 80, 65);
  doc.text("Chiffré par:", 20, 75);
  doc.text(project.pricedBy, 80, 75);
  doc.text("Client:", 20, 85);
  doc.text(project.clientName, 80, 85);
  doc.text("Quantité:", 20, 95);
  doc.text(project.quantity || "0", 80, 95);
  doc.text("Désignation:", 20, 105);
  doc.text(project.orderDescription, 80, 105);
  
  // Informations financières
  doc.setFontSize(14);
  doc.text("Détails Financiers", 20, 120);
  
  doc.setFontSize(10);
  doc.text("Montant commande:", 20, 130);
  doc.text(`${project.orderAmount} €`, 80, 130);
  doc.text("Prix:", 20, 140);
  doc.text(`${project.price} €`, 80, 140);
  doc.text("Coefficient vente prévisionnel:", 20, 150);
  doc.text(project.expectedSalesCoefficient, 80, 150);
  doc.text("Coefficient vente effectif:", 20, 160);
  doc.text(project.effectiveSalesCoefficient, 80, 160);
  doc.text("Transport:", 20, 170);
  doc.text(`${project.transportAmount} €`, 80, 170);
  
  // Autres informations
  doc.setFontSize(14);
  doc.text("Autres Informations", 20, 185);
  
  doc.setFontSize(10);
  doc.text("Modalité de paiement:", 20, 195);
  const paymentMethod = project.paymentMethod ?? 'Non défini';
  const paymentMethodText = paymentMethod === 'virement' ? 'Virement' : 
                           paymentMethod === 'cheque' ? 'Chèque' :
                           paymentMethod === 'en_compte' ? 'En compte' : 
                           paymentMethod === 'espece' ? 'Espèce' : 'Non défini';
  doc.text(paymentMethodText, 80, 195);
  doc.text("Date de livraison:", 20, 205);
  doc.text(project.effectiveDeliveryDate, 80, 205);
  
  // Remarques
  if (project.remarks) {
    doc.setFontSize(14);
    doc.text("Remarques", 20, 220);
    doc.setFontSize(10);
    doc.text(project.remarks, 20, 230);
  }
  
  // Pied de page
  doc.setFontSize(8);
  doc.text(`Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} par le système Systemair.`, doc.internal.pageSize.width / 2, 280, { align: 'center' });
  
  return doc;
};

// Créer une notification pour le service de facturation et responsable d'achat
export const createBillingNotification = (projectId: string, projectName: string, commercialName?: string): void => {
  const notifications = getNotifications();
  
  // Créer notification pour le responsable d'achat
  const notificationForPurchasing = {
    id: Date.now().toString() + '_purchasing',
    type: 'new_project',
    projectId,
    projectName,
    commercialName,
    createdAt: new Date().toISOString(),
    read: false,
    target: 'responsable_achat',
    source: 'commercial'
  };
  
  // Créer notification pour le service facturation
  const notificationForBilling = {
    id: Date.now().toString() + '_billing',
    type: 'new_project',
    projectId,
    projectName,
    commercialName,
    createdAt: new Date().toISOString(),
    read: false,
    target: 'service_facturation',
    source: 'commercial'
  };
  
  notifications.unshift(notificationForPurchasing, notificationForBilling);
  saveNotifications(notifications);
};

// Créer une notification pour les directeurs ou autres rôles
export const createDirectorNotification = (requestId: string, projectName: string, targetRole: string): void => {
  const notifications = getNotifications();
  
  const newNotification = {
    id: Date.now().toString() + '_' + targetRole,
    type: 'new_request',
    requestId,
    projectName,
    createdAt: new Date().toISOString(),
    read: false,
    target: targetRole,
    source: 'commercial'
  };
  
  notifications.unshift(newNotification);
  saveNotifications(notifications);
};

// Créer une notification pour la livraison avec détails complets
export const createDeliveryNotification = (deliveryId: string, projectName: string, deliveryDetails: any = null): void => {
  const notifications = getNotifications();
  
  const newNotification = {
    id: Date.now().toString(),
    type: 'new_delivery',
    deliveryId,
    projectName,
    createdAt: new Date().toISOString(),
    read: false,
    target: 'logistique',
    source: 'service_facturation',
    deliveryDetailsId: deliveryId // Utiliser directement l'ID de livraison
  };
  
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  
  // Si des détails de livraison sont fournis, les enregistrer dans les livraisons
  if (deliveryDetails) {
    // Enregistrer les détails de stock initial pour chaque produit
    if (deliveryDetails.products && Array.isArray(deliveryDetails.products)) {
      deliveryDetails.products.forEach((product: any) => {
        if (!product.initialStock) {
          // Si le stock initial n'est pas défini, récupérer le stock actuel
          const inventory = getInventory();
          const existingProduct = inventory.find(p => p.name === product.name);
          product.initialStock = existingProduct ? existingProduct.quantity : 0;
        }
      });
    }
    
    // Enregistrer/mettre à jour la livraison dans le stockage principal des livraisons
    const deliveries = getDeliveries();
    const existingIndex = deliveries.findIndex((d: any) => d.id === deliveryId);
    
    if (existingIndex >= 0) {
      deliveries[existingIndex] = deliveryDetails;
    } else {
      deliveries.unshift(deliveryDetails);
    }
    
    saveDeliveries(deliveries);
  }
};

// Récupérer les détails de livraison
export const getDeliveryDetails = (): Record<string, any> => {
  const details = localStorage.getItem(DELIVERY_DETAILS_KEY);
  return details ? JSON.parse(details) : {};
};

// Récupérer les détails d'une livraison spécifique
export const getDeliveryDetailById = (deliveryDetailsId: string): any | null => {
  // D'abord chercher dans le stockage principal des livraisons
  const deliveries = getDeliveries();
  const delivery = deliveries.find((d: any) => d.id === deliveryDetailsId);
  if (delivery) return delivery;
  
  // Sinon chercher dans l'ancien stockage de détails
  const allDetails = getDeliveryDetails();
  return allDetails[deliveryDetailsId] || null;
};

// Créer une notification pour une nouvelle commande 
export const createOrderNotification = (purchaseRequestId: string, productName: string, targetRole: string = 'logistique', details?: any): void => {
  const notifications = getNotifications();
  
  const newNotification = {
    id: Date.now().toString() + '_' + targetRole,
    type: 'new_order',
    purchaseRequestId,
    productName,
    createdAt: new Date().toISOString(),
    read: false,
    target: targetRole,
    source: 'responsable_achat',
    ...(details && { details }) // Add details only if they exist
  };
  
  notifications.unshift(newNotification);
  saveNotifications(notifications);
};

// Mettre à jour le statut de livraison
export const updateDeliveryStatus = (deliveryId: string, newStatus: string, signature?: DeliverySignature) => {
  try {
    // Récupérer les livraisons existantes
    const deliveriesKey = 'systemair_deliveries';
    const storedDeliveries = localStorage.getItem(deliveriesKey);
    const deliveries = storedDeliveries ? JSON.parse(storedDeliveries) : [];
    
    // Mettre à jour le statut de la livraison correspondante
    const updatedDeliveries = deliveries.map((delivery: any) => {
      if (delivery.id === deliveryId) {
        const updatedDelivery = { 
          ...delivery, 
          status: newStatus,
          ...(signature && { signature }) // Ajouter la signature si fournie
        };
        
        // Si la livraison est marquée comme livrée, mettre à jour le stock
        if (newStatus === 'delivered' && delivery.products && Array.isArray(delivery.products)) {
          delivery.products.forEach((product: any) => {
            // Réduire le stock pour chaque produit livré
            updateProductStock(product.name, -product.quantity);
          });
        }
        
        return updatedDelivery;
      }
      return delivery;
    });
    
    // Sauvegarder les livraisons mises à jour
    localStorage.setItem(deliveriesKey, JSON.stringify(updatedDeliveries));
    
    // Notifier tous les services concernés du changement de statut
    notifyStatusChange(deliveryId, updatedDeliveries.find((d: any) => d.id === deliveryId)?.projectName || "Livraison", newStatus);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de livraison:', error);
    return false;
  }
};

// Notifier tous les services concernés d'un changement de statut
const notifyStatusChange = (deliveryId: string, projectName: string, status: string): void => {
  const notifications = getNotifications();
  
  // Créer des notifications pour tous les services concernés
  const targets = ['service_facturation', 'commercial', 'responsable_achat', 'logistique'];
  
  const newNotifications = targets.map(target => ({
    id: `status_${Date.now()}_${target}`,
    type: 'status_update',
    deliveryId,
    projectName,
    createdAt: new Date().toISOString(),
    read: false,
    target,
    source: 'logistique',
    status
  }));
  
  notifications.unshift(...newNotifications);
  saveNotifications(notifications);
};

// Récupérer toutes les notifications
export const getNotifications = (): any[] => {
  const notifications = localStorage.getItem(PROJECT_NOTIFICATIONS_KEY);
  return notifications ? JSON.parse(notifications) : [];
};

// Enregistrer les notifications
export const saveNotifications = (notifications: any[]): void => {
  localStorage.setItem(PROJECT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// Récupérer les notifications non lues pour un rôle spécifique
export const getUnreadNotifications = (role: string): any[] => {
  const notifications = getNotifications();
  return notifications.filter(n => n.target === role && !n.read);
};

// Marquer une notification comme lue
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updatedNotifications);
};

// Transférer le projet au responsable d'achat et service facturation avec détails
export const transferProjectWithPurchaseRequest = (projectId: string, projectName: string, commercialName: string): void => {
  createBillingNotification(projectId, projectName, commercialName);
};
