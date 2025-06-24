
// import React, { useState } from 'react';
// import { Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DeliveryDetailView from '@/components/delivery/DeliveryDetailView';
// import AddDeliveryForm from '@/components/delivery/AddDeliveryForm';
// import { useDeliveries } from '@/hooks/useDeliveries';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import PurchaseOrderForm from '@/components/purchases/PurchaseOrderForm';
// import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
// import PurchaseRequestDetailView from "@/components/purchases/PurchaseRequestDetailView";
// import PurchaseOrderLogisticsDetailView from "@/components/purchases/PurchaseOrderLogisticsDetailView";
// import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
// import { useAuth } from "../contexts/AuthContext";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import PurchaseOrderLogisticsStatusSelector from "@/components/purchases/PurchaseOrderLogisticsStatusSelector";
// import { purchaseRequestsApiService } from "@/services/purchase-requests.api.service";
// import { getTrackingStatusBadgeColor } from "@/utils/getSuiviStatutAchat";

// // Les statuts logistiques pertinents pour les commandes (PurchaseRequest)
// const LOGISTIC_STATUSES = [
//   "À traiter (logistique)",
//   "En traitement",
//   "Expédiée",
//   "Livrée"
// ];

// const LOGISTIC_PO_STATUSES = [
//   "Brouillon",
//   "Confirmée", 
//   "Envoyée_Logistique",
//   "En_Livraison",
//   "Livrée",
//   "Annulée"
// ];

// const Delivery = () => {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

//   // Section commandes : nouveau state pour afficher la requête associée à un BC
//   const [openPRModal, setOpenPRModal] = useState(false);
//   const [loadingPR, setLoadingPR] = useState(false);
//   const [purchaseRequestDetails, setPurchaseRequestDetails] = useState<any | null>(null);

//   // Hooks auth + api
//   const { user } = useAuth();
//   const isLogisticsRole = user?.role === "logistique";
//   const { deliveries, loading, error } = useDeliveries();
//   const { requests, updateLogisticsStatus } = usePurchaseRequests();
//   const { orders: purchaseOrders, loading: poLoading, error: poError } = usePurchaseOrders();

//   const [selectedPO, setSelectedPO] = useState<any | null>(null);

//   // Helper for status badge with updated labels
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "À traiter":
//       case 'À traiter (logistique)':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'En traitement':
//         return 'bg-blue-100 text-blue-800';
//       case 'Expédiée':
//         return 'bg-purple-100 text-purple-800';
//       case 'Livrée':
//         return 'bg-green-100 text-green-800';
//       case 'Annulée':
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'Brouillon':
//         return 'bg-gray-100 text-gray-800';
//       case 'Confirmée':
//         return 'bg-blue-100 text-blue-800';
//       case 'Envoyée_Logistique':
//         return 'bg-indigo-100 text-indigo-800';
//       case 'En_Livraison':
//         return 'bg-orange-100 text-orange-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // --- Nouveau : Ouvrir la demande d'achat à partir du BC ---
//   const handleOpenPurchaseRequest = async (purchaseRequestId: string) => {
//     setLoadingPR(true);
//     setPurchaseRequestDetails(null);
//     setOpenPRModal(true);

//     try {
//       // On cherche d'abord dans le cache des requests (usePurchaseRequests)
//       let foundReq = requests.find((req) => req.id === purchaseRequestId);
//       if (!foundReq) {
//         // Si non trouvé: fetch via API service (CORRIGÉ)
//         const res = await purchaseRequestsApiService.getPurchaseRequestById(purchaseRequestId);
//         if (res.success && res.data) {
//           foundReq = res.data;
//         }
//       }
//       setPurchaseRequestDetails(foundReq || null);
//     } catch (e) {
//       setPurchaseRequestDetails(null);
//     } finally {
//       setLoadingPR(false);
//     }
//   };

//   // Fonction pour forcer le refresh de la demande actuellement en détail via re-fetch, par ex. après changement de statut BC
//   const refetchCurrentPurchaseRequestDetail = async () => {
//     if (purchaseRequestDetails && purchaseRequestDetails.id) {
//       setLoadingPR(true);
//       try {
//         const res = await purchaseRequestsApiService.getPurchaseRequestById(purchaseRequestDetails.id);
//         if (res.success && res.data) {
//           setPurchaseRequestDetails(res.data);
//         }
//       } catch {
//         // leave as is
//       }
//       setLoadingPR(false);
//     }
//   };

//   // Pour update le statut depuis PR Detail
//   const handleLogisticsStatusUpdate = async (requestId: string, newStatus: string) => {
//     await updateLogisticsStatus(requestId, newStatus);
//     // refresh detail via service (robuste, évite fetch local)
//     handleOpenPurchaseRequest(requestId);
//   };

//   const handleDeliverySelect = (delivery: any) => {
//     setSelectedDelivery(delivery);
//   };

//   if (loading) {
//     return <div className="p-6">Chargement des livraisons...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-600">Erreur: {error}</div>;
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Gestion des Livraisons</h1>
//         <Button onClick={() => setShowAddForm(true)}>
//           <Plus className="mr-2 h-4 w-4" />
//           Nouvelle Livraison
//         </Button>
//       </div>
//       <Tabs defaultValue="list" className="w-full">
//         <TabsList>
//           <TabsTrigger value="list">Liste des Livraisons</TabsTrigger>
//           <TabsTrigger value="details">Détails</TabsTrigger>
//           <TabsTrigger value="orders">Commandes</TabsTrigger>
//         </TabsList>
//         <TabsContent value="list" className="space-y-4">
//           <div className="grid gap-4">
//             {deliveries && deliveries.length > 0 ? (
//               deliveries.map((delivery) => (
//                 <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow"
//                       onClick={() => handleDeliverySelect(delivery)}>
//                   <CardHeader>
//                     <div className="flex justify-between items-center">
//                       <CardTitle className="text-lg">
//                         Livraison #{delivery.deliveryNumber || delivery.id}
//                       </CardTitle>
//                       <Badge className={getStatusColor(String(delivery.status))}>
//                         {delivery.status}
//                       </Badge>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-sm text-gray-600">Projet: {delivery.projectName}</p>
//                         <p className="text-sm text-gray-600">Client: {delivery.clientName}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">
//                           Date prévue: {delivery.actualDeliveryDate 
//                             ? new Date(delivery.actualDeliveryDate).toLocaleDateString()
//                             : 'Non définie'}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           Produits: {delivery.products && Array.isArray(delivery.products) ? delivery.products.length : 0}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))
//             ) : (
//               <Card>
//                 <CardContent className="p-6 text-center">
//                   <p className="text-gray-500">Aucune livraison trouvée</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </TabsContent>

//         <TabsContent value="details">
//           <DeliveryDetailView 
//             delivery={selectedDelivery} 
//             onClose={() => setSelectedDelivery(null)} 
//           />
//         </TabsContent>

//         <TabsContent value="orders">
//           <div>
//             <h2 className="text-xl font-bold mb-6">Tous les bons de commande</h2>
//             {poLoading ? (
//               <div className="p-4 text-center">Chargement des commandes...</div>
//             ) : poError ? (
//               <div className="p-4 text-center text-red-500">Erreur de chargement: {poError}</div>
//             ) : purchaseOrders.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">Aucun bon de commande trouvé.</div>
//             ) : (
//               <div className="space-y-4">
//                 {purchaseOrders.map(order => (
//                   <Card key={order.id} className="border hover:shadow transition cursor-pointer"
//                         onClick={() => {
//                           if (isLogisticsRole && order.purchaseRequestId) {
//                             handleOpenPurchaseRequest(order.purchaseRequestId);
//                           } else {
//                             setSelectedPO(order);
//                           }
//                         }}>
//                     <CardHeader>
//                       <div className="flex justify-between items-center">
//                         <CardTitle className="text-lg">BC #{order.orderNumber}</CardTitle>
//                         <Badge className={getStatusColor(order.status)}>
//                           {order.status}
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p>Fournisseur: {order.supplier}</p>
//                           {order.purchaseRequestId && (
//                             <p>
//                               ID Demande d&apos;achat liée:{" "}
//                               <Button
//                                 variant="link"
//                                 className="p-0 h-auto text-indigo-600"
//                                 onClick={e => {
//                                   e.stopPropagation();
//                                   if (isLogisticsRole) handleOpenPurchaseRequest(order.purchaseRequestId);
//                                 }}
//                               >
//                                 {order.purchaseRequestId}
//                               </Button>
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           <p>
//                             Date prévue livraison:{" "}
//                             {order.expectedDeliveryDate
//                               ? new Date(order.expectedDeliveryDate).toLocaleDateString()
//                               : "Non définie"}
//                           </p>
//                           <p>Statut: {order.status}</p>
//                         </div>
//                       </div>
//                       {/* Affichage du sélecteur si logistique */}
//                       {isLogisticsRole && (
//                         <div className="mt-3">
//                           <PurchaseOrderLogisticsStatusSelector
//                             order={order}
//                             possibleStatuses={LOGISTIC_PO_STATUSES}
//                             onStatusUpdated={() => {
//                               // Si on a la modale ouverte et elle concerne bien cette PR : refetch
//                               if (openPRModal && purchaseRequestDetails && purchaseRequestDetails.id === order.purchaseRequestId) {
//                                 refetchCurrentPurchaseRequestDetail();
//                               }
//                             }}
//                           />
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//             {/* --- MODAL d'affichage de la demande d'achat associée --- */}
//             <Dialog open={openPRModal} onOpenChange={setOpenPRModal}>
//               <DialogContent className="max-w-3xl min-w-[350px] max-h-[90vh] flex flex-col">
//                 <DialogHeader>
//                   <DialogTitle>Détail de la demande d&apos;achat</DialogTitle>
//                   <p id="desc-modal-pr" className="sr-only">Détails et suivi de la demande d&apos;achat sélectionnée</p>
//                 </DialogHeader>
//                 <ScrollArea className="h-[65vh] w-full pr-2" aria-describedby="desc-modal-pr">
//                   <div>
//                     {loadingPR && (
//                       <div className="p-6 text-center text-gray-500">
//                         Chargement de la demande d&apos;achat en cours...
//                       </div>
//                     )}
//                     {!loadingPR && purchaseRequestDetails ? (
//                       <div className="space-y-4">
//                         <PurchaseRequestDetailView
//                           request={purchaseRequestDetails}
//                           isPurchasingManager={false}
//                         />
//                       </div>
//                     ) : null}
//                     {!loadingPR && !purchaseRequestDetails && (
//                       <div className="p-6 text-center text-red-500">
//                         Impossible de charger la demande d&apos;achat associée.
//                       </div>
//                     )}
//                   </div>
//                 </ScrollArea>
//                 <div className="flex justify-end mt-4">
//                   <DialogClose asChild>
//                     <Button variant="outline">Fermer</Button>
//                   </DialogClose>
//                 </div>
//               </DialogContent>
//             </Dialog>

//             {/* Fallback: détail du bon de commande (non logistique ou pas relié PR) */}
//             {selectedPO && (
//               <PurchaseOrderLogisticsDetailView order={selectedPO} onClose={() => setSelectedPO(null)} />
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>

//       {showAddForm && (
//         <AddDeliveryForm onClose={() => setShowAddForm(false)} />
//       )}
//     </div>
//   );
// };

// export default Delivery;
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeliveryDetailView from '@/components/delivery/DeliveryDetailView';
import AddDeliveryForm from '@/components/delivery/AddDeliveryForm';
import { useDeliveries } from '@/hooks/useDeliveries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PurchaseOrderForm from '@/components/purchases/PurchaseOrderForm';
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import PurchaseRequestDetailView from "@/components/purchases/PurchaseRequestDetailView";
import PurchaseOrderLogisticsDetailView from "@/components/purchases/PurchaseOrderLogisticsDetailView";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import PurchaseOrderLogisticsStatusSelector from "@/components/purchases/PurchaseOrderLogisticsStatusSelector";
import { purchaseRequestsApiService } from "@/services/purchase-requests.api.service";
import { getTrackingStatusBadgeColor } from "@/utils/getSuiviStatutAchat";
import { deliveriesApiService } from "@/services/deliveries.api.service";
import { toast } from "sonner";

// Les statuts logistiques pertinents pour les commandes (PurchaseRequest)
const LOGISTIC_STATUSES = [
  "À traiter (logistique)",
  "En traitement",
  "Expédiée",
  "Livrée"
];

const LOGISTIC_PO_STATUSES = [
  "Brouillon",
  "Confirmée", 
  "Envoyée_Logistique",
  "En_Livraison",
  "Livrée",
  "Annulée"
];

const Delivery = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  // Section commandes : nouveau state pour afficher la requête associée à un BC
  const [openPRModal, setOpenPRModal] = useState(false);
  const [loadingPR, setLoadingPR] = useState(false);
  const [purchaseRequestDetails, setPurchaseRequestDetails] = useState<any | null>(null);

  // Hooks auth + api
  const { user } = useAuth();
  const isLogisticsRole = user?.role === "logistique";
  const canCreateDelivery = user?.role === 'admin' || user?.role === 'service_facturation';
  const { deliveries, loading, error, refetch } = useDeliveries();
  const { requests, updateLogisticsStatus } = usePurchaseRequests();
  const { orders: purchaseOrders, loading: poLoading, error: poError } = usePurchaseOrders();

  const [selectedPO, setSelectedPO] = useState<any | null>(null);

  console.log('Delivery component rendered with showAddForm:', showAddForm);

  // Function to update delivery status
  const handleUpdateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const response = await deliveriesApiService.updateDeliveryStatus(deliveryId, newStatus);
      if (response.success) {
        toast.success("Statut de livraison mis à jour avec succès");
        refetch(); // Refresh the deliveries list
        // Update the selected delivery if it's the one being modified
        if (selectedDelivery && selectedDelivery.id === deliveryId) {
          setSelectedDelivery(response.data);
        }
      } else {
        toast.error(response.error || "Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Helper for status badge with updated labels
  const getStatusColor = (status: string) => {
    switch (status) {
      case "À traiter":
      case 'À traiter (logistique)':
        return 'bg-yellow-100 text-yellow-800';
      case 'En traitement':
        return 'bg-blue-100 text-blue-800';
      case 'Expédiée':
        return 'bg-purple-100 text-purple-800';
      case 'Livrée':
        return 'bg-green-100 text-green-800';
      case 'Annulée':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'Brouillon':
        return 'bg-gray-100 text-gray-800';
      case 'Confirmée':
        return 'bg-blue-100 text-blue-800';
      case 'Envoyée_Logistique':
        return 'bg-indigo-100 text-indigo-800';
      case 'En_Livraison':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle new delivery button click
  const handleNewDeliveryClick = () => {
    console.log('New delivery button clicked');
    setShowAddForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    console.log('Form closed');
    setShowAddForm(false);
  };

  // Handle form success
  const handleFormSuccess = () => {
    console.log('Form success');
    setShowAddForm(false);
    refetch(); // Refresh deliveries list
  };

  // --- Nouveau : Ouvrir la demande d'achat à partir du BC ---
  const handleOpenPurchaseRequest = async (purchaseRequestId: string) => {
    setLoadingPR(true);
    setPurchaseRequestDetails(null);
    setOpenPRModal(true);

    try {
      // On cherche d'abord dans le cache des requests (usePurchaseRequests)
      let foundReq = requests.find((req) => req.id === purchaseRequestId);
      if (!foundReq) {
        // Si non trouvé: fetch via API service (CORRIGÉ)
        const res = await purchaseRequestsApiService.getPurchaseRequestById(purchaseRequestId);
        if (res.success && res.data) {
          foundReq = res.data;
        }
      }
      setPurchaseRequestDetails(foundReq || null);
    } catch (e) {
      setPurchaseRequestDetails(null);
    } finally {
      setLoadingPR(false);
    }
  };

  // Fonction pour forcer le refresh de la demande actuellement en détail via re-fetch, par ex. après changement de statut BC
  const refetchCurrentPurchaseRequestDetail = async () => {
    if (purchaseRequestDetails && purchaseRequestDetails.id) {
      setLoadingPR(true);
      try {
        const res = await purchaseRequestsApiService.getPurchaseRequestById(purchaseRequestDetails.id);
        if (res.success && res.data) {
          setPurchaseRequestDetails(res.data);
        }
      } catch {
        // leave as is
      }
      setLoadingPR(false);
    }
  };

  // Pour update le statut depuis PR Detail
  const handleLogisticsStatusUpdate = async (requestId: string, newStatus: string) => {
    await updateLogisticsStatus(requestId, newStatus);
    // refresh detail via service (robuste, évite fetch local)
    handleOpenPurchaseRequest(requestId);
  };

  const handleDeliverySelect = (delivery: any) => {
    setSelectedDelivery(delivery);
  };

  if (loading) {
    return <div className="p-6">Chargement des livraisons...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Livraisons</h1>
        {canCreateDelivery && (
          <Button onClick={handleNewDeliveryClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Livraison
          </Button>
        )}
      </div>

      {/* Formulaire de nouvelle livraison */}
      {showAddForm && (
        <div className="mb-6">
          <AddDeliveryForm 
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Liste des Livraisons</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleDeliverySelect(delivery)}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Livraison #{delivery.deliveryNumber || delivery.id}
                      </CardTitle>
                      <Badge className={getStatusColor(String(delivery.status))}>
                        {delivery.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Projet: {delivery.projectName}</p>
                        <p className="text-sm text-gray-600">Client: {delivery.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Date prévue: {delivery.actualDeliveryDate 
                            ? new Date(delivery.actualDeliveryDate).toLocaleDateString()
                            : 'Non définie'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Produits: {delivery.products && Array.isArray(delivery.products) ? delivery.products.length : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Aucune livraison trouvée</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <DeliveryDetailView 
            delivery={selectedDelivery} 
            onUpdateStatus={handleUpdateDeliveryStatus}
            onClose={() => setSelectedDelivery(null)} 
          />
        </TabsContent>

        <TabsContent value="orders">
          <div>
            <h2 className="text-xl font-bold mb-6">Tous les bons de commande</h2>
            {poLoading ? (
              <div className="p-4 text-center">Chargement des commandes...</div>
            ) : poError ? (
              <div className="p-4 text-center text-red-500">Erreur de chargement: {poError}</div>
            ) : purchaseOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun bon de commande trouvé.</div>
            ) : (
              <div className="space-y-4">
                {purchaseOrders.map(order => (
                  <Card key={order.id} className="border hover:shadow transition cursor-pointer"
                        onClick={() => {
                          if (isLogisticsRole && order.purchaseRequestId) {
                            handleOpenPurchaseRequest(order.purchaseRequestId);
                          } else {
                            setSelectedPO(order);
                          }
                        }}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">BC #{order.orderNumber}</CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>Fournisseur: {order.supplier}</p>
                          {order.purchaseRequestId && (
                            <p>
                              ID Demande d&apos;achat liée:{" "}
                              <Button
                                variant="link"
                                className="p-0 h-auto text-indigo-600"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (isLogisticsRole) handleOpenPurchaseRequest(order.purchaseRequestId);
                                }}
                              >
                                {order.purchaseRequestId}
                              </Button>
                            </p>
                          )}
                        </div>
                        <div>
                          <p>
                            Date prévue livraison:{" "}
                            {order.expectedDeliveryDate
                              ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                              : "Non définie"}
                          </p>
                          <p>Statut: {order.status}</p>
                        </div>
                      </div>
                      {/* Affichage du sélecteur si logistique */}
                      {isLogisticsRole && (
                        <div className="mt-3">
                          <PurchaseOrderLogisticsStatusSelector
                            order={order}
                            possibleStatuses={LOGISTIC_PO_STATUSES}
                            onStatusUpdated={() => {
                              // Si on a la modale ouverte et elle concerne bien cette PR : refetch
                              if (openPRModal && purchaseRequestDetails && purchaseRequestDetails.id === order.purchaseRequestId) {
                                refetchCurrentPurchaseRequestDetail();
                              }
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* --- MODAL d'affichage de la demande d'achat associée --- */}
            <Dialog open={openPRModal} onOpenChange={setOpenPRModal}>
              <DialogContent className="max-w-3xl min-w-[350px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Détail de la demande d&apos;achat</DialogTitle>
                  <p id="desc-modal-pr" className="sr-only">Détails et suivi de la demande d&apos;achat sélectionnée</p>
                </DialogHeader>
                <ScrollArea className="h-[65vh] w-full pr-2" aria-describedby="desc-modal-pr">
                  <div>
                    {loadingPR && (
                      <div className="p-6 text-center text-gray-500">
                        Chargement de la demande d&apos;achat en cours...
                      </div>
                    )}
                    {!loadingPR && purchaseRequestDetails ? (
                      <div className="space-y-4">
                        <PurchaseRequestDetailView
                          request={purchaseRequestDetails}
                          isPurchasingManager={false}
                        />
                      </div>
                    ) : null}
                    {!loadingPR && !purchaseRequestDetails && (
                      <div className="p-6 text-center text-red-500">
                        Impossible de charger la demande d&apos;achat associée.
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Fermer</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            {/* Fallback: détail du bon de commande (non logistique ou pas relié PR) */}
            {selectedPO && (
              <PurchaseOrderLogisticsDetailView order={selectedPO} onClose={() => setSelectedPO(null)} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Delivery;