import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Truck, User, Users, Package2, MapPin } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useDeliveries } from '@/hooks/useDeliveries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import StockIndicator from '@/components/inventory/StockIndicator';
import ProductImage from '@/components/inventory/ProductImage';
import StockFilter from '@/components/inventory/StockFilter';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';

// Validation schema using Zod
const deliveryFormSchema = z.object({
  commercialName: z.string().min(1, { message: "Le commercial est requis" }),
  transporterName: z.string().min(1, { message: "Le transporteur est requis" }),
  clientName: z.string().min(1, { message: "Le client est requis" }),
  deliveryAddress: z.string().min(1, { message: "L'adresse client est requise" }),
  deliveryDate: z.string().min(1, { message: "La date de livraison est requise" }),
  productName: z.string().min(1, { message: "Le nom du produit est requis" }),
  quantity: z.string().min(1, { message: "La quantité est requise" }),
  notes: z.string().optional(),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

interface AddDeliveryFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddDeliveryForm = ({ onClose, onSuccess }: AddDeliveryFormProps) => {
  const { user } = useAuth();
  const { products: inventory = [], loading = false, refetch: refetchInventory } = useInventoryData();
  const { createDelivery } = useDeliveries();
  
  // State to keep track of selected product and its reference
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  // État pour le dialogue de prévisualisation
  const [showPreview, setShowPreview] = useState(false);
  // État pour stocker les données du formulaire avant soumission
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Use inventory filters
  const {
    filteredProducts,
    statusFilter,
    setStatusFilter,
    getStockStatus
  } = useInventoryFilters(inventory);
  
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      commercialName: '',
      transporterName: '',
      clientName: '',
      deliveryAddress: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      productName: '',
      quantity: '',
      notes: '',
    },
  });

  // Handle product selection change
  useEffect(() => {
    const productName = form.watch('productName');
    if (productName) {
      const product = inventory.find(item => item.name === productName);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [form.watch('productName'), inventory]);
  
  // Fonction pour prévisualiser les données avant de soumettre
  const handlePreview = (values: DeliveryFormValues) => {
    try {
      // Récupérer le produit sélectionné pour obtenir le stock initial et stockId
      const selectedInventoryProduct = inventory.find(item => item.name === values.productName);
      const initialStock = selectedInventoryProduct ? selectedInventoryProduct.quantity : 0;
      const stockId = selectedInventoryProduct?.id; // Use 'id' instead of 'stockId'
      
      // Créer un tableau de produits avec la structure appropriée incluant stockId
      const products = [{
        name: values.productName,
        quantity: parseInt(values.quantity, 10),
        initialStock: initialStock,
        stockId: stockId // Include stockId for backend processing
      }];
      
      // Créer l'objet de livraison avec toutes les informations
      const deliveryData = {
        projectName: values.clientName + " - " + values.productName,
        clientName: values.clientName,
        deliveryAddress: values.deliveryAddress,
        deliveryDate: values.deliveryDate,
        products: products,
        driverName: values.transporterName,
        vehicleInfo: '',
        notes: values.notes || ''
      };
      
      // Stocker les données pour la prévisualisation
      setPreviewData(deliveryData);
      // Afficher le dialogue de prévisualisation
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      toast.error('Erreur lors de la préparation de la prévisualisation');
    }
  };

  const onSubmit = (values: DeliveryFormValues) => {
    // Au lieu de soumettre directement, nous prévisualisons d'abord
    handlePreview(values);
  };
  
  // Fonction pour finaliser la création de la livraison avec mise à jour du stock
  const handleConfirmDelivery = async () => {
    if (!previewData) return;
    
    try {
      console.log('Creating delivery with backend API (including stockId):', previewData);
      const response = await createDelivery(previewData);
      
      if (response.success) {
        toast.success('Livraison créée avec succès - Stock mis à jour automatiquement');
        
        // Actualiser les données d'inventaire après la création de la livraison
        await refetchInventory();
        
        // Réinitialiser le formulaire et les états
        form.reset();
        setSelectedProduct(null);
        setShowPreview(false);
        setPreviewData(null);
        
        // Callback si fourni
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(response.error || 'Erreur lors de la création de la livraison');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la livraison:', error);
      toast.error('Erreur lors de la création de la livraison');
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nouvelle demande de livraison</CardTitle>
          <CardDescription>Créez une nouvelle demande de livraison</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="commercialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commercial</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pl-10" />
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transporterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transporteur</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pl-10" />
                          <Truck className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pl-10" />
                          <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse client</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pl-10" />
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de livraison</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className="pl-10" />
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <StockFilter 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                  className="w-full"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produit</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Sélectionner un produit" />
                              <Package2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </SelectTrigger>
                            <SelectContent>
                              {loading ? (
                                <SelectItem value="loading" disabled>Chargement des produits...</SelectItem>
                              ) : (filteredProducts && filteredProducts.length > 0) ? (
                                filteredProducts.map((product: any) => (
                                  <SelectItem key={product.id} value={product.name}>
                                    <div className="flex items-center space-x-2">
                                      <ProductImage 
                                        imageUrl={product.imageUrl || product.image} 
                                        productName={product.name} 
                                        className="w-6 h-6"
                                      />
                                      <span>{product.name}</span>
                                      <StockIndicator 
                                        quantity={product.quantity} 
                                        minQuantity={product.minQuantity} 
                                        className="ml-auto"
                                      />
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty" disabled>Aucun produit disponible</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              {...field} 
                              className="pl-10"
                              min="1"
                              max={selectedProduct?.quantity || 999}
                            />
                            <Package2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        {selectedProduct && (
                          <div className="flex items-center space-x-2 mt-1">
                            <ProductImage 
                              imageUrl={selectedProduct.imageUrl || selectedProduct.image} 
                              productName={selectedProduct.name} 
                              className="w-8 h-8"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">
                                Stock disponible: {selectedProduct.quantity || 0} unités
                              </p>
                              <StockIndicator 
                                quantity={selectedProduct.quantity} 
                                minQuantity={selectedProduct.minQuantity}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optionnel)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notes ou instructions spéciales" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="px-0 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit">Prévisualiser la demande</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Dialogue de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirmer les détails de la livraison</DialogTitle>
            <DialogDescription>
              Vérifiez toutes les informations avant de créer la demande de livraison. Le stock sera automatiquement mis à jour.
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Informations générales</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-semibold">Projet:</span> {previewData.projectName}</p>
                    <p><span className="font-semibold">Client:</span> {previewData.clientName}</p>
                    <p><span className="font-semibold">Transporteur:</span> {previewData.driverName}</p>
                    <p><span className="font-semibold">Adresse:</span> {previewData.deliveryAddress}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Dates et notes</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-semibold">Date de livraison:</span> {new Date(previewData.deliveryDate).toLocaleDateString('fr-FR')}</p>
                    {previewData.notes && (
                      <p><span className="font-semibold">Notes:</span> {previewData.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Produits et impact sur le stock</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {previewData.products.map((product: any, index: number) => {
                    const newStock = product.initialStock - product.quantity;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ProductImage 
                            imageUrl={selectedProduct?.imageUrl || selectedProduct?.image} 
                            productName={product.name} 
                            className="w-12 h-12"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-gray-600">Quantité à livrer: {product.quantity}</p>
                          </div>
                        </div>
                        <div className="pl-14 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Stock actuel:</span>
                            <StockIndicator 
                              quantity={product.initialStock} 
                              minQuantity={selectedProduct?.minQuantity}
                            />
                            <span className="text-sm">{product.initialStock} unités</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Stock après livraison:</span>
                            <StockIndicator 
                              quantity={newStock} 
                              minQuantity={selectedProduct?.minQuantity}
                            />
                            <span className="text-sm">{newStock} unités</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Annuler</Button>
            <Button onClick={handleConfirmDelivery}>Confirmer et créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddDeliveryForm;