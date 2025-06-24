
// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { CheckCircle, Truck, Package, FileText } from 'lucide-react';

// const PurchaseOrderManagement = () => {
//   const { orders, loading, error, confirmOrder, sendToLogistics } = usePurchaseOrders();
//   const { user, hasRole } = useAuth();
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [supplier, setSupplier] = useState('');
//   const [notes, setNotes] = useState('');
//   const [deliveryInstructions, setDeliveryInstructions] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Brouillon': return 'bg-gray-100 text-gray-800';
//       case 'Confirmée': return 'bg-blue-100 text-blue-800';
//       case 'Envoyée_Logistique': return 'bg-green-100 text-green-800';
//       case 'En_Livraison': return 'bg-orange-100 text-orange-800';
//       case 'Livrée': return 'bg-green-100 text-green-800';
//       case 'Annulée': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'Brouillon': return 'En attente de confirmation';
//       case 'Confirmée': return 'Confirmée par le responsable achat';
//       case 'Envoyée_Logistique': return 'Envoyée au service logistique';
//       case 'En_Livraison': return 'En cours de livraison';
//       case 'Livrée': return 'Livrée';
//       case 'Annulée': return 'Annulée';
//       default: return status;
//     }
//   };

//   const handleConfirmOrder = async () => {
//     if (!selectedOrder) return;
    
//     if (!supplier.trim()) {
//       toast.error('Veuillez sélectionner un fournisseur');
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const response = await confirmOrder(selectedOrder.id, supplier, notes);
//       if (response.success) {
//         toast.success('Commande confirmée avec succès');
//         setSelectedOrder(null);
//         setSupplier('');
//         setNotes('');
//       } else {
//         toast.error(response.error || 'Erreur lors de la confirmation');
//       }
//     } catch (error) {
//       toast.error('Erreur lors de la confirmation');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSendToLogistics = async () => {
//     if (!selectedOrder) return;

//     setIsProcessing(true);
//     try {
//       const response = await sendToLogistics(selectedOrder.id, deliveryInstructions);
//       if (response.success) {
//         toast.success('Commande envoyée au service logistique');
//         setSelectedOrder(null);
//         setDeliveryInstructions('');
//       } else {
//         toast.error(response.error || 'Erreur lors de l\'envoi');
//       }
//     } catch (error) {
//       toast.error('Erreur lors de l\'envoi vers la logistique');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (!hasRole(['responsable_achat', 'admin'])) {
//     return (
//       <div className="p-6 text-center">
//         <p className="text-gray-500">Vous n'avez pas les permissions pour accéder à cette section.</p>
//       </div>
//     );
//   }

//   if (loading) return <div className="p-6">Chargement des bons de commande...</div>;
//   if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Gestion des bons de commande</h2>
//         <Badge variant="outline" className="text-sm">
//           {orders.length} commande(s)
//         </Badge>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Liste des commandes */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Commandes en attente</h3>
          
//           {orders.filter(order => order.status === 'Brouillon' || order.status === 'Confirmée').map((order) => (
//             <Card 
//               key={order.id} 
//               className={`cursor-pointer transition-colors ${
//                 selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : ''
//               }`}
//               onClick={() => setSelectedOrder(order)}
//             >
//               <CardHeader className="pb-3">
//                 <div className="flex justify-between items-start">
//                   <CardTitle className="text-base">{order.orderNumber}</CardTitle>
//                   <Badge className={getStatusColor(order.status)}>
//                     {getStatusText(order.status)}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Fournisseur:</span>
//                     <span className="font-medium">{order.supplier}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Montant total:</span>
//                     <span className="font-medium">{order.totalAmount?.toLocaleString('fr-FR')} €</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Date de création:</span>
//                     <span>{format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
//                   </div>
//                   {order.expectedDeliveryDate && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Livraison prévue:</span>
//                       <span>{format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy', { locale: fr })}</span>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}

//           {orders.filter(order => order.status === 'Brouillon' || order.status === 'Confirmée').length === 0 && (
//             <Card>
//               <CardContent className="p-6 text-center text-gray-500">
//                 <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                 <p>Aucune commande en attente de traitement</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Détails et actions */}
//         <div className="space-y-4">
//           {selectedOrder ? (
//             <>
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <FileText className="h-5 w-5" />
//                     Détails de la commande
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <h4 className="font-medium mb-2">Produits commandés:</h4>
//                     <div className="space-y-2">
//                       {selectedOrder.products?.map((product: any, index: number) => (
//                         <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
//                           <span>{product.name}</span>
//                           <span className="font-medium">Qté: {product.quantity}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {selectedOrder.notes && (
//                     <div>
//                       <h4 className="font-medium mb-2">Notes:</h4>
//                       <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
//                         {selectedOrder.notes}
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {selectedOrder.status === 'Brouillon' && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <CheckCircle className="h-5 w-5" />
//                       Confirmer la commande
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <Label htmlFor="supplier">Fournisseur *</Label>
//                       <Input
//                         id="supplier"
//                         value={supplier}
//                         onChange={(e) => setSupplier(e.target.value)}
//                         placeholder="Nom du fournisseur"
//                       />
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="notes">Notes additionnelles</Label>
//                       <Textarea
//                         id="notes"
//                         value={notes}
//                         onChange={(e) => setNotes(e.target.value)}
//                         placeholder="Commentaires ou instructions spéciales..."
//                         rows={3}
//                       />
//                     </div>
                    
//                     <Button 
//                       onClick={handleConfirmOrder}
//                       disabled={isProcessing || !supplier.trim()}
//                       className="w-full"
//                     >
//                       {isProcessing ? 'Confirmation en cours...' : 'Confirmer la commande'}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )}

//               {selectedOrder.status === 'Confirmée' && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Truck className="h-5 w-5" />
//                       Envoyer vers la logistique
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <Label htmlFor="deliveryInstructions">Instructions de livraison</Label>
//                       <Textarea
//                         id="deliveryInstructions"
//                         value={deliveryInstructions}
//                         onChange={(e) => setDeliveryInstructions(e.target.value)}
//                         placeholder="Instructions spéciales pour la livraison..."
//                         rows={3}
//                       />
//                     </div>
                    
//                     <Button 
//                       onClick={handleSendToLogistics}
//                       disabled={isProcessing}
//                       className="w-full bg-green-600 hover:bg-green-700"
//                     >
//                       {isProcessing ? 'Envoi en cours...' : 'Envoyer au service logistique'}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )}
//             </>
//           ) : (
//             <Card>
//               <CardContent className="p-6 text-center text-gray-500">
//                 <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                 <p>Sélectionnez une commande pour voir les détails et actions disponibles</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchaseOrderManagement;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, Truck, Package, FileText } from 'lucide-react';

const PurchaseOrderManagement = () => {
  const { orders, loading, error, confirmOrder, sendToLogistics } = usePurchaseOrders();
  const { user, hasRole } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Brouillon': return 'bg-gray-100 text-gray-800';
      case 'Confirmée': return 'bg-blue-100 text-blue-800';
      case 'Envoyée_Logistique': return 'bg-green-100 text-green-800';
      case 'En_Livraison': return 'bg-orange-100 text-orange-800';
      case 'Livrée': return 'bg-green-100 text-green-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Brouillon': return 'En attente de confirmation';
      case 'Confirmée': return 'Confirmée par le responsable achat';
      case 'Envoyée_Logistique': return 'Envoyée au service logistique';
      case 'En_Livraison': return 'En cours de livraison';
      case 'Livrée': return 'Livrée';
      case 'Annulée': return 'Annulée';
      default: return status;
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    
    if (!supplier.trim()) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await confirmOrder(selectedOrder.id, supplier, notes);
      if (response.success) {
        toast.success('Commande confirmée avec succès');
        setSelectedOrder(null);
        setSupplier('');
        setNotes('');
      } else {
        toast.error(response.error || 'Erreur lors de la confirmation');
      }
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToLogistics = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const response = await sendToLogistics(selectedOrder.id, deliveryInstructions);
      if (response.success) {
        toast.success('Commande envoyée au service logistique');
        setSelectedOrder(null);
        setDeliveryInstructions('');
      } else {
        toast.error(response.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi vers la logistique');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardClick = (order: any, e: React.MouseEvent) => {
    // Empêche la sélection si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || target.closest('select')) {
      return;
    }
    setSelectedOrder(order);
  };

  if (!hasRole(['responsable_achat', 'admin'])) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Vous n'avez pas les permissions pour accéder à cette section.</p>
      </div>
    );
  }

  if (loading) return <div className="p-6">Chargement des bons de commande...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des bons de commande</h2>
        <Badge variant="outline" className="text-sm">
          {orders.length} commande(s)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des commandes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Commandes en attente</h3>
          
          {orders.filter(order => order.status === 'Brouillon' || order.status === 'Confirmée').map((order) => (
            <Card 
              key={order.id} 
              className={`transition-colors ${
                selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'cursor-pointer'
              }`}
              onClick={(e) => handleCardClick(order, e)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fournisseur:</span>
                    <span className="font-medium">{order.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant total:</span>
                    <span className="font-medium">{order.totalAmount?.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de création:</span>
                    <span>{format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  {order.expectedDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraison prévue:</span>
                      <span>{format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy', { locale: fr })}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.filter(order => order.status === 'Brouillon' || order.status === 'Confirmée').length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune commande en attente de traitement</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Détails et actions */}
        <div className="space-y-4">
          {selectedOrder ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Détails de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Produits commandés:</h4>
                    <div className="space-y-2">
                      {selectedOrder.products?.map((product: any, index: number) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{product.name}</span>
                          <span className="font-medium">Qté: {product.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedOrder.status === 'Brouillon' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Confirmer la commande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="supplier">Fournisseur *</Label>
                      <Input
                        id="supplier"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="Nom du fournisseur"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes additionnelles</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Commentaires ou instructions spéciales..."
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleConfirmOrder}
                      disabled={isProcessing || !supplier.trim()}
                      className="w-full"
                    >
                      {isProcessing ? 'Confirmation en cours...' : 'Confirmer la commande'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {selectedOrder.status === 'Confirmée' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Envoyer vers la logistique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryInstructions">Instructions de livraison</Label>
                      <Textarea
                        id="deliveryInstructions"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="Instructions spéciales pour la livraison..."
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSendToLogistics}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? 'Envoi en cours...' : 'Envoyer au service logistique'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez une commande pour voir les détails et actions disponibles</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;