import React from 'react';
import { Filter, X } from 'lucide-react';
import { InventoryItem } from '@/services/inventory.service';

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

export interface FilterOptions {
  status: string[];
  minQuantity: string;
  maxQuantity: string;
  dateFrom: string;
  dateTo: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, onClose }) => {
  const [filters, setFilters] = React.useState<FilterOptions>({
    status: [],
    minQuantity: '',
    maxQuantity: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const newStatus = checkbox.checked 
        ? [...filters.status, value]
        : filters.status.filter(s => s !== value);
      
      setFilters(prev => ({
        ...prev,
        status: newStatus
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({
      status: [],
      minQuantity: '',
      maxQuantity: '',
      dateFrom: '',
      dateTo: '',
    });
    onFilterChange({
      status: [],
      minQuantity: '',
      maxQuantity: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Statut</label>
          <div className="space-y-2">
            {['En stock', 'Stock limité', 'Rupture de stock'].map((status) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={status}
                  checked={filters.status.includes(status)}
                  onChange={handleFilterChange}
                  className="rounded border-gray-300 text-systemair-blue focus:ring-systemair-blue"
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Quantité min</label>
            <input
              type="number"
              name="minQuantity"
              value={filters.minQuantity}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Quantité max</label>
            <input
              type="number"
              name="maxQuantity"
              value={filters.maxQuantity}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Date début</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Date fin</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-systemair-blue rounded-md hover:bg-systemair-darkBlue"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
