import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, UserRole, translateRole, RegisterData } from "../services/auth.service";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Shield, ShieldX, UserCheck, UserX, Eye, EyeOff, UserCog, Trash } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

const UserManagement = () => {
  const { user: currentUser, getUsers, activateUser, deactivateUser, updateUserRoles, hasRole, deleteUser, register } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "commercial" as UserRole,
    roles: ["commercial"] as UserRole[],
    isActive: false
  });

  // Chargement initial des utilisateurs
  useEffect(() => {
    refreshUsers();
  }, []);

  // Tous les rôles disponibles
  const availableRoles: UserRole[] = [
    "admin", 
    "commercial", 
    "magasinier", 
    "directeur_general",
    "directeur_commercial",
    "directeur_financier", 
    "logistique", 
    "responsable_achat",
    "service_facturation"
  ];

  // Mettre à jour la liste des utilisateurs
  const refreshUsers = async () => {
    try {
      const usersList = await getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  // Gérer l'activation d'un utilisateur
  const handleActivateUser = async (userId: string) => {
    const success = await activateUser(userId);
    if (success) {
      toast.success("Utilisateur activé avec succès");
      refreshUsers();
    }
  };

  // Gérer la désactivation d'un utilisateur
  const handleDeactivateUser = async (userId: string) => {
    const success = await deactivateUser(userId);
    if (success) {
      toast.success("Utilisateur désactivé avec succès");
      refreshUsers();
    }
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      const success = await deleteUser(userId);
      if (success) {
        toast.success("Utilisateur supprimé avec succès");
        refreshUsers();
      }
    }
  };

  // Ouvrir la boîte de dialogue pour modifier les rôles
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || [user.role]);
    setIsRoleDialogOpen(true);
  };

  // Ouvrir la boîte de dialogue pour ajouter un nouvel utilisateur
  const openNewUserDialog = () => {
    setNewUser({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "commercial",
      roles: ["commercial"],
      isActive: false
    });
    setIsPasswordVisible(false);
    setIsNewUserDialogOpen(true);
  };

  // Basculer un rôle pour l'utilisateur sélectionné
  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      // Ne pas permettre de supprimer tous les rôles
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== role));
      } else {
        toast.error("L'utilisateur doit avoir au moins un rôle");
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // Basculer un rôle pour le nouvel utilisateur
  const toggleNewUserRole = (role: UserRole) => {
    if (newUser.roles?.includes(role)) {
      if ((newUser.roles?.length || 0) > 1) {
        const updatedRoles = newUser.roles?.filter(r => r !== role) || [];
        setNewUser({
          ...newUser,
          roles: updatedRoles,
          role: updatedRoles[0] || "commercial"
        });
      } else {
        toast.error("L'utilisateur doit avoir au moins un rôle");
      }
    } else {
      const updatedRoles = [...(newUser.roles || []), role];
      setNewUser({
        ...newUser,
        roles: updatedRoles,
        role: newUser.role || role
      });
    }
  };

  // Sauvegarder les modifications de rôles
  const saveRoles = async () => {
    if (!selectedUser || selectedRoles.length === 0) return;
    
    const success = await updateUserRoles(
      selectedUser.id, 
      selectedRoles[0], // Premier rôle comme rôle principal
      selectedRoles
    );
    
    if (success) {
      toast.success("Rôles mis à jour avec succès");
      refreshUsers();
      setIsRoleDialogOpen(false);
    }
  };

  // Ajouter un nouvel utilisateur
  const addNewUser = async () => {
    const { email, password, firstName, lastName, role, roles, isActive } = newUser;
    
    if (!email || !password || !firstName || !lastName) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!roles || roles.length === 0) {
      toast.error("Veuillez sélectionner au moins un rôle");
      return;
    }

    try {
      const userData: RegisterData = { 
        email, 
        password, 
        firstName, 
        lastName, 
        role: role || roles[0], 
        roles,
        isActive
      };
      
      const createdUser = await register(userData);
      if (createdUser) {
        toast.success(`Utilisateur ${createdUser.firstName} ${createdUser.lastName} créé avec succès`);
        refreshUsers();
        setIsNewUserDialogOpen(false);
      }
    } catch (error) {
      toast.error("Erreur lors de la création de l'utilisateur");
    }
  };

  // Vérifier si l'utilisateur courant est administrateur
  if (!currentUser || !hasRole('admin')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Accès refusé</h1>
          <p className="text-gray-700 mb-6">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <Link 
            to="/" 
            className="block w-full text-center bg-systemair-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <div className="flex space-x-2">
          <button
            onClick={openNewUserDialog}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <UserCog size={18} /> Nouveau compte
          </button>
          <Link 
            to="/"
            className="bg-systemair-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h2 className="font-semibold text-lg text-blue-700">Gestion des droits d'accès</h2>
          <p className="text-sm text-blue-600">
            Activez ou désactivez des comptes et attribuez des rôles aux utilisateurs.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.id === currentUser?.id ? "bg-blue-50" : ""}>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  {user.id === currentUser?.id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Vous
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(user.roles || [user.role]).map((role) => (
                      <span 
                        key={role} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {translateRole(role)}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Désactivé
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    {/* Bouton de modification des rôles */}
                    <button
                      onClick={() => openRoleDialog(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                      title="Modifier les rôles"
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                    
                    {/* Bouton d'activation/désactivation */}
                    {user.id !== currentUser?.id && (
                      user.isActive ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Désactiver le compte"
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Activer le compte"
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                      )
                    )}
                    
                    {/* Bouton de suppression */}
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Boîte de dialogue pour modifier les rôles */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les rôles</DialogTitle>
            <DialogDescription>
              Attribuez un ou plusieurs rôles à cet utilisateur
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Modifier les rôles pour {selectedUser.firstName} {selectedUser.lastName}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2">
                {availableRoles.map((role) => (
                  <div 
                    key={role}
                    onClick={() => toggleRole(role)} 
                    className={`cursor-pointer flex items-center justify-between p-2 rounded-md ${
                      selectedRoles.includes(role) 
                        ? 'bg-systemair-blue text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <span>{translateRole(role)}</span>
                    {selectedRoles.includes(role) ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <ShieldX className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={saveRoles}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour créer un nouvel utilisateur */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau compte</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur au système
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input 
                  type="text" 
                  id="firstName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input 
                  type="text" 
                  id="lastName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input 
                  type={isPasswordVisible ? "text" : "password"} 
                  id="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {availableRoles.map((role) => (
                  <div 
                    key={role}
                    onClick={() => toggleNewUserRole(role)} 
                    className={`cursor-pointer flex items-center justify-between p-2 rounded-md ${
                      newUser.roles?.includes(role) 
                        ? 'bg-systemair-blue text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <span>{translateRole(role)}</span>
                    {newUser.roles?.includes(role) ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <ShieldX className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut initial
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="initialStatus"
                    checked={newUser.isActive === true}
                    onChange={() => setNewUser({...newUser, isActive: true})}
                  />
                  <span className="ml-2">Activé</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="initialStatus"
                    checked={newUser.isActive === false}
                    onChange={() => setNewUser({...newUser, isActive: false})}
                  />
                  <span className="ml-2">En attente d'activation</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-2 pb-2">
            <Button
              variant="outline"
              onClick={() => setIsNewUserDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={addNewUser}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
