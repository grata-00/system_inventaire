import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { inventoryApiService } from '@/services/inventory.api.service';
import StockFilter from '@/components/inventory/StockFilter';
import InventoryTable from '@/components/inventory/InventoryTable';
import EditStockDialog from '@/components/inventory/EditStockDialog';
import DeleteStockDialog from '@/components/inventory/DeleteStockDialog';

const Inventory = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { products, loading, error, refetch } = useInventoryData();
  const {
    filteredProducts,
    statusFilter,
    setStatusFilter,
    searchFilter,
    setSearchFilter,
    stockCounts
  } = useInventoryFilters(products);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check user permissions
  const canModifyStock = hasRole(['admin', 'magasinier']);
  const canAddMaterial = hasRole(['admin', 'magasinier']);

  const handleAddMaterial = () => {
    navigate('/materials-add');
  };

  const handleEdit = (product: any) => {
    if (!canModifyStock) return;
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product: any) => {
    if (!canModifyStock) return;
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (productId: string, updates: any) => {
    try {
      console.log('Updating stock:', { productId, updates });
      
      // Utiliser l'API de mouvement de stock
      const response = await inventoryApiService.createStockMovement({
        materialId: editingProduct.materialId,
        quantity: updates.quantity,
        movement: updates.movement,
        location: updates.location
      });

      if (response.success) {
        toast({
          title: "Stock mis à jour",
          description: "Les modifications ont été sauvegardées avec succès.",
        });
        refetch();
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du stock.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async (productId: string) => {
    try {
      console.log('Deleting stock:', productId);
      
      const response = await inventoryApiService.deleteStock(productId);
      
      if (response.success) {
        toast({
          title: "Stock supprimé",
          description: "Le stock a été supprimé avec succès.",
        });
        refetch();
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Error deleting stock:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du stock.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement de l'inventaire...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Inventaire</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos stocks et matériaux
          </p>
        </div>
        {canAddMaterial && (
          <Button onClick={handleAddMaterial}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Matériel
          </Button>
        )}
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockCounts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockCounts.inStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Limité</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stockCounts.lowStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockCounts.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <StockFilter value={statusFilter} onValueChange={setStatusFilter} />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock des Matériaux</CardTitle>
          <CardDescription>
            {filteredProducts.length} produit(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <InventoryTable 
              products={filteredProducts}
              userRole={user?.role}
              onEdit={handleEdit}
              onDelete={handleDelete}
              disableActions={{
                edit: !canModifyStock,
                delete: !canModifyStock
              }}
            />
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500">
                {searchFilter || statusFilter !== 'all' 
                  ? 'Aucun produit ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter des produits à votre inventaire.'
                }
              </p>
              {(searchFilter || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchFilter('');
                    setStatusFilter('all');
                  }}
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {canModifyStock && (
        <EditStockDialog
          product={editingProduct}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Dialog */}
      {canModifyStock && (
        <DeleteStockDialog
          product={deletingProduct}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Inventory;