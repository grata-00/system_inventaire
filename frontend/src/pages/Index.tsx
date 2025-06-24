
import { Package, TruckIcon, BarChart3, Users, Box, FileText, FileSpreadsheet, Bell } from "lucide-react";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import DashboardKPI from "../components/dashboard/DashboardKPI";
import Footer from "../components/layout/Footer";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { hasUnreadNotifications, getPurchaseRequests, PurchaseRequest } from "@/services/purchaseRequest.service";
import { toast } from "sonner";
import { getUnreadNotifications } from "@/services/projectRecord.service";

const Index = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [notifications, setNotifications] = useState<{
    hasApprovedRequests: boolean;
    hasNewRequests: boolean;
    hasSelfApprovedRequests: boolean;
    count: number;
    projectNotifications: number;
    logisticsFromBillingNotifications: number;
    logisticsFromPurchasingNotifications: number;
  }>({
    hasApprovedRequests: false,
    hasNewRequests: false,
    hasSelfApprovedRequests: false,
    count: 0,
    projectNotifications: 0,
    logisticsFromBillingNotifications: 0,
    logisticsFromPurchasingNotifications: 0,
  });

  // Check for director roles
  const isDirector = user && (
    user.role === 'directeur_general' || 
    user.role === 'directeur_commercial' || 
    user.role === 'directeur_financier'
  );

  const isPurchasing = user && user.role === 'responsable_achat';
  const isLogistics = user && (user.role === 'logistique' || user.role === 'magasinier');
  const isBilling = user && user.role === 'service_facturation';
  const isCommercial = user && user.role === 'commercial';

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      const purchaseRequests = getPurchaseRequests();
      setRequests(purchaseRequests);
      
      // Pour le responsable d'achat - montrer les demandes approuvées
      const hasApprovedRequests = purchaseRequests.some(r => r.status === 'approved');
      
      // Pour les directeurs - montrer les nouvelles demandes en attente
      const hasNewRequests = purchaseRequests.some(r => r.status === 'pending');
      
      // Pour les commerciaux - montrer les demandes approuvées qu'ils ont créées
      const hasSelfApprovedRequests = isCommercial ? 
        purchaseRequests.some(r => r.status === 'approved' && r.createdBy.id === user.id) : false;
      
      // Nouvelles notifications pour les fiches projet
      let projectNotificationsCount = 0;
      let logisticsFromBillingCount = 0;
      let logisticsFromPurchasingCount = 0;
      
      // Récupérer les notifications selon le rôle
      if (user) {
        const unreadNotifications = getUnreadNotifications(user.role);
        
        if (isBilling) {
          projectNotificationsCount = unreadNotifications.filter(n => n.type === 'new_project').length;
        }
        
        if (isLogistics) {
          logisticsFromBillingCount = unreadNotifications.filter(n => n.type === 'new_delivery').length;
          logisticsFromPurchasingCount = unreadNotifications.filter(n => n.type === 'new_order').length;
        }
      }
      
      // Compter le total des notifications
      let count = 0;
      if (isPurchasing && hasApprovedRequests) count += purchaseRequests.filter(r => r.status === 'approved').length;
      if (isDirector && hasNewRequests) count += purchaseRequests.filter(r => r.status === 'pending').length;
      if (isCommercial && hasSelfApprovedRequests) count += purchaseRequests.filter(r => r.status === 'approved' && r.createdBy.id === user.id).length;
      if (isBilling) count += projectNotificationsCount;
      if (isLogistics) count += logisticsFromBillingCount + logisticsFromPurchasingCount;
      
      setNotifications({
        hasApprovedRequests,
        hasNewRequests,
        hasSelfApprovedRequests,
        count,
        projectNotifications: projectNotificationsCount,
        logisticsFromBillingNotifications: logisticsFromBillingCount,
        logisticsFromPurchasingNotifications: logisticsFromPurchasingCount
      });
      
      // Afficher notification toast
      if (isPurchasing && hasApprovedRequests) {
        toast.info("Vous avez des demandes d'achat approuvées à traiter", {
          duration: 5000,
        });
      }
      
      if (isDirector && hasNewRequests) {
        toast.info("Vous avez de nouvelles demandes d'achat à examiner", {
          duration: 5000, 
        });
      }
      
      if (isCommercial && hasSelfApprovedRequests) {
        toast.success("Certaines de vos demandes d'achat ont été approuvées", {
          duration: 5000,
        });
      }
      
      if (isBilling && projectNotificationsCount > 0) {
        toast.info(`Vous avez ${projectNotificationsCount} nouvelle(s) fiche(s) projet à traiter`, {
          duration: 5000, 
        });
      }
      
      if (isLogistics && (logisticsFromBillingCount > 0 || logisticsFromPurchasingCount > 0)) {
        toast.info(`Vous avez des nouvelles demandes de livraison à traiter`, {
          duration: 5000, 
        });
      }
    }
  }, [user, isPurchasing, isDirector, isCommercial, isBilling, isLogistics]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Header section with logo and welcome message */}
          <div className="text-center mb-8 mt-8 animate-slide-down">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/9f771d38-8150-4e0e-a2e1-9ded7a2ced8d.png" 
                alt="Systemair Logo" 
                className="h-28 w-28" 
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-systemair-dark">
              Gestion de Stock Systemair
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {user ? `Bienvenue, ${user.firstName} ${user.lastName}` : 'Connectez-vous pour accéder à la plateforme'}
            </p>
          </div>

          {/* Notifications section */}
          {user && notifications.count > 0 && (
            <div className="mb-8">
              {isPurchasing && notifications.hasApprovedRequests && (
                <Link to="/purchase-requests">
                  <Alert className="mb-3 cursor-pointer bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors">
                    <Bell className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="text-amber-800">Demandes à traiter</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {`${requests.filter(r => r.status === 'approved').length} demande(s) d'achat ont été approuvées par tous les directeurs et attendent votre traitement.`}
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
              
              {isDirector && notifications.hasNewRequests && (
                <Link to="/purchase-requests">
                  <Alert className="mb-3 cursor-pointer bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <AlertTitle className="text-blue-800">Nouvelles demandes</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      {`${requests.filter(r => r.status === 'pending').length} nouvelle(s) demande(s) d'achat ont été créées et nécessitent votre approbation.`}
                      <div className="mt-1 text-xs">
                        Cliquez pour consulter et approuver/refuser ces demandes
                      </div>
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
              
              {isCommercial && notifications.hasSelfApprovedRequests && (
                <Link to="/purchase-requests">
                  <Alert className="mb-3 cursor-pointer bg-green-50 border-green-200 hover:bg-green-100 transition-colors">
                    <Bell className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-800">Demandes approuvées</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {`${requests.filter(r => r.status === 'approved' && r.createdBy.id === user.id).length} de vos demandes d'achat ont été approuvées et sont en cours de traitement.`}
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
              
              {/* Notifications pour le service facturation */}
              {isBilling && notifications.projectNotifications > 0 && (
                <Link to="/project-records">
                  <Alert className="mb-3 cursor-pointer bg-purple-50 border-purple-200 hover:bg-purple-100 transition-colors">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <AlertTitle className="text-purple-800">Nouvelles fiches projet</AlertTitle>
                    <AlertDescription className="text-purple-700">
                      {`${notifications.projectNotifications} nouvelle(s) fiche(s) projet ont été créées et nécessitent votre traitement.`}
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
              
              {/* Notifications pour la logistique */}
              {isLogistics && notifications.logisticsFromBillingNotifications > 0 && (
                <Link to="/delivery">
                  <Alert className="mb-3 cursor-pointer bg-indigo-50 border-indigo-200 hover:bg-indigo-100 transition-colors">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    <AlertTitle className="text-indigo-800">Nouvelles livraisons</AlertTitle>
                    <AlertDescription className="text-indigo-700">
                      {`${notifications.logisticsFromBillingNotifications} nouvelle(s) demande(s) de livraison du service facturation attendent votre traitement.`}
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
              
              {isLogistics && notifications.logisticsFromPurchasingNotifications > 0 && (
                <Link to="/delivery">
                  <Alert className="mb-3 cursor-pointer bg-emerald-50 border-emerald-200 hover:bg-emerald-100 transition-colors">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    <AlertTitle className="text-emerald-800">Nouvelles commandes</AlertTitle>
                    <AlertDescription className="text-emerald-700">
                      {`${notifications.logisticsFromPurchasingNotifications} nouvelle(s) commande(s) du responsable achat attendent votre traitement.`}
                    </AlertDescription>
                  </Alert>
                </Link>
              )}
            </div>
          )}
          
          {/* KPI Dashboard Section */}
          {user && (
            <div className="mb-16 animate-fade-in">
              <DashboardKPI />
            </div>
          )}
          
          {/* Cards section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mb-12">
            {/* Common cards for all users */}
            <Card 
              title="Demandes d'Achat"
              description="Créez et suivez vos demandes d'achat ou validez celles des commerciaux."
              icon={FileSpreadsheet}
              path="/purchase-requests"
              color="bg-systemair-blue"
              badge={
                (isPurchasing && notifications.hasApprovedRequests) || 
                (isDirector && notifications.hasNewRequests) || 
                (isCommercial && notifications.hasSelfApprovedRequests) 
                  ? requests.filter(r => 
                      (isPurchasing && r.status === 'approved') || 
                      (isDirector && r.status === 'pending') || 
                      (isCommercial && r.status === 'approved' && r.createdBy.id === user?.id)
                    ).length.toString()
                  : undefined
              }
            />
            
            {/* Fiches Projet - Accessible aux commerciaux, directeur commercial, admin, responsable achat, service facturation, et maintenant directeurs général et financier */}
            {user && (user.role === 'commercial' || user.role === 'directeur_commercial' || user.role === 'directeur_general' || user.role === 'directeur_financier' || user.role === 'admin' || user.role === 'responsable_achat' || user.role === 'service_facturation') && (
              <Card 
                title="Fiches Projet"
                description="Créez et gérez des fiches détaillées pour vos projets commerciaux."
                icon={FileText}
                path="/project-records"
                color="bg-systemair-darkBlue"
                badge={isBilling && notifications.projectNotifications > 0 ? notifications.projectNotifications.toString() : undefined}
              />
            )}
            
            {/* Director specific cards */}
            {isDirector && (
              <Card 
                title="Notifications"
                description="Consultez les demandes à valider et restez informé des mises à jour."
                icon={Bell}
                path="/purchase-requests"
                color="bg-systemair-darkBlue"
                badge={notifications.hasNewRequests ? notifications.count.toString() : undefined}
              />
            )}
            
            {/* Admin and inventory management */}
            {(user?.role === 'admin' || user?.role === 'magasinier' || user?.role === 'responsable_achat') && (
              <Card 
                title="Ajouter des Matériels"
                description="Enregistrez de nouveaux produits avec leurs quantités et dates d'entrée."
                icon={Box}
                path="/materials-add"
                color="bg-systemair-blue"
              />
            )}
            
            {/* Logistics and delivery */}
            {(user?.role === 'admin' || user?.role === 'magasinier' || user?.role === 'logistique' || 
              user?.role === 'directeur_commercial' || user?.role === 'commercial' || user?.role === 'service_facturation') && (
              <Card 
                title="Livraison"
                description="Gérez les commandes, les chefs commerciaux et logistiques, et les entreprises clientes."
                icon={TruckIcon}
                path="/delivery"
                color="bg-systemair-darkBlue"
                badge={
                  isLogistics && (notifications.logisticsFromBillingNotifications > 0 || notifications.logisticsFromPurchasingNotifications > 0)
                    ? (notifications.logisticsFromBillingNotifications + notifications.logisticsFromPurchasingNotifications).toString()
                    : undefined
                }
              />
            )}
            
            {/* Stock visibility for all users */}
            <Card 
              title="Stock"
              description="Consultez la base de données de votre inventaire et suivez les mouvements des produits."
              icon={BarChart3}
              path="/inventory"
              color="bg-systemair-blue"
            />
            
            {/* Admin section for user management */}
            {user && user.role === 'admin' && (
              <Card 
                title="Gestion des Utilisateurs"
                description="Activez les comptes et gérez les rôles des utilisateurs de la plateforme."
                icon={Users}
                path="/user-management"
                color="bg-systemair-darkBlue"
              />
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;