
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface StockFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const StockFilter = ({ value, onValueChange, className }: StockFilterProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Filter className="w-4 h-4 text-gray-500" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="in-stock">En stock</SelectItem>
          <SelectItem value="low-stock">Stock limité</SelectItem>
          <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StockFilter;