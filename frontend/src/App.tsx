
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./contexts/MobileContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import MaterialsAdd from "./pages/MaterialsAdd";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";
import UserManagement from "./pages/UserManagement";
import ProjectRecords from "./pages/ProjectRecords";
import PurchaseRequests from "./pages/PurchaseRequests";
import PurchaseOrderManagement from './components/purchases/PurchaseOrderManagement';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MobileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" richColors />
          <BrowserRouter>
            <Routes>
              {/* Pages publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              
              {/* Pages protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Page de gestion des utilisateurs - accessible uniquement aux administrateurs */}
              <Route path="/user-management" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Page d'ajout de matériels - accessible aux admin et magasiniers uniquement (retrait du responsable_achat) */}
              <Route path="/materials-add" element={
                <ProtectedRoute allowedRoles={['admin', 'magasinier']}>
                  <MaterialsAdd />
                </ProtectedRoute>
              } />
              
              {/* Page de livraison - accessible aux admin, commerciaux, directeurs commerciaux, magasiniers et service facturation */}
              <Route path="/delivery" element={
                <ProtectedRoute allowedRoles={['admin', 'commercial', 'directeur_commercial', 'magasinier', 'logistique', 'service_facturation']}>
                  <Delivery />
                </ProtectedRoute>
              } />
              
              {/* Page d'inventaire - ajout du directeur commercial pour consultation uniquement */}
              <Route path="/inventory" element={
                <ProtectedRoute 
                  allowedRoles={['admin', 'magasinier', 'directeur_general', 'directeur_financier', 'directeur_commercial', 'logistique', 'commercial', 'service_facturation', 'responsable_achat']}
                >
                  <Inventory />
                </ProtectedRoute>
              } />
              
              {/* Pages commerciales et service facturation - ajout des directeurs général et financier et responsable_achat */}
              <Route path="/project-records" element={
                <ProtectedRoute allowedRoles={['admin', 'commercial', 'directeur_commercial', 'directeur_general', 'directeur_financier', 'service_facturation', 'responsable_achat']}>
                  <ProjectRecords />
                </ProtectedRoute>
              } />
              
              {/* Réajout du directeur commercial pour les demandes d'achat */}
              <Route path="/purchase-requests" element={
                <ProtectedRoute allowedRoles={['admin', 'commercial', 'directeur_general', 'directeur_financier', 'directeur_commercial', 'responsable_achat', 'logistique', 'magasinier', 'service_facturation']}>
                  <PurchaseRequests />
                </ProtectedRoute>
              } />
              
              {/* Dans les routes, ajouter cette ligne après les autres routes de purchase: */}
              <Route path="/purchase-orders" element={<PurchaseOrderManagement />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MobileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;