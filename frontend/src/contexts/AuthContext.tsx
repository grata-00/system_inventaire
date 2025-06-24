
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types/entities';
import { authApiService, LoginCredentials, RegisterData } from '../services/auth.api.service';
import { usersApiService } from '../services/users.api.service';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<User | null>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
  // User management methods
  getUsers: () => Promise<User[]>;
  activateUser: (userId: string) => Promise<boolean>;
  deactivateUser: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserRoles: (userId: string, role: UserRole, roles?: UserRole[]) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authApiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authApiService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        toast.success(`Bienvenue, ${response.data.user.firstName} !`);
        setLoading(false);
        return true;
      } else {
        toast.error(response.error || 'Email ou mot de passe incorrect');
        setLoading(false);
        return false;
      }
    } catch (err) {
      toast.error('Une erreur est survenue lors de la connexion');
      setLoading(false);
      return false;
    }
  };

  const handleRegister = async (data: RegisterData): Promise<User | null> => {
    setLoading(true);
    try {
      // Si c'est un admin qui crée un utilisateur, utiliser l'API users
      if (user && user.role === 'admin') {
        const response = await usersApiService.createUser({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'commercial',
          isActive: false
        });
        if (response.success && response.data) {
          toast.success("Utilisateur créé avec succès");
          setLoading(false);
          return response.data;
        } else {
          toast.error(response.error || 'Erreur lors de la création de l\'utilisateur');
          setLoading(false);
          return null;
        }
      } else {
        // Inscription normale
        const response = await authApiService.register(data);
        if (response.success && response.data) {
          toast.success("Compte créé avec succès. En attente d'activation.");
          setLoading(false);
          return response.data;
        } else {
          toast.error(response.error || 'Erreur lors de l\'inscription');
          setLoading(false);
          return null;
        }
      }
    } catch (err) {
      toast.error('Une erreur est survenue lors de l\'inscription');
      setLoading(false);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await authApiService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.info("Vous avez été déconnecté");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement utilisateur:', error);
    }
  };

  const handleHasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  // User management methods
  const handleGetUsers = async (): Promise<User[]> => {
    try {
      const response = await usersApiService.getUsers();
      if (response.success && response.data) {
        return response.data;
      } else {
        toast.error(response.error || 'Erreur lors de la récupération des utilisateurs');
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
      return [];
    }
  };

  const handleActivateUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await usersApiService.activateUser(userId);
      if (response.success) {
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de l\'activation de l\'utilisateur');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'utilisateur:', error);
      toast.error('Erreur lors de l\'activation de l\'utilisateur');
      return false;
    }
  };

  const handleDeactivateUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await usersApiService.deactivateUser(userId);
      if (response.success) {
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de la désactivation de l\'utilisateur');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      toast.error('Erreur lors de la désactivation de l\'utilisateur');
      return false;
    }
  };

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await usersApiService.deleteUser(userId);
      if (response.success) {
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de la suppression de l\'utilisateur');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      return false;
    }
  };

  const handleUpdateUserRoles = async (userId: string, role: UserRole, roles?: UserRole[]): Promise<boolean> => {
    try {
      // Pour l'instant, on utilise l'endpoint qui met à jour le rôle principal
      // Le backend ne semble pas supporter les rôles multiples pour le moment
      const response = await usersApiService.updateUser(userId, { role });
      if (response.success) {
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de la mise à jour des rôles');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des rôles:', error);
      toast.error('Erreur lors de la mise à jour des rôles');
      return false;
    }
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    hasRole: handleHasRole,
    refreshUser,
    getUsers: handleGetUsers,
    activateUser: handleActivateUser,
    deactivateUser: handleDeactivateUser,
    deleteUser: handleDeleteUser,
    updateUserRoles: handleUpdateUserRoles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
}
