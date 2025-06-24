
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { PurchaseRequest } from "@/types/entities";

interface Props {
  request?: PurchaseRequest | null;
  possibleStatuses: string[];
  onStatusUpdated?: (newStatus: string) => void;
}

// Mapping lisible pour l'utilisateur.
const LABELS: { [K in string]: string } = {
  'À traiter (logistique)': "À traiter (logistique)",
  'En traitement': "En traitement",
  'Expédiée': "Expédiée",
  'Livrée': "Livrée"
};

const PurchaseRequestLogisticsStatusSelector: React.FC<Props> = ({
  request,
  possibleStatuses,
  onStatusUpdated,
}) => {
  // Early return if request is not available
  if (!request) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-sm">Demande d'achat non disponible</span>
      </div>
    );
  }

  const [requestStatus, setRequestStatus] = useState<string>(request.status || "À traiter (logistique)");
  const [loading, setLoading] = useState(false);
  const { updateLogisticsStatus } = usePurchaseRequests();

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as keyof typeof LABELS;
    if (newStatus === requestStatus) return;
    setLoading(true);

    try {
      const response = await updateLogisticsStatus(request.id, newStatus);
      if (response.success) {
        setRequestStatus(newStatus);
        if (onStatusUpdated) onStatusUpdated(newStatus);
      }
    } catch (error) {
      console.error('Error updating logistics status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        className="mr-1 text-sm text-gray-600"
        htmlFor={`status-select-pr-${request.id}`}
      >
        Statut logistique :
      </label>
      <select
        id={`status-select-pr-${request.id}`}
        className="border px-2 py-1 rounded bg-white z-20"
        value={requestStatus}
        disabled={loading}
        onChange={handleChange}
      >
        {possibleStatuses.map((opt) => (
          <option key={opt} value={opt}>
            {LABELS[opt] || opt}
          </option>
        ))}
      </select>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
    </div>
  );
};

export default PurchaseRequestLogisticsStatusSelector;