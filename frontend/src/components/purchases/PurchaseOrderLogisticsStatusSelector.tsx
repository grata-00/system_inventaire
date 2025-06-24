
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
// import { PurchaseOrder } from "@/types/entities";
// import { getTrackingStatusBadgeColor } from "@/utils/getSuiviStatutAchat";

// interface Props {
//   order: PurchaseOrder;
//   possibleStatuses: string[];
//   trackingStatus?: string; // Optional for badge display
//   onStatusUpdated?: (newStatus: string) => void;
// }

// // Mapping avec les nouveaux libellés demandés
// const LABELS: { [K in string]: string } = {
//   'Brouillon': "En cours",
//   'Confirmée': "Confirmée",
//   'Envoyée_Logistique': "Transmise au service logistique",
//   'En_Livraison': "En livraison",
//   'Livrée': "Livrée",
//   'Annulée': "Annulée"
// };

// const PurchaseOrderLogisticsStatusSelector: React.FC<Props> = ({
//   order,
//   possibleStatuses,
//   trackingStatus,
//   onStatusUpdated,
// }) => {
//   const [orderStatus, setOrderStatus] = useState<string>(order.status || "Brouillon");
//   const [loading, setLoading] = useState(false);
//   const { updateOrderStatus } = usePurchaseOrders();

//   const handleChange = async (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     const newStatus = e.target.value as keyof typeof LABELS;
//     if (newStatus === orderStatus) return;
//     setLoading(true);

//     try {
//       const response = await updateOrderStatus(order.id, newStatus);
//       if ("data" in response && response.success && response.data) {
//         setOrderStatus(newStatus);
//         if (onStatusUpdated) onStatusUpdated(newStatus);
//       }
//     } catch (error) {
//       console.error('Error updating order status:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <label
//         className="mr-1 text-sm text-gray-600"
//         htmlFor={`status-select-po-${order.id}`}
//       >
//         Statut du bon de commande :
//       </label>
//       <select
//         id={`status-select-po-${order.id}`}
//         className="border px-2 py-1 rounded bg-white z-20"
//         value={orderStatus}
//         disabled={loading}
//         onChange={handleChange}
//       >
//         {possibleStatuses.map((opt) => (
//           <option key={opt} value={opt}>
//             {LABELS[opt] || opt}
//           </option>
//         ))}
//       </select>
//       {trackingStatus && (
//         <span
//           className={`ml-2 px-2 rounded ${getTrackingStatusBadgeColor(
//             trackingStatus
//           )}`}
//         >
//           {trackingStatus}
//         </span>
//       )}
//       {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
//     </div>
//   );
// };

// export default PurchaseOrderLogisticsStatusSelector;

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { PurchaseOrderData } from "@/services/purchase-orders.api.service";
import { getTrackingStatusBadgeColor } from "@/utils/getSuiviStatutAchat";

interface Props {
  order: PurchaseOrderData;
  possibleStatuses: string[];
  trackingStatus?: string;
  onStatusUpdated?: (newStatus: string) => void;
  // Nouveau prop pour désactiver la redirection
  preventRedirect?: boolean;
}

// Mapping avec les nouveaux libellés demandés
const LABELS: { [K in string]: string } = {
  'Brouillon': "En cours",
  'Confirmée': "Confirmée",
  'Envoyée_Logistique': "Transmise au service logistique",
  'En_Livraison': "En livraison",
  'Livrée': "Livrée",
  'Annulée': "Annulée"
};

const PurchaseOrderLogisticsStatusSelector: React.FC<Props> = ({
  order,
  possibleStatuses,
  trackingStatus,
  onStatusUpdated,
  preventRedirect = false
}) => {
  const [orderStatus, setOrderStatus] = useState<string>(order.status || "Brouillon");
  const [loading, setLoading] = useState(false);
  const { updateOrderStatus } = usePurchaseOrders();

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as keyof typeof LABELS;
    if (newStatus === orderStatus) return;
    setLoading(true);

    try {
      const response = await updateOrderStatus(order.id, newStatus);
      if (response.success) {
        setOrderStatus(newStatus);
        if (onStatusUpdated && !preventRedirect) {
          onStatusUpdated(newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        className="mr-1 text-sm text-gray-600"
        htmlFor={`status-select-po-${order.id}`}
      >
        Statut du bon de commande :
      </label>
      <select
        id={`status-select-po-${order.id}`}
        className="border px-2 py-1 rounded bg-white z-20"
        value={orderStatus}
        disabled={loading}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
      >
        {possibleStatuses.map((opt) => (
          <option key={opt} value={opt}>
            {LABELS[opt] || opt}
          </option>
        ))}
      </select>
      {trackingStatus && (
        <span
          className={`ml-2 px-2 rounded ${getTrackingStatusBadgeColor(
            trackingStatus
          )}`}
        >
          {trackingStatus}
        </span>
      )}
      {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
    </div>
  );
};

export default PurchaseOrderLogisticsStatusSelector;