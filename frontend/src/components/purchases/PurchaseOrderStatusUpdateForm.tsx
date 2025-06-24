
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Loader2 } from "lucide-react";

interface StatusFormProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
  statuses: { value: string; label: string }[];
}

export const PurchaseOrderStatusUpdateForm: React.FC<StatusFormProps> = ({
  orderId,
  currentStatus,
  onStatusUpdated,
  statuses
}) => {
  const [status, setStatus] = useState(currentStatus);
  const { updateOrderStatus } = usePurchaseOrders();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await updateOrderStatus(orderId, status);
    setLoading(false);
    if (onStatusUpdated) onStatusUpdated();
  };

  return (
    <div className="flex gap-2 items-center mt-2">
      <Select
        value={status}
        onValueChange={setStatus}
        disabled={loading}
      >
        {statuses.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Button onClick={handleUpdate} disabled={loading || status === currentStatus}>
        {loading && <Loader2 className="animate-spin mr-2" />}
        Mettre à jour
      </Button>
    </div>
  );
};