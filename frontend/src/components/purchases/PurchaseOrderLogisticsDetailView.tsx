import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/contexts/AuthContext";
import { PurchaseOrderStatusUpdateForm } from "./PurchaseOrderStatusUpdateForm";
import { PurchaseOrderPdfViewer } from "./PurchaseOrderPdfViewer";

export interface PurchaseOrderLogisticsDetailViewProps {
  order: any;
  onClose: () => void;
}

const statusLabels = {
  'Brouillon': 'En cours',
  'Confirmée': 'Confirmée',
  'Envoyée_Logistique': 'Transmise au service logistique',
  'En_Livraison': 'En livraison',
  'Livrée': 'Livrée',
  'Annulée': 'Annulée',
};

const badgeColor = (status: string) => {
  switch (status) {
    case 'Envoyée_Logistique':
      return 'bg-blue-100 text-blue-800';
    case 'En_Livraison':
      return 'bg-cyan-100 text-cyan-800';
    case 'Livrée':
      return 'bg-green-100 text-green-800';
    case 'Annulée':
      return 'bg-red-100 text-red-800';
    case 'Confirmée':
      return 'bg-purple-100 text-purple-800';
    case 'Brouillon':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function formatDate(date?: string) {
  if (!date) return "Non définie";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return String(date);
  }
}

// Statuts accessibles par la logistique avec nouveaux libellés
const STATUS_OPTIONS = [
  { value: "Brouillon", label: "En cours" },
  { value: "Confirmée", label: "Confirmée" },
  { value: "Envoyée_Logistique", label: "Transmise au service logistique" },
  { value: "En_Livraison", label: "En livraison" },
  { value: "Livrée", label: "Livrée" },
  { value: "Annulée", label: "Annulée" }
];

const PurchaseOrderLogisticsDetailView: React.FC<PurchaseOrderLogisticsDetailViewProps> = ({ order, onClose }) => {
  const { user } = useAuth();
  const [showPdf, setShowPdf] = useState(false);

  if (!order) return null;
  // Les infos associées à la purchase request
  const request = order.purchaseRequest || order.PurchaseRequest;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 relative">
        <button 
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          onClick={onClose}>✕</button>
        <h3 className="font-bold text-lg mb-2">Détail du bon de commande logistique</h3>
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                BC #{order.orderNumber || order.id}
              </CardTitle>
              <Badge className={badgeColor(order.status)}>{statusLabels[order.status] || order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fournisseur: {order.supplier}</p>
                <p className="text-sm text-gray-600">Montant total: {order.totalAmount} €</p>
                <p className="text-sm text-gray-600">Date de commande: {formatDate(order.orderDate)}</p>
                <p className="text-sm text-gray-600">Livraison prévue: {formatDate(order.expectedDeliveryDate)}</p>
                <p className="text-sm text-gray-600">Livraison réelle: {formatDate(order.actualDeliveryDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut actuel: {statusLabels[order.status] || order.status}</p>
                {order.notes && <p className="text-sm mt-2">Notes: {order.notes}</p>}
                {/* Permettre update uniquement si logistique */}
                {user?.role === "logistique" && (
                  <PurchaseOrderStatusUpdateForm
                    orderId={order.id}
                    currentStatus={order.status}
                    statuses={STATUS_OPTIONS}
                    onStatusUpdated={onClose}
                  />
                )}
                <button
                  onClick={() => setShowPdf(!showPdf)}
                  className="mt-3 underline text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  {showPdf ? "Cacher le PDF du bon de commande" : "Voir le PDF du bon de commande"}
                </button>
              </div>
            </div>
            {showPdf && (
              <div className="mt-4">
                <PurchaseOrderPdfViewer
                  pdfDataUri={order.pdfDataUri}
                  requestNumber={order.orderNumber || order.id}
                />
              </div>
            )}
            <div className="my-4">
              <h4 className="font-medium">Produits :</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(order.products) && order.products.map((prod: any, i: number) => (
                  <li key={i}>{prod.name} (Qté: {prod.quantity}{prod.estimatedPrice ? `, PU: ${prod.estimatedPrice} €` : ""})</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        {request && (
          <Card>
            <CardHeader>
              <CardTitle>Données associées à la demande d&apos;achat #{request.requestNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Projet: {request.projectName}</p>
                  <p className="text-sm text-gray-600">Produit demandé: {request.productName}</p>
                  <p className="text-sm text-gray-600">Quantité: {request.quantity}</p>
                  <p className="text-sm text-gray-600">Priorité: {request.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Demandeur: {request.commercialName}</p>
                  <p className="text-sm text-gray-600">Date de livraison souhaitée: {formatDate(request.deliveryDate)}</p>
                  <p className="text-sm text-gray-600">Montant estimé: {request.estimatedPrice} €</p>
                  {request.notes && <p className="text-sm mt-2">Notes: {request.notes}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderLogisticsDetailView;