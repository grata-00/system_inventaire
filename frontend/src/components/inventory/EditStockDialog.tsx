
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  quantity: number;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

interface EditStockDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productId: string, updates: any) => void;
}

export const EditStockDialog = ({ product, open, onOpenChange, onSave }: EditStockDialogProps) => {
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [location, setLocation] = useState(product?.location || '');
  const [minQuantity, setMinQuantity] = useState(product?.minQuantity || 5);
  const [movement, setMovement] = useState<'Entrée' | 'Sortie' | 'Ajustement'>('Ajustement');

  React.useEffect(() => {
    if (product) {
      setQuantity(product.quantity);
      setLocation(product.location || '');
      setMinQuantity(product.minQuantity || 5);
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    
    onSave(product.id, {
      quantity,
      location,
      minQuantity,
      movement
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le stock</DialogTitle>
          <DialogDescription>
            Modifiez les informations de stock pour {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantité
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="movement" className="text-right">
              Type de mouvement
            </Label>
            <Select value={movement} onValueChange={(value: 'Entrée' | 'Sortie' | 'Ajustement') => setMovement(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrée">Entrée</SelectItem>
                <SelectItem value="Sortie">Sortie</SelectItem>
                <SelectItem value="Ajustement">Ajustement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Emplacement
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              placeholder="Magasin principal"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minQuantity" className="text-right">
              Seuil minimum
            </Label>
            <Input
              id="minQuantity"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(parseInt(e.target.value) || 5)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockDialog;