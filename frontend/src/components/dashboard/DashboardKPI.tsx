import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInventoryData } from '../../hooks/useInventoryData'; // Use the correct hook
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Package, TruckIcon, BarChart3, Bell, ShoppingBag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUnreadNotifications } from '@/services/projectRecord.service';

interface MonthlyStats {
  month: string;
  productsAdded: number;
  stockLevel: number;
  deliveries: number;
}

const DashboardKPI = () => {
  const { user } = useAuth();
  const { products: inventory } = useInventoryData(); // Use the correct hook and destructure products as inventory
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [logisticsNotifications, setLogisticsNotifications] = useState({
    fromBilling: 0,
    fromPurchasing: 0
  });

  // Check if user is logistics
  const isLogistics = user && (user.role === 'logistique' || user.role === 'magasinier');

  // Generate monthly stats based on inventory data
  useEffect(() => {
    if (inventory.length > 0) {
      const today = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize stats for the last 6 months
      const stats: MonthlyStats[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        stats.push({
          month: monthNames[d.getMonth()],
          productsAdded: 0,
          stockLevel: 0,
          deliveries: 0
        });
      }
      
      // Calculate stats from inventory
      let totalQuantity = 0;
      const lowStock: any[] = [];
      const recent: any[] = [];
      
      inventory.forEach(item => {
        totalQuantity += item.quantity;
        
        // Check if item is low stock (< 5 items)
        if (item.quantity < 5) {
          lowStock.push(item);
        }
        
        // Process recent items (last 30 days)
        const itemDate = new Date(item.lastUpdated);
        const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff <= 30) {
          recent.push(item);
          
          // Add to monthly stats
          const monthIndex = stats.findIndex(s => s.month === monthNames[itemDate.getMonth()]);
          if (monthIndex !== -1) {
            stats[monthIndex].productsAdded += 1;
            stats[monthIndex].stockLevel += item.quantity;
            
            // For demo purposes, assuming every product has been delivered
            // In a real system, would use actual delivery data
            if (item.status !== 'Rupture de stock') {
              stats[monthIndex].deliveries += 1;
            }
          }
        }
      });
      
      setMonthlyStats(stats);
      setTotalProducts(inventory.length);
      setTotalStock(totalQuantity);
      setLowStockItems(lowStock);
      setRecentItems(recent.slice(0, 5)); // Show only 5 most recent items
    }
  }, [inventory]);

  // Get logistics specific notifications
  useEffect(() => {
    if (isLogistics && user) {
      const unreadNotifications = getUnreadNotifications(user.role);
      
      // Count different notification types
      const fromBillingCount = unreadNotifications.filter(n => 
        n.type === 'new_delivery' && n.source === 'service_facturation'
      ).length;
      
      const fromPurchasingCount = unreadNotifications.filter(n => 
        n.type === 'new_order' && n.source === 'responsable_achat'
      ).length;
      
      setLogisticsNotifications({
        fromBilling: fromBillingCount,
        fromPurchasing: fromPurchasingCount
      });
    }
  }, [isLogistics, user]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-systemair-dark mb-4">Tableau de bord</h2>
      
      {/* Afficher les cartes de notification spécifiques pour la logistique */}
      {isLogistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className={`${logisticsNotifications.fromBilling > 0 ? 'border-blue-400 bg-blue-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes de livraison</CardTitle>
              <Bell className={`h-4 w-4 ${logisticsNotifications.fromBilling > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logisticsNotifications.fromBilling}</div>
              <p className="text-xs text-muted-foreground">
                Demandes de livraison du service facturation
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${logisticsNotifications.fromPurchasing > 0 ? 'border-emerald-400 bg-emerald-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouvelles commandes</CardTitle>
              <ShoppingBag className={`h-4 w-4 ${logisticsNotifications.fromPurchasing > 0 ? 'text-emerald-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logisticsNotifications.fromPurchasing}</div>
              <p className="text-xs text-muted-foreground">
                Commandes du responsable achat
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-systemair-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produits au catalogue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-systemair-darkBlue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              Articles en stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Faible Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Produits avec moins de 5 en stock
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="recent">Produits récents</TabsTrigger>
          <TabsTrigger value="low-stock">Faible stock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Statistiques mensuelles</h3>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="productsAdded" name="Produits ajoutés" fill="#1e3a8a" />
                  <Bar dataKey="stockLevel" name="Niveau de stock" fill="#3b82f6" />
                  <Bar dataKey="deliveries" name="Livraisons" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Informations utilisateur</h3>
            <p className="text-gray-600">
              Bienvenue {user?.firstName} {user?.lastName}.
              <br /><br />
              Votre rôle est : <span className="font-medium">{user?.role}</span>
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Produits récemment ajoutés/modifiés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : item.quantity > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status || (item.quantity > 10 
                            ? 'En stock' 
                            : item.quantity > 0 
                              ? 'Stock limité' 
                              : 'Rupture de stock')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Aucun produit récent</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="low-stock">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Produits en stock limité</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {item.status || 'Stock limité'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Tous les produits ont des niveaux de stock adéquats</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${payload[0].payload.month}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default DashboardKPI;
