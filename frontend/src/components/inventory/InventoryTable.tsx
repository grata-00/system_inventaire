
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StockIndicator from './StockIndicator';
import ProductImage from './ProductImage';

interface Product {
  id: string;
  name: string;
  quantity: number;
  lastUpdated: string;
  status: string;
  image?: string;
  imageUrl?: string;
  stockId?: string;
  materialId?: string;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

interface InventoryTableProps {
  products: Product[];
  userRole?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  disableActions?: {
    edit?: boolean;
    delete?: boolean;
    add?: boolean;
  };
}

export const InventoryTable = ({ products, userRole, onEdit, onDelete, disableActions }: InventoryTableProps) => {
  // Only admin and magasinier can modify/delete products
  const canModify = (userRole === 'admin' || userRole === 'magasinier') && !disableActions?.edit && !disableActions?.delete;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom du produit</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière MAJ</TableHead>
            {canModify && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <ProductImage 
                  imageUrl={product.imageUrl || product.image} 
                  productName={product.name}
                  className="w-10 h-10"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                <StockIndicator 
                  quantity={product.quantity} 
                  minQuantity={product.minQuantity}
                />
              </TableCell>
              <TableCell>
                {new Date(product.lastUpdated).toLocaleDateString('fr-FR')}
              </TableCell>
              {canModify && (
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(product)}
                      disabled={disableActions?.edit}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(product)}
                      disabled={disableActions?.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;