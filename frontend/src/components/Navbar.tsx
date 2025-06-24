
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { FileText, FileSpreadsheet, Home, LogOut, Menu, Package, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useMobile } from "../contexts/MobileContext";
import { useToast } from "@/hooks/use-toast";

// Import UI components from the correct locations
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import NotificationsPanel from "@/components/notifications/NotificationsPanel";

const Navbar = () => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { isMobile } = useMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Define handleLogout function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isCommercial = user && (user.role === 'commercial');
  const isDirectorCommercial = user && (user.role === 'directeur_commercial');
  const isBilling = user && user.role === 'service_facturation';

  // Function to translate roles - moved from importing to internal function
  const translateRole = (role: string): string => {
    const translations: Record<string, string> = {
      admin: 'Administrateur',
      commercial: 'Commercial',
      magasinier: 'Magasinier',
      directeur_general: 'Directeur Général',
      directeur_commercial: 'Directeur Commercial',
      directeur_financier: 'Directeur Financier',
      logistique: 'Logistique',
      responsable_achat: 'Responsable d\'Achat',
      service_facturation: 'Service Facturation'
    };
    
    return translations[role] || role;
  };

  return (
    <div className="fixed top-0 w-full bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/9f771d38-8150-4e0e-a2e1-9ded7a2ced8d.png" 
                alt="Logo" 
                className="h-10 w-10 mr-2" 
              />
              <span className="text-lg font-semibold hidden sm:block text-systemair-dark">Systemair</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                <Link 
                  to="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                >
                  Accueil
                </Link>
                <Link 
                  to="/inventory" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                >
                  Stock
                </Link>
                
                {/* Show Purchase Requests Link for everyone EXCEPT service_facturation */}
                {user.role !== 'service_facturation' && (
                  <Link 
                    to="/purchase-requests" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                  >
                    Demandes d'achat
                  </Link>
                )}
                
                {/* Affichage conditionnel des liens selon le rôle */}
                {(user.role === 'admin' || user.role === 'commercial' || user.role === 'directeur_commercial' || user.role === 'service_facturation') && (
                  <Link 
                    to="/project-records" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                  >
                    Fiches Projet
                  </Link>
                )}
                
                {/* Accès à la page de livraison pour service facturation aussi */}
                {(user.role === 'admin' || user.role === 'magasinier' || user.role === 'logistique' || user.role === 'service_facturation' || user.role === 'directeur_commercial') && (
                  <Link 
                    to="/delivery" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                  >
                    Livraison
                  </Link>
                )}
                
                {/* Lien administration réservé aux admins */}
                {user.role === 'admin' && (
                  <Link 
                    to="/user-management" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-systemair-blue"
                  >
                    Utilisateurs
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="relative flex items-center">
                {/* Notifications */}
                <div className="mr-2">
                  <NotificationsPanel />
                </div>
                
                <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-8 w-8 overflow-hidden">
                      <Avatar>
                        <AvatarFallback className="bg-systemair-blue text-white">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="p-2 border-b">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{translateRole(user.role)}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Accueil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/inventory')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Stock</span>
                    </DropdownMenuItem>
                    
                    {/* Show Purchase Requests in menu for director commercial */}
                    {isDirectorCommercial && (
                      <DropdownMenuItem onClick={() => navigate('/purchase-requests')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        <span>Demandes d'achat</span>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Links specific to billing service and director in dropdown menu */}
                    {(isBilling || isDirectorCommercial) && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/project-records')}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Fiches Projet</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/delivery')}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Livraison</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Se connecter
                </Button>
                <Button onClick={() => navigate('/register')}>
                  S'inscrire
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
              <div className="mr-2">
                <NotificationsPanel />
              </div>
            )}
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="p-1">
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link 
              to="/" 
              className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/') 
                ? 'text-white bg-systemair-blue' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            
            {/* Mobile menu for commercial role */}
            {isCommercial && (
              <>
                <Link 
                  to="/purchase-requests" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/purchase-requests') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Demandes d'Achat (DA)
                  </div>
                </Link>
                <Link 
                  to="/project-records" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/project-records') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fiches Projet (FP)
                  </div>
                </Link>
              </>
            )}
            
            {/* Mobile menu for commercial director (view only access) */}
            {isDirectorCommercial && (
              <>
                <Link 
                  to="/purchase-requests" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/purchase-requests') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Demandes d'Achat (Consultation)
                  </div>
                </Link>
                <Link 
                  to="/project-records" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/project-records') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fiches Projet (Consultation)
                  </div>
                </Link>
                <Link 
                  to="/delivery" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/delivery') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Livraison (Consultation)
                  </div>
                </Link>
              </>
            )}
            
            {/* Mobile menu for service facturation */}
            {isBilling && (
              <>
                <Link 
                  to="/project-records" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/project-records') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fiches Projet (FP)
                  </div>
                </Link>
                <Link 
                  to="/delivery" 
                  className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/delivery') 
                    ? 'text-white bg-systemair-blue' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Livraison
                  </div>
                </Link>
              </>
            )}
            
            {/* Don't show materials-add for directors and service facturation on mobile */}
            {user.role !== 'service_facturation' && user.role !== 'directeur_commercial' && (
              <Link 
                to="/materials-add" 
                className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/materials-add') 
                  ? 'text-white bg-systemair-blue' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsOpen(false)}
              >
                Matériels
              </Link>
            )}
            
            {/* Don't duplicate the delivery link for billing service and director */}
            {user.role !== 'service_facturation' && user.role !== 'directeur_commercial' && (
              <Link 
                to="/delivery" 
                className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/delivery') 
                  ? 'text-white bg-systemair-blue' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsOpen(false)}
              >
                Livraison
              </Link>
            )}
            
            <Link 
              to="/inventory" 
              className={`block py-2 px-4 text-sm font-medium rounded ${isActive('/inventory') 
                ? 'text-white bg-systemair-blue' 
                : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setIsOpen(false)}
            >
              Stock
            </Link>
            
            <div className="mt-4 pt-4 border-t">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-systemair-blue flex items-center justify-center text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{translateRole(user.role)}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }} 
                    className="block w-full text-left py-2 px-4 text-sm text-red-600 hover:bg-gray-100 rounded"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block w-full text-center py-2 px-4 bg-systemair-blue text-white rounded text-sm font-medium hover:bg-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour obtenir les initiales
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default Navbar;
