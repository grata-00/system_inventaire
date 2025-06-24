// import React from 'react';
// import { format } from "date-fns";
// import { fr } from 'date-fns/locale';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { FileText, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { getTrackingStatusBadgeColor } from "@/utils/getSuiviStatutAchat";

// const PurchaseRequestDetailView = ({ request, isPurchasingManager, onSendToLogistics }: any) => {
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'En attente':
//         return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
//       case 'En cours d\'approbation':
//         return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En cours d'approbation</Badge>;
//       case 'Approuvée':
//         return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>;
//       case 'Rejetée':
//         return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejetée</Badge>;
//       case 'Commandée':
//         return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Commandée</Badge>;
//       default:
//         return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
//     }
//   };

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return 'Non définie';
//     try {
//       return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
//     } catch (e) {
//       return 'Date invalide';
//     }
//   };

//   // Helper pour récupérer et valider requestedProducts comme tableau
//   const getRequestedProducts = () => {
//     if (Array.isArray(request.requestedProducts)) {
//       return request.requestedProducts;
//     }
//     // Si string JSON, essayer de parser
//     if (typeof request.requestedProducts === "string") {
//       try {
//         const parsed = JSON.parse(request.requestedProducts);
//         return Array.isArray(parsed) ? parsed : [];
//       } catch {
//         return [];
//       }
//     }
//     // Sinon pas exploitable
//     return [];
//   };

//   // Helper pour récupérer et valider approvals comme tableau
//   const getApprovals = () => {
//     if (Array.isArray(request.approvals)) {
//       return request.approvals;
//     }
//     if (typeof request.approvals === "string") {
//       try {
//         const parsed = JSON.parse(request.approvals);
//         return Array.isArray(parsed) ? parsed : [];
//       } catch {
//         return [];
//       }
//     }
//     return [];
//   };

//   const renderDirectorApprovals = () => {
//     if (!request.directorApprovals) return null;
    
//     let approvals = {};
//     try {
//       approvals = typeof request.directorApprovals === 'string' 
//         ? JSON.parse(request.directorApprovals) 
//         : request.directorApprovals;
//     } catch (e) {
//       return <p className="text-red-500">Erreur lors du chargement des approbations</p>;
//     }

//     return (
//       <div className="mt-4">
//         <h4 className="font-medium mb-2">Approbations des directeurs</h4>
//         <div className="space-y-2">
//           {Object.entries(approvals).map(([role, approval]: [string, any]) => {
//             if (!approval) return (
//               <div key={role} className="flex items-center">
//                 <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
//                 <span className="text-gray-500">{role}: En attente</span>
//               </div>
//             );
            
//             return (
//               <div key={role} className="flex items-center">
//                 {approval.approved ? (
//                   <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
//                 ) : (
//                   <XCircle className="h-4 w-4 text-red-500 mr-2" />
//                 )}
//                 <span className={approval.approved ? 'text-green-700' : 'text-red-700'}>
//                   {role}: {approval.approved ? 'Approuvé' : 'Rejeté'} par {approval.directorName}
//                   {approval.comment && ` - "${approval.comment}"`}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   const renderPurchaseOrderFile = () => {
//     if (!request.purchaseOrderFile) return null;
    
//     return (
//       <div className="mt-4">
//         <h4 className="font-medium mb-2">Bon de commande</h4>
//         <div className="flex items-center">
//           <FileText className="h-5 w-5 text-blue-500 mr-2" />
//           <a 
//             href={request.purchaseOrderFile} 
//             target="_blank" 
//             rel="noopener noreferrer"
//             className="text-blue-600 hover:underline flex items-center"
//           >
//             Voir le bon de commande
//             <Download className="h-4 w-4 ml-1" />
//           </a>
//         </div>
//       </div>
//     );
//   };

//   // Fonction pour obtenir le dernier Purchase Order et son statut
//   const getLatestPurchaseOrderStatus = () => {
//     if (!request.purchaseOrders || !Array.isArray(request.purchaseOrders) || request.purchaseOrders.length === 0) {
//       return null;
//     }
    
//     // Trier par date de mise à jour pour obtenir le plus récent
//     const latestOrder = [...request.purchaseOrders].sort(
//       (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
//     )[0];
    
//     return latestOrder;
//   };

//   // Affichage du statut du bon de commande seulement (sans timeline)
//   const renderPurchaseOrderStatus = () => {
//     const latestPO = getLatestPurchaseOrderStatus();
    
//     if (!latestPO) return null;
    
//     return (
//       <div className="mb-4">
//         <h4 className="font-medium mb-2">Suivi d'état de la demande (logistique)</h4>
        
//         <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-blue-800">
//               Bon de commande #{latestPO.orderNumber}
//             </span>
//             <Badge className={getTrackingStatusBadgeColor(latestPO.status)}>
//               {latestPO.status}
//             </Badge>
//           </div>
//           <div className="text-xs text-blue-600 mt-1">
//             Fournisseur: {latestPO.supplier} | 
//             Montant: {latestPO.totalAmount}€ |
//             Dernière mise à jour: {formatDate(latestPO.updatedAt || latestPO.createdAt)}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <div className="mb-4">
//         <h3 className="font-bold text-xl mb-2">{request.requestNumber}</h3>
//         <div className="text-gray-700 mb-2">
//           Projet : {request.projectName} <br />
//           Produit : {request.productName} <br />
//           Quantité : {request.quantity} <br />
//           Montant estimé : {request.estimatedPrice || request.totalEstimatedCost} € <br />
//           Statut actuel : <span className="font-semibold">{getStatusBadge(request.status)}</span>
//         </div>
//       </div>

//       {/* Affichage du statut Purchase Order seulement (sans timeline) */}
//       {renderPurchaseOrderStatus()}

//       {/* Bouton Transfert (visible si c'est le responsable achat et statut approprié) */}
//       {isPurchasingManager && ["Approuvée", "Commandée"].includes(request.status) && (
//         <div className="mb-4">
//           <button
//             onClick={() => onSendToLogistics && onSendToLogistics(request.id)}
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
//           >
//             Transférer au service logistique
//           </button>
//         </div>
//       )}

//       <Tabs defaultValue="details" className="mt-6">
//         <TabsList>
//           <TabsTrigger value="details">Détails</TabsTrigger>
//           <TabsTrigger value="approvals">Approbations</TabsTrigger>
//           <TabsTrigger value="documents">Documents</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="details" className="space-y-4">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Commercial</p>
//                   <p>{request.commercialName}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Date de création</p>
//                   <p>{formatDate(request.createdAt)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Date de livraison souhaitée</p>
//                   <p>{formatDate(request.deliveryDate)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Date d'estimation</p>
//                   <p>{formatDate(request.estimationDate)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Priorité</p>
//                   <p>{request.priority}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Statut</p>
//                   <div className="mt-1">{getStatusBadge(request.status)}</div>
//                 </div>
//               </div>
              
//               {request.notes && (
//                 <div className="mt-4">
//                   <p className="text-sm font-medium text-gray-500">Notes</p>
//                   <p className="whitespace-pre-wrap">{request.notes}</p>
//                 </div>
//               )}
              
//               {request.rejectionReason && (
//                 <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
//                   <p className="text-sm font-medium text-red-800">Raison du rejet</p>
//                   <p className="text-red-700">{request.rejectionReason}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="pt-6">
//               <h4 className="font-medium mb-2">Produits demandés</h4>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead>
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix estimé</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {getRequestedProducts().map((product: any, index: number) => (
//                       <tr key={index}>
//                         <td className="px-4 py-2">{product.name}</td>
//                         <td className="px-4 py-2">{product.quantity}</td>
//                         <td className="px-4 py-2">{product.price || '-'} €</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td className="px-4 py-2 font-medium" colSpan={2}>Total estimé</td>
//                       <td className="px-4 py-2 font-medium">{request.totalEstimatedCost} €</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="approvals">
//           <Card>
//             <CardContent className="pt-6">
//               {renderDirectorApprovals()}
              
//               {getApprovals().length > 0 && (
//                 <div className="mt-6">
//                   <h4 className="font-medium mb-2">Historique des approbations</h4>
//                   <div className="space-y-2">
//                     {getApprovals().map((approval: any, index: number) => (
//                       <div key={index} className="flex items-center">
//                         <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
//                         <span>
//                           Approuvé par {approval.userName} ({approval.userRole}) le {formatDate(approval.approvedAt)}
//                           {approval.notes && ` - "${approval.notes}"`}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {request.approvedBy && request.approver && (
//                 <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
//                   <p className="text-sm font-medium text-green-800">Approbation finale</p>
//                   <p className="text-green-700">
//                     Approuvé par {request.approver.firstName} {request.approver.lastName} ({request.approver.role}) 
//                     le {formatDate(request.approvedAt)}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="documents">
//           <Card>
//             <CardContent className="pt-6">
//               {renderPurchaseOrderFile()}
              
//               {request.purchaseOrderPdf && (
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Bon de commande généré</h4>
//                   <div className="flex items-center">
//                     <FileText className="h-5 w-5 text-blue-500 mr-2" />
//                     <a 
//                       href={request.purchaseOrderPdf} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline flex items-center"
//                     >
//                       Voir le bon de commande généré
//                       <Download className="h-4 w-4 ml-1" />
//                     </a>
//                   </div>
//                 </div>
//               )}
              
//               {request.purchaseOrders && request.purchaseOrders.length > 0 && (
//                 <div className="mt-6">
//                   <h4 className="font-medium mb-2">Bons de commande associés</h4>
//                   <div className="space-y-2">
//                     {request.purchaseOrders.map((order: any) => (
//                       <div key={order.id} className="flex items-center">
//                         <FileText className="h-5 w-5 text-blue-500 mr-2" />
//                         <span>
//                           {order.orderNumber} - {order.status} - {formatDate(order.createdAt)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default PurchaseRequestDetailView;
import React from 'react';
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { getTrackingStatusBadgeColor, getSuiviStatutAchat } from "@/utils/getSuiviStatutAchat";
import { PurchaseRequest } from '@/services/purchase-requests.api.service';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseRequestDetailViewProps {
  request: PurchaseRequest;
  isPurchasingManager: boolean;
  onSendToLogistics?: (id: string) => void;
}

const PurchaseRequestDetailView: React.FC<PurchaseRequestDetailViewProps> = ({ 
  request, 
  isPurchasingManager, 
  onSendToLogistics 
}) => {
  const { user } = useAuth();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'En cours d\'approbation':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En cours d'approbation</Badge>;
      case 'Approuvée':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>;
      case 'Rejetée':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejetée</Badge>;
      case 'Commandée':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Commandée</Badge>;
      case 'Confirmée_Achat':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Confirmée Achat</Badge>;
      case 'Envoyée_Logistique':
        return <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-200">Envoyée Logistique</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Helper pour récupérer et valider requestedProducts comme tableau
  const getRequestedProducts = () => {
    if (Array.isArray(request.requestedProducts)) {
      return request.requestedProducts;
    }
    // Si string JSON, essayer de parser
    if (typeof request.requestedProducts === "string") {
      try {
        const parsed = JSON.parse(request.requestedProducts);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    // Sinon pas exploitable, utiliser des données de fallback
    return [{
      name: request.productName || 'Produit non spécifié',
      quantity: request.quantity || 0,
      price: request.estimatedPrice || 0
    }];
  };

  // Helper pour récupérer et valider approvals comme tableau
  const getApprovals = () => {
    if (Array.isArray(request.approvals)) {
      return request.approvals;
    }
    if (typeof request.approvals === "string") {
      try {
        const parsed = JSON.parse(request.approvals);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Calculer le statut de suivi
  const trackingStatus = getSuiviStatutAchat(request);

  const renderDirectorApprovals = () => {
    if (!request.directorApprovals) return null;
    
    let approvals = {};
    try {
      approvals = typeof request.directorApprovals === 'string' 
        ? JSON.parse(request.directorApprovals) 
        : request.directorApprovals;
    } catch (e) {
      return <p className="text-red-500">Erreur lors du chargement des approbations</p>;
    }

    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Approbations des directeurs</h4>
        <div className="space-y-2">
          {Object.entries(approvals).map(([role, approval]: [string, any]) => {
            if (!approval) return (
              <div key={role} className="flex items-center">
                <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500">{role}: En attente</span>
              </div>
            );
            
            return (
              <div key={role} className="flex items-center">
                {approval.approved ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={approval.approved ? 'text-green-700' : 'text-red-700'}>
                  {role}: {approval.approved ? 'Approuvé' : 'Rejeté'} par {approval.directorName}
                  {approval.comment && ` - "${approval.comment}"`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPurchaseOrderFile = () => {
    if (!request.purchaseOrderFile) return null;
    
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Bon de commande</h4>
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <a 
            href={request.purchaseOrderFile} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            Voir le bon de commande
            <Download className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    );
  };

  // Fonction pour obtenir le dernier Purchase Order et son statut
  const getLatestPurchaseOrderStatus = () => {
    if (!request.purchaseOrders || !Array.isArray(request.purchaseOrders) || request.purchaseOrders.length === 0) {
      return null;
    }
    
    // Trier par date de mise à jour pour obtenir le plus récent
    const latestOrder = [...request.purchaseOrders].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    )[0];
    
    return latestOrder;
  };

  // Fonction pour afficher le statut détaillé de la demande d'achat
  const renderRequestStatusInfo = () => {
    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Statut actuel de la demande d'achat</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-600 mb-1">Statut de la demande:</p>
            <div className="flex items-center gap-2">
              {getStatusBadge(request.status)}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-blue-600 mb-1">Statut de suivi global:</p>
            <Badge className={getTrackingStatusBadgeColor(trackingStatus)}>
              {trackingStatus}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm text-blue-600 mb-1">Numéro de demande:</p>
            <p className="font-medium text-blue-800">{request.requestNumber}</p>
          </div>
          
          <div>
            <p className="text-sm text-blue-600 mb-1">Dernière mise à jour:</p>
            <p className="font-medium text-blue-800">{formatDate(request.updatedAt)}</p>
          </div>
        </div>
        
        {request.rejectionReason && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
            <p className="text-sm text-red-600 mb-1">Raison du rejet:</p>
            <p className="text-red-700 font-medium">{request.rejectionReason}</p>
          </div>
        )}
      </div>
    );
  };

  // Affichage du statut du bon de commande
  const renderPurchaseOrderStatus = () => {
    const latestPO = getLatestPurchaseOrderStatus();
    
    return (
      <div className="mb-6">
        <h4 className="font-medium mb-3">Statut de suivi de la demande</h4>
        
        {/* Statut global de suivi */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Statut global de suivi
            </span>
            <Badge className={getTrackingStatusBadgeColor(trackingStatus)}>
              {trackingStatus}
            </Badge>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Dernière mise à jour: {formatDate(request.updatedAt)}
          </div>
        </div>

        {/* Statut de la demande */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">
              Statut de la demande d'achat
            </span>
            {getStatusBadge(request.status)}
          </div>
        </div>
        
        {/* Détails du bon de commande si disponible */}
        {latestPO && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Bon de commande #{latestPO.orderNumber}
              </span>
              <Badge className={getTrackingStatusBadgeColor(latestPO.status)}>
                {latestPO.status}
              </Badge>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Fournisseur: {latestPO.supplier} | 
              Montant: {latestPO.totalAmount}€ |
              Dernière mise à jour: {formatDate(latestPO.updatedAt || latestPO.createdAt)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-2">{request.requestNumber}</h3>
        <div className="text-gray-700 mb-2">
          Projet : {request.projectName} <br />
          Produit : {request.productName} <br />
          Quantité : {request.quantity} <br />
          Montant estimé : {request.estimatedPrice || request.totalEstimatedCost} € <br />
          Statut actuel : <span className="font-semibold">{getStatusBadge(request.status)}</span>
        </div>
      </div>

      {/* Affichage du statut détaillé de la demande */}
      {renderRequestStatusInfo()}

      {/* Affichage du statut Purchase Order */}
      {renderPurchaseOrderStatus()}

      {/* Bouton Transfert - MASQUÉ pour responsable_achat */}
      {isPurchasingManager && 
       user?.role !== 'responsable_achat' && 
       ["Approuvée", "Commandée", "Confirmée_Achat"].includes(request.status) && (
        <div className="mb-4">
          <Button
            onClick={() => onSendToLogistics && onSendToLogistics(request.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Transférer au service logistique
          </Button>
        </div>
      )}

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="approvals">Approbations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Commercial</p>
                  <p>{request.commercialName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de création</p>
                  <p>{formatDate(request.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de livraison souhaitée</p>
                  <p>{formatDate(request.deliveryDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date d'estimation</p>
                  <p>{formatDate(request.estimationDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priorité</p>
                  <p>{request.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>
              </div>
              
              {request.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="whitespace-pre-wrap">{request.notes}</p>
                </div>
              )}
              
              {request.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-800">Raison du rejet</p>
                  <p className="text-red-700">{request.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Produits demandés</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix estimé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getRequestedProducts().map((product: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2">{product.quantity}</td>
                        <td className="px-4 py-2">{product.price || '-'} €</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="px-4 py-2 font-medium" colSpan={2}>Total estimé</td>
                      <td className="px-4 py-2 font-medium">{request.totalEstimatedCost} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approvals">
          <Card>
            <CardContent className="pt-6">
              {renderDirectorApprovals()}
              
              {getApprovals().length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Historique des approbations</h4>
                  <div className="space-y-2">
                    {getApprovals().map((approval: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>
                          Approuvé par {approval.userName} ({approval.userRole}) le {formatDate(approval.approvedAt)}
                          {approval.notes && ` - "${approval.notes}"`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {request.approvedBy && request.approver && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                  <p className="text-sm font-medium text-green-800">Approbation finale</p>
                  <p className="text-green-700">
                    Approuvé par {request.approver.firstName} {request.approver.lastName} ({request.approver.role}) 
                    le {formatDate(request.approvedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              {renderPurchaseOrderFile()}
              
              {request.purchaseOrderPdf && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Bon de commande généré</h4>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <a 
                      href={request.purchaseOrderPdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Voir le bon de commande généré
                      <Download className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              )}
              
              {request.purchaseOrders && request.purchaseOrders.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Bons de commande associés</h4>
                  <div className="space-y-2">
                    {request.purchaseOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span>
                          {order.orderNumber} - {order.status} - {formatDate(order.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseRequestDetailView;