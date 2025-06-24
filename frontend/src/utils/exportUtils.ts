
import { Product } from '../types/entities';
import { ProjectRecord } from '@/pages/ProjectRecords';

type ExportableItem = {
  id: string;
  name: string;
  quantity: number | string;
  lastUpdated: string;
  status?: string;
};

export const exportToCSV = (items: Product[] | ExportableItem[]) => {
  const headers = ['ID', 'Nom', 'Quantité', 'Dernière Mise à Jour', 'Statut'];
  const rows = items.map(item => [
    item.id,
    item.name,
    typeof item.quantity === 'number' ? item.quantity.toString() : item.quantity,
    item.lastUpdated,
    item.status || 'Non défini'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
