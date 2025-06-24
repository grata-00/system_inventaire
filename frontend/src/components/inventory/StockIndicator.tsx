
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StockIndicatorProps {
  quantity: number;
  minQuantity?: number;
  className?: string;
}

export const StockIndicator = ({ quantity, minQuantity = 5, className }: StockIndicatorProps) => {
  const getStockStatus = () => {
    if (quantity === 0) {
      return {
        label: 'Rupture de stock',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    } else if (quantity <= minQuantity) {
      return {
        label: 'Stock limité',
        variant: 'secondary' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    } else {
      return {
        label: 'En stock',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    }
  };

  const status = getStockStatus();

  return (
    <Badge 
      variant="outline" 
      className={`${status.className} ${className}`}
    >
      {status.label}
    </Badge>
  );
};

export default StockIndicator;