import { User } from "./auth.service";
import { jsPDF } from "jspdf";

export type PurchaseRequestStatus = 
  | 'pending'       // En attente de validation
  | 'rejected'      // Rejetée par au moins un directeur
  | 'approved'      // Approuvée par tous les directeurs
  | 'processing'    // En cours de traitement par les achats
  | 'ordered'       // Bon de commande émis
  | 'delivered'     // Livrée
  | 'completed';    // Processus terminé

// Définir les statuts de livraison possibles
export type DeliveryStatus = 
  | 'pending'       // En attente
  | 'processing'    // En traitement
  | 'shipped'       // En livraison
  | 'delivered';    // Livrée

export interface Approval {
  directorId: string;
  directorName: string;
  directorRole: string;
  approved: boolean;
  signature?: string;
  comment?: string;
  date: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  productName: string;
  projectName: string;
  quantity: string;
  estimatedPrice: string;
  deliveryDate: Date;
  estimationDate: Date;
  status: PurchaseRequestStatus;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  // Approbations des directeurs
  approvals: {
    directeurGeneral?: Approval;
    directeurCommercial?: Approval;
    directeurFinancier?: Approval;
  };
  // Suivi des achats
  purchasing?: {
    assignedTo?: string;
    purchaseOrderNumber?: string;
    purchaseOrderFile?: string;
    purchaseDate?: string;
    comments?: string;
  };
  // Suivi des livraisons
  delivery?: {
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    deliveredBy?: string;
    deliveryNotes?: string;
    status?: DeliveryStatus;
    updatedBy?: string;
    updatedAt?: string;
  };
  // Notifications et historique
  history: {
    date: string;
    action: string;
    user: string;
    comment?: string;
  }[];
}

// Stockage local des demandes d'achat (simulé)
const PURCHASE_REQUESTS_KEY = 'systemair_purchase_requests';

// Récupérer toutes les demandes d'achat
export const getPurchaseRequests = (): PurchaseRequest[] => {
  const requests = localStorage.getItem(PURCHASE_REQUESTS_KEY);
  return requests ? JSON.parse(requests) : [];
};

// Enregistrer les demandes d'achat
const savePurchaseRequests = (requests: PurchaseRequest[]): void => {
  localStorage.setItem(PURCHASE_REQUESTS_KEY, JSON.stringify(requests));
};

// Créer une nouvelle demande d'achat
export const createPurchaseRequest = (data: {
  requestNumber: string;
  productName: string;
  projectName: string;
  quantity: string;
  estimatedPrice: string;
  deliveryDate: Date;
  estimationDate: Date;
  createdBy: {
    id: string;
    name: string;
  }
}, user: User): PurchaseRequest => {
  const requests = getPurchaseRequests();
  
  const now = new Date().toISOString();
  const newRequest: PurchaseRequest = {
    ...data,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    approvals: {},
    history: [
      {
        date: now,
        action: 'Création de la demande d\'achat',
        user: `${user.firstName} ${user.lastName}`
      }
    ]
  };
  
  requests.unshift(newRequest);
  savePurchaseRequests(requests);
  
  // Notification pour les directeurs et autres services concernés
  import("./projectRecord.service").then(({ createDirectorNotification, findProjectByName }) => {
    if (typeof createDirectorNotification === 'function') {
      // Notifier tous les directeurs
      createDirectorNotification(newRequest.id, newRequest.projectName, 'directeur_commercial');
      createDirectorNotification(newRequest.id, newRequest.projectName, 'directeur_general');
      createDirectorNotification(newRequest.id, newRequest.projectName, 'directeur_financier');
      
      // Notifier aussi le responsable d'achat de la nouvelle demande
      createDirectorNotification(newRequest.id, newRequest.projectName, 'responsable_achat');
      // Et le service logistique
      createDirectorNotification(newRequest.id, newRequest.projectName, 'logistique');
      
      // Si une fiche de projet existe, associer automatiquement la fiche au responsable achat
      if (typeof findProjectByName === 'function') {
        const projectRecord = findProjectByName(newRequest.projectName);
        if (projectRecord) {
          // Notifier le responsable achat de la disponibilité de la fiche projet
          createDirectorNotification(
            projectRecord.id, 
            `Fiche projet associée à la demande ${newRequest.requestNumber}`, 
            'responsable_achat'
          );
        }
      }
    }
  });
  
  return newRequest;
};

// Mettre à jour une demande d'achat existante
export const updatePurchaseRequest = (id: string, updates: Partial<PurchaseRequest>, user: User): PurchaseRequest | null => {
  const requests = getPurchaseRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;

  const now = new Date().toISOString();
  
  // Gérer spécifiquement les mises à jour du champ delivery
  let historyAction = 'Mise à jour de la demande';
  if (updates.delivery) {
    if (updates.delivery.status) {
      const statusText = 
        updates.delivery.status === 'pending' ? 'En attente' : 
        updates.delivery.status === 'processing' ? 'En traitement' : 
        updates.delivery.status === 'shipped' ? 'En livraison' :
        updates.delivery.status === 'delivered' ? 'Livrée' : 
        updates.delivery.status;
      
      historyAction = `Mise à jour du statut de livraison: ${statusText}`;
    }
  }
  
  const updatedRequest = {
    ...requests[index],
    ...updates,
    updatedAt: now,
    history: [
      ...requests[index].history,
      {
        date: now,
        action: historyAction,
        user: `${user.firstName} ${user.lastName}`
      }
    ]
  };
  
  requests[index] = updatedRequest;
  savePurchaseRequests(requests);
  
  return updatedRequest;
};

// Approuver ou rejeter une demande d'achat
export const reviewPurchaseRequest = (
  id: string, 
  user: User, 
  approved: boolean, 
  comment?: string
): PurchaseRequest | null => {
  const requests = getPurchaseRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const request = requests[index];
  
  // Déterminer quel type de directeur approuve
  let directorType: keyof PurchaseRequest['approvals'] | null = null;
  
  if (user.role === 'directeur_general') directorType = 'directeurGeneral';
  else if (user.role === 'directeur_commercial') directorType = 'directeurCommercial';
  else if (user.role === 'directeur_financier') directorType = 'directeurFinancier';
  
  if (!directorType) return null; // L'utilisateur n'est pas un directeur
  
  // Créer l'objet d'approbation avec signature
  const approval: Approval = {
    directorId: user.id,
    directorName: `${user.firstName} ${user.lastName}`,
    directorRole: user.role,
    approved,
    signature: approved ? getDirectorSignature(user.role) : undefined,
    comment: approved ? comment : comment || "Aucun commentaire fourni",
    date: now
  };
  
  // Mettre à jour les approbations
  const updatedApprovals = { ...request.approvals, [directorType]: approval };
  
  // Vérifier si toutes les approbations sont faites
  const allDirectorsApproved = 
    updatedApprovals.directeurGeneral?.approved === true && 
    updatedApprovals.directeurCommercial?.approved === true && 
    updatedApprovals.directeurFinancier?.approved === true;
  
  // Mettre à jour le statut en fonction des approbations
  let newStatus = request.status;
  
  if (!approved) {
    newStatus = 'rejected';
  } else if (allDirectorsApproved) {
    newStatus = 'approved';
    
    // Si la demande est approuvée par tous les directeurs, notifier le responsable d'achat et la logistique
    import("./projectRecord.service").then(({ createDirectorNotification }) => {
      if (typeof createDirectorNotification === 'function') {
        createDirectorNotification(request.id, request.projectName, 'responsable_achat');
        createDirectorNotification(request.id, request.projectName, 'logistique');
        createDirectorNotification(request.id, request.projectName, 'service_facturation');
        
        // Notifier aussi le commercial qui a créé la demande
        createDirectorNotification(request.id, request.projectName, 'commercial');
      }
    });
  }
  
  // Ajouter à l'historique
  const action = approved 
    ? `Demande approuvée par ${user.firstName} ${user.lastName} (${translateRole(user.role)})`
    : `Demande rejetée par ${user.firstName} ${user.lastName} (${translateRole(user.role)})`;
  
  const updatedRequest: PurchaseRequest = {
    ...request,
    approvals: updatedApprovals,
    status: newStatus,
    updatedAt: now,
    history: [
      ...request.history,
      {
        date: now,
        action,
        user: `${user.firstName} ${user.lastName}`,
        comment
      }
    ]
  };
  
  requests[index] = updatedRequest;
  savePurchaseRequests(requests);
  
  return updatedRequest;
};

// Ajouter un bon de commande
export const addPurchaseOrder = (
  id: string, 
  user: User, 
  orderDetails: { 
    purchaseOrderNumber: string;
    purchaseOrderFile?: string;
  }
): PurchaseRequest | null => {
  const requests = getPurchaseRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const request = requests[index];
  
  const updatedRequest: PurchaseRequest = {
    ...request,
    status: 'ordered',
    purchasing: {
      ...request.purchasing,
      assignedTo: user.id,
      purchaseOrderNumber: orderDetails.purchaseOrderNumber,
      purchaseOrderFile: orderDetails.purchaseOrderFile,
      purchaseDate: now,
    },
    updatedAt: now,
    history: [
      ...request.history,
      {
        date: now,
        action: `Bon de commande ajouté: ${orderDetails.purchaseOrderNumber}`,
        user: `${user.firstName} ${user.lastName}`,
      }
    ]
  };
  
  requests[index] = updatedRequest;
  savePurchaseRequests(requests);
  
  // Créer une notification pour tous les services concernés
  import("./projectRecord.service").then(({ createOrderNotification }) => {
    // Notifier la logistique avec les détails précis du bon de commande
    createOrderNotification(updatedRequest.id, updatedRequest.productName, 'logistique');
    
    // Notifier également le commercial qui a créé la demande et le service de facturation
    createOrderNotification(updatedRequest.id, updatedRequest.productName, 'commercial');
    createOrderNotification(updatedRequest.id, updatedRequest.productName, 'service_facturation');
  });
  
  return updatedRequest;
};

// Mettre à jour la livraison
export const updateDelivery = (
  id: string, 
  user: User, 
  deliveryDetails: {
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    deliveryNotes?: string;
    status?: DeliveryStatus;
  }
): PurchaseRequest | null => {
  const requests = getPurchaseRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const request = requests[index];
  
  // Déterminer le nouveau statut
  let newStatus = request.status;
  if (deliveryDetails.actualDeliveryDate) {
    newStatus = 'delivered';
  }
  
  const updatedRequest: PurchaseRequest = {
    ...request,
    status: newStatus,
    delivery: {
      ...request.delivery,
      expectedDeliveryDate: deliveryDetails.expectedDeliveryDate || request.delivery?.expectedDeliveryDate,
      actualDeliveryDate: deliveryDetails.actualDeliveryDate,
      deliveredBy: deliveryDetails.actualDeliveryDate ? user.id : request.delivery?.deliveredBy,
      deliveryNotes: deliveryDetails.deliveryNotes || request.delivery?.deliveryNotes,
      status: deliveryDetails.status || request.delivery?.status,
      updatedBy: `${user.firstName} ${user.lastName}`,
      updatedAt: now
    },
    updatedAt: now,
    history: [
      ...request.history,
      {
        date: now,
        action: deliveryDetails.actualDeliveryDate 
          ? 'Livraison effectuée' 
          : deliveryDetails.status
            ? `Statut de livraison mis à jour: ${translateDeliveryStatus(deliveryDetails.status)}`
            : 'Mise à jour des informations de livraison',
        user: `${user.firstName} ${user.lastName}`,
        comment: deliveryDetails.deliveryNotes
      }
    ]
  };
  
  requests[index] = updatedRequest;
  savePurchaseRequests(requests);
  
  return updatedRequest;
};

// Finaliser une demande
export const completePurchaseRequest = (id: string, user: User): PurchaseRequest | null => {
  const requests = getPurchaseRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const request = requests[index];
  
  const updatedRequest: PurchaseRequest = {
    ...request,
    status: 'completed',
    updatedAt: now,
    history: [
      ...request.history,
      {
        date: now,
        action: 'Demande d\'achat complètement traitée',
        user: `${user.firstName} ${user.lastName}`
      }
    ]
  };
  
  requests[index] = updatedRequest;
  savePurchaseRequests(requests);
  
  return updatedRequest;
};

// Supprimer une demande d'achat
export const deletePurchaseRequest = (id: string): boolean => {
  const requests = getPurchaseRequests();
  const filteredRequests = requests.filter(r => r.id !== id);
  
  if (filteredRequests.length === requests.length) {
    return false; // Aucune demande n'a été supprimée
  }
  
  savePurchaseRequests(filteredRequests);
  return true;
};

// Traduire le statut en français
export const translateStatus = (status: PurchaseRequestStatus): string => {
  const translations: Record<PurchaseRequestStatus, string> = {
    pending: 'En attente',
    rejected: 'Rejetée',
    approved: 'Approuvée',
    processing: 'En traitement',
    ordered: 'Commandée',
    delivered: 'Livrée',
    completed: 'Terminée'
  };
  
  return translations[status] || status;
};

// Traduire le statut de livraison en français
export const translateDeliveryStatus = (status: DeliveryStatus): string => {
  const translations: Record<DeliveryStatus, string> = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'En livraison',
    delivered: 'Livrée'
  };
  
  return translations[status] || status;
};

// Fonction utilitaire pour traduire les rôles (copiée de auth.service.ts)
function translateRole(role: string): string {
  const translations: Record<string, string> = {
    admin: 'Administrateur',
    commercial: 'Commercial',
    magasinier: 'Magasinier',
    directeur_general: 'Directeur Général',
    directeur_commercial: 'Directeur Commercial',
    directeur_financier: 'Directeur Financier',
    logistique: 'Logistique',
    responsable_achat: 'Responsable d\'Achat',
    service_facturation: 'Service Facturation'
  };
  
  return translations[role] || role;
}

// Fonction utilitaire pour obtenir l'image de signature d'un directeur
function getDirectorSignature(role: string): string {
  switch(role) {
    case 'directeur_general':
      return '/lovable-uploads/e524a823-1486-4e8f-a58b-d389c8b69000.png';
    case 'directeur_commercial':
      return '/lovable-uploads/bedc4e64-8637-4b49-8488-8a8168a67b3b.png';
    case 'directeur_financier':
      return '/lovable-uploads/e8e1c693-ce9b-4997-ad9c-3ebc8909a608.png';
    default:
      return '';
  }
}

// Génération d'un PDF pour la demande d'achat approuvée
export const generateApprovedRequestPDF = (request: PurchaseRequest): string => {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Configurer la police et les couleurs
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(26, 82, 118); // Couleur bleue pour le titre

    // En-tête du document
    doc.text("SYSTEMAIR - DEMANDE D'ACHAT", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`N° ${request.requestNumber}`, 105, 30, { align: "center" });

    doc.setTextColor(0, 0, 0); // Noir pour le texte standard
    doc.setFontSize(11);

    // Détails de la demande
    doc.setFont("helvetica", "bold");
    doc.text("Détails de la Demande", 20, 45);
    doc.setFont("helvetica", "normal");

    const detailsY = 55;
    doc.text(`Produit: ${request.productName}`, 20, detailsY);
    doc.text(`Projet: ${request.projectName}`, 20, detailsY + 7);
    doc.text(`Quantité: ${request.quantity}`, 20, detailsY + 14);
    doc.text(`Prix estimé: ${request.estimatedPrice} €`, 20, detailsY + 21);
    doc.text(`Date de livraison souhaitée: ${new Date(request.deliveryDate).toLocaleDateString('fr-FR')}`, 20, detailsY + 28);
    doc.text(`Date d'estimation: ${new Date(request.estimationDate).toLocaleDateString('fr-FR')}`, 20, detailsY + 35);
    doc.text(`Créé par: ${request.createdBy.name} (Commercial)`, 20, detailsY + 42);
    doc.text(`Date de création: ${new Date(request.createdAt).toLocaleDateString('fr-FR')}`, 20, detailsY + 49);

    doc.setFont("helvetica", "italic");
    doc.text(`Commercial en charge: ${request.createdBy.name}`, 20, detailsY + 56);
    doc.setFont("helvetica", "normal");

    // Section des approbations
    doc.setFont("helvetica", "bold");
    doc.text("Approbations", 20, 125);
    doc.setFont("helvetica", "normal");

    // Créer une ligne horizontale pour séparer les sections
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 130, 190, 130);

    // Vérifier si des approbations sont présentes
    const hasApprovals = request.approvals.directeurGeneral || 
                         request.approvals.directeurFinancier || 
                         request.approvals.directeurCommercial;
    
    if (hasApprovals) {
      // Directeur Général
      if (request.approvals.directeurGeneral) {
        const dg = request.approvals.directeurGeneral;
        doc.setFont("helvetica", "bold");
        doc.text("Directeur Général", 40, 140);
        doc.setFont("helvetica", "normal");
        doc.text(dg.directorName || "", 40, 145);
        doc.text(dg.approved ? "Approuvé" : "Refusé", 40, 150);
        doc.text(new Date(dg.date).toLocaleDateString('fr-FR'), 40, 155);
        
        // Ajouter l'image de la signature du DG si elle existe et la demande est approuvée
        if (dg.signature && dg.approved) {
          try {
            doc.addImage(dg.signature, 'PNG', 40, 160, 40, 20);
          } catch (e) {
            console.error("Erreur lors de l'ajout de signature DG au PDF:", e);
          }
        }
      }

      // Directeur Financier
      if (request.approvals.directeurFinancier) {
        const df = request.approvals.directeurFinancier;
        doc.setFont("helvetica", "bold");
        doc.text("Directeur Financier", 100, 140);
        doc.setFont("helvetica", "normal");
        doc.text(df.directorName || "", 100, 145);
        doc.text(df.approved ? "Approuvé" : "Refusé", 100, 150);
        doc.text(new Date(df.date).toLocaleDateString('fr-FR'), 100, 155);
        
        // Ajouter l'image de la signature du DF si elle existe et la demande est approuvée
        if (df.signature && df.approved) {
          try {
            doc.addImage(df.signature, 'PNG', 100, 160, 40, 20);
          } catch (e) {
            console.error("Erreur lors de l'ajout de signature DF au PDF:", e);
          }
        }
      }

      // Directeur Commercial
      if (request.approvals.directeurCommercial) {
        const dc = request.approvals.directeurCommercial;
        doc.setFont("helvetica", "bold");
        doc.text("Directeur Commercial", 160, 140);
        doc.setFont("helvetica", "normal");
        doc.text(dc.directorName || "", 160, 145);
        doc.text(dc.approved ? "Approuvé" : "Refusé", 160, 150);
        doc.text(new Date(dc.date).toLocaleDateString('fr-FR'), 160, 155);
        
        // Ajouter l'image de la signature du DC si elle existe et la demande est approuvée
        if (dc.signature && dc.approved) {
          try {
            doc.addImage(dc.signature, 'PNG', 160, 160, 40, 20);
          } catch (e) {
            console.error("Erreur lors de l'ajout de signature DC au PDF:", e);
          }
        }
      }
    } else {
      doc.text("Aucune approbation n'a encore été enregistrée pour cette demande.", 20, 145);
    }
    
    // Informations sur le bon de commande, si disponible
    if (request.purchasing?.purchaseOrderNumber) {
      doc.setFont("helvetica", "bold");
      doc.text("Bon de commande", 20, 195);
      doc.setFont("helvetica", "normal");
      doc.text(`N° de bon de commande: ${request.purchasing.purchaseOrderNumber}`, 20, 205);
      doc.text(`Date d'émission: ${new Date(request.purchasing.purchaseDate || "").toLocaleDateString('fr-FR')}`, 20, 215);
    }

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Document officiel généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} par le système Systemair.`, 20, 270);
    doc.setFont("helvetica", "bold");
    doc.text("Ce document contient toutes les informations associées à la demande d'achat.", 20, 275);

    // Générer le PDF en utilisant output directement
    return doc.output('datauristring');
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw new Error(`Impossible de générer le PDF: ${error instanceof Error ? error.message : 'erreur inconnue'}`);
  }
};

// Vérifier si l'utilisateur a des notifications non lues
export const hasUnreadNotifications = (user: User): boolean => {
  if (!['responsable_achat', 'directeur_commercial', 'logistique', 'service_facturation', 'commercial'].includes(user.role)) return false;
  
  const requests = getPurchaseRequests();
  
  // Pour le responsable achat, montrer les demandes approuvées qui n'ont pas été traitées
  if (user.role === 'responsable_achat') {
    return requests.some(r => r.status === 'approved');
  }
  
  // Pour le directeur commercial, montrer les demandes en attente qui n'ont pas son approbation
  if (user.role === 'directeur_commercial') {
    return requests.some(r => 
      r.status === 'pending' && 
      !r.approvals.directeurCommercial
    );
  }
  
  // Pour la logistique, montrer les demandes avec bon de commande
  if (user.role === 'logistique') {
    return requests.some(r => r.status === 'ordered');
  }
  
  // Pour le service facturation, montrer les demandes approuvées
  if (user.role === 'service_facturation') {
    return requests.some(r => r.status === 'approved' || r.status === 'ordered');
  }
  
  // Pour les commerciaux, montrer les demandes approuvées ou rejetées qu'ils ont créées
  if (user.role === 'commercial') {
    return requests.some(r => 
      (r.status === 'approved' || r.status === 'rejected') && 
      r.createdBy.id === user.id
    );
  }
  
  return false;
};
