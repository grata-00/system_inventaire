
// import { PurchaseRequest, PurchaseOrder } from "@/types/entities";

// /**
//  * Calcule le statut global de suivi achat/logistique selon la logique métier.
//  * Se base sur le statut du dernier bon de commande.
//  */
// export function getSuiviStatutAchat(
//   request: Pick<PurchaseRequest, "status" | "purchaseOrders" | "rejectionReason">
// ): "À traiter" | "En traitement" | "Expédiée" | "Livrée" | "Annulée" {
//   if (request.status === "Rejetée") return "Annulée";
//   if (request.status === "En attente" || request.status === "En cours d'approbation") return "À traiter";
//   if (request.status === "Approuvée") return "En traitement";
//   if (request.purchaseOrders && request.purchaseOrders.length) {
//     const latestOrder: PurchaseOrder = [...request.purchaseOrders].sort(
//       (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//     )[0];

//     switch (latestOrder.status) {
//       case "Brouillon":
//       case "Confirmée":
//         return "En traitement";
//       case "Envoyée_Logistique":
//       case "En_Livraison":
//         return "Expédiée";
//       case "Livrée":
//         return "Livrée";
//       case "Annulée":
//         return "Annulée";
//       default:
//         return "En traitement";
//     }
//   }
//   // fallback
//   return "À traiter";
// }

// export function getTrackingStatusBadgeColor(status: string) {
//   switch (status) {
//     case 'À traiter':
//       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     case 'En traitement':
//       return 'bg-blue-100 text-blue-800 border-blue-200';
//     case 'Expédiée':
//       return 'bg-purple-100 text-purple-800 border-purple-200';
//     case 'Livrée':
//       return 'bg-green-100 text-green-800 border-green-200';
//     case 'Annulée':
//       return 'bg-red-100 text-red-800 border-red-200';
//     default:
//       return 'bg-gray-100 text-gray-800 border-gray-200';
//   }
// }

import { PurchaseRequest } from "@/services/purchase-requests.api.service";
import { PurchaseOrderData } from "@/services/purchase-orders.api.service";

/**
 * Calcule le statut global de suivi achat/logistique selon la logique métier.
 * Se base sur le statut du dernier bon de commande.
 */
export function getSuiviStatutAchat(
  request: Pick<PurchaseRequest, "status" | "rejectionReason"> & { purchaseOrders?: PurchaseOrderData[] }
): "À traiter" | "En traitement" | "Expédiée" | "Livrée" | "Annulée" {
  if (request.status === "Rejetée") return "Annulée";
  if (request.status === "En attente" || request.status === "En cours d'approbation") return "À traiter";
  if (request.status === "Approuvée") return "En traitement";
  if (request.purchaseOrders && request.purchaseOrders.length > 0) {
    const latestOrder: PurchaseOrderData = [...request.purchaseOrders].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    switch (latestOrder.status) {
      case "Brouillon":
      case "Confirmée":
        return "En traitement";
      case "Envoyée_Logistique":
      case "En_Livraison":
        return "Expédiée";
      case "Livrée":
        return "Livrée";
      case "Annulée":
        return "Annulée";
      default:
        return "En traitement";
    }
  }
  // fallback
  return "À traiter";
}

export function getTrackingStatusBadgeColor(status: string) {
  switch (status) {
    case 'À traiter':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'En traitement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Expédiée':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Livrée':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Annulée':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}