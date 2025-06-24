
// import React from 'react';
// import { format } from "date-fns";
// import { fr } from 'date-fns/locale';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { FileText, Download, User, Calendar, MapPin, Package } from 'lucide-react';

// const DeliveryDetailView = ({ delivery, onUpdateStatus, onEdit, onDelete }: any) => {
//   // Add null check at the beginning
//   if (!delivery) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-gray-500">Aucune livraison sélectionnée</p>
//       </div>
//     );
//   }

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return 'Non définie';
//     try {
//       return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
//     } catch (e) {
//       return 'Date invalide';
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Préparée':
//         return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Préparée</Badge>;
//       case 'En transit':
//         return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En transit</Badge>;
//       case 'Livrée':
//         return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Livrée</Badge>;
//       case 'Annulée':
//         return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Annulée</Badge>;
//       default:
//         return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
//     }
//   };

//   const handleStatusChange = (newStatus: string) => {
//     if (onUpdateStatus) {
//       onUpdateStatus(delivery.id, newStatus);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-2xl font-bold">{delivery.deliveryNumber || `Livraison #${delivery.id}`}</h2>
//           <p className="text-gray-600">{delivery.projectName || 'Projet non spécifié'}</p>
//         </div>
//         <div className="flex flex-col items-end space-y-2">
//           {getStatusBadge(delivery.status)}
//           <div className="flex space-x-2">
//             {onEdit && (
//               <Button variant="outline" size="sm" onClick={onEdit}>
//                 Modifier
//               </Button>
//             )}
//             {onDelete && (
//               <Button variant="outline" size="sm" onClick={onDelete}>
//                 Supprimer
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>

//       <Tabs defaultValue="details" className="w-full">
//         <TabsList>
//           <TabsTrigger value="details">Détails</TabsTrigger>
//           <TabsTrigger value="products">Produits</TabsTrigger>
//           <TabsTrigger value="tracking">Suivi</TabsTrigger>
//         </TabsList>

//         <TabsContent value="details" className="space-y-4">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex items-center space-x-2">
//                   <User className="h-4 w-4 text-gray-500" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Client</p>
//                     <p>{delivery.clientName || 'Non spécifié'}</p>
//                   </div>
//                 </div>
                
//                 {delivery.commercial && (
//                   <div className="flex items-center space-x-2">
//                     <User className="h-4 w-4 text-gray-500" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Commercial</p>
//                       <p>{delivery.commercial.firstName} {delivery.commercial.lastName}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex items-center space-x-2">
//                   <MapPin className="h-4 w-4 text-gray-500" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Adresse de livraison</p>
//                     <p>{delivery.deliveryAddress || 'Non spécifiée'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Calendar className="h-4 w-4 text-gray-500" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Date de livraison prévue</p>
//                     <p>{formatDate(delivery.deliveryDate)}</p>
//                   </div>
//                 </div>

//                 {delivery.actualDeliveryDate && (
//                   <div className="flex items-center space-x-2">
//                     <Calendar className="h-4 w-4 text-gray-500" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Date de livraison effective</p>
//                       <p>{formatDate(delivery.actualDeliveryDate)}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex items-center space-x-2">
//                   <Package className="h-4 w-4 text-gray-500" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Quantité totale</p>
//                     <p>{delivery.totalQuantity || 'Non spécifiée'}</p>
//                   </div>
//                 </div>
//               </div>

//               {delivery.notes && (
//                 <div className="mt-4">
//                   <p className="text-sm font-medium text-gray-500">Notes</p>
//                   <p className="whitespace-pre-wrap">{delivery.notes}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="products" className="space-y-4">
//           <Card>
//             <CardContent className="pt-6">
//               <h4 className="font-medium mb-3">Produits à livrer</h4>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead>
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {delivery.products && delivery.products.length > 0 ? (
//                       delivery.products.map((product: any, index: number) => (
//                         <tr key={index}>
//                           <td className="px-4 py-2">{product.name}</td>
//                           <td className="px-4 py-2">{product.quantity}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
//                           Aucun produit spécifié
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="tracking" className="space-y-4">
//           <Card>
//             <CardContent className="pt-6">
//               <h4 className="font-medium mb-3">Informations de transport</h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Chauffeur</p>
//                   <p>{delivery.driverName || 'Non assigné'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Véhicule</p>
//                   <p>{delivery.vehicleInfo || 'Non spécifié'}</p>
//                 </div>
//               </div>

//               {delivery.signature && (
//                 <div className="mt-4">
//                   <p className="text-sm font-medium text-gray-500">Signature</p>
//                   <div className="mt-2 p-4 border border-gray-200 rounded-md">
//                     <p>Signature reçue</p>
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6">
//                 <h5 className="font-medium mb-3">Mettre à jour le statut</h5>
//                 <div className="flex space-x-2">
//                   <Button 
//                     variant={delivery.status === 'Préparée' ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => handleStatusChange('Préparée')}
//                   >
//                     Préparée
//                   </Button>
//                   <Button 
//                     variant={delivery.status === 'En transit' ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => handleStatusChange('En transit')}
//                   >
//                     En transit
//                   </Button>
//                   <Button 
//                     variant={delivery.status === 'Livrée' ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => handleStatusChange('Livrée')}
//                   >
//                     Livrée
//                   </Button>
//                   <Button 
//                     variant={delivery.status === 'Annulée' ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => handleStatusChange('Annulée')}
//                   >
//                     Annulée
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default DeliveryDetailView;

import React from 'react';
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, User, Calendar, MapPin, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DeliveryDetailView = ({ delivery, onUpdateStatus, onEdit, onDelete }: any) => {
  const { user } = useAuth();
  
  // Add null check at the beginning
  if (!delivery) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Aucune livraison sélectionnée</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Préparée':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Préparée</Badge>;
      case 'En transit':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En transit</Badge>;
      case 'Livrée':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Livrée</Badge>;
      case 'Annulée':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Annulée</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(delivery.id, newStatus);
    }
  };

  // Check if user can modify delivery status (logistics, admin, or magasinier role)
  const canModifyStatus = user?.role === 'logistique' || user?.role === 'admin' || user?.role === 'magasinier';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{delivery.deliveryNumber || `Livraison #${delivery.id}`}</h2>
          <p className="text-gray-600">{delivery.projectName || 'Projet non spécifié'}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {getStatusBadge(delivery.status)}
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p>{delivery.clientName || 'Non spécifié'}</p>
                  </div>
                </div>
                
                {delivery.commercial && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Commercial</p>
                      <p>{delivery.commercial.firstName} {delivery.commercial.lastName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adresse de livraison</p>
                    <p>{delivery.deliveryAddress || 'Non spécifiée'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de livraison prévue</p>
                    <p>{formatDate(delivery.deliveryDate)}</p>
                  </div>
                </div>

                {delivery.actualDeliveryDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date de livraison effective</p>
                      <p>{formatDate(delivery.actualDeliveryDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantité totale</p>
                    <p>{delivery.totalQuantity || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              {delivery.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="whitespace-pre-wrap">{delivery.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">Produits à livrer</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {delivery.products && delivery.products.length > 0 ? (
                      delivery.products.map((product: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{product.name}</td>
                          <td className="px-4 py-2">{product.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
                          Aucun produit spécifié
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">Informations de transport</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Chauffeur</p>
                  <p>{delivery.driverName || 'Non assigné'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Véhicule</p>
                  <p>{delivery.vehicleInfo || 'Non spécifié'}</p>
                </div>
              </div>

              {delivery.signature && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Signature</p>
                  <div className="mt-2 p-4 border border-gray-200 rounded-md">
                    <p>Signature reçue</p>
                  </div>
                </div>
              )}

              {canModifyStatus && (
                <div className="mt-6">
                  <h5 className="font-medium mb-3">Mettre à jour le statut</h5>
                  <div className="flex space-x-2">
                    <Button 
                      variant={delivery.status === 'Préparée' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('Préparée')}
                    >
                      Préparée
                    </Button>
                    <Button 
                      variant={delivery.status === 'En transit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('En transit')}
                    >
                      En transit
                    </Button>
                    <Button 
                      variant={delivery.status === 'Livrée' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('Livrée')}
                    >
                      Livrée
                    </Button>
                    <Button 
                      variant={delivery.status === 'Annulée' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('Annulée')}
                    >
                      Annulée
                    </Button>
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

export default DeliveryDetailView;