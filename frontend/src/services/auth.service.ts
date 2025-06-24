// Service d'authentification pour gérer les utilisateurs et les rôles

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles?: UserRole[];  // Pour supporter plusieurs rôles à l'avenir
  createdAt: string;
  isActive: boolean;   // Indique si le compte est activé par un admin
  activatedBy?: string; // ID de l'admin qui a activé le compte
  activatedAt?: string; // Date d'activation
  signature?: string;   // URL or base64 of the user's electronic signature
}

export type UserRole = 
  | 'admin' 
  | 'commercial' 
  | 'magasinier' 
  | 'directeur_general' 
  | 'directeur_commercial' 
  | 'directeur_financier' 
  | 'logistique' 
  | 'responsable_achat'
  | 'service_facturation';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles?: UserRole[];
  isActive?: boolean;
}

// Stockage local des utilisateurs (simulé)
const AUTH_KEY = 'systemair_auth';
const USERS_KEY = 'systemair_users';
const ADMIN_PASSWORD_KEY = 'systemair_admin_password';
const ADMIN_INITIALIZED = 'systemair_admin_initialized';

// Créer un utilisateur administrateur par défaut si aucun n'existe
const createDefaultAdmin = () => {
  console.log('Création du compte admin par défaut');
  // Créer un utilisateur administrateur par défaut
  const adminUser: User = {
    id: 'admin-' + Date.now().toString(),
    email: 'admin@systemair.ma',
    firstName: 'Admin',
    lastName: 'Système',
    role: 'admin',
    roles: ['admin'],
    createdAt: new Date().toISOString(),
    isActive: true // L'administrateur est automatiquement activé
  };
  
  // Stocker le mot de passe admin
  localStorage.setItem(ADMIN_PASSWORD_KEY, 'admin123');
  
  const users = [adminUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(ADMIN_INITIALIZED, 'true');
  
  console.log('Compte administrateur initial créé:', adminUser);
  return users;
};

// Initialiser le stockage local des utilisateurs et créer un administrateur par défaut
const initializeUsers = (): User[] => {
  // Vérifier si le stockage existe déjà
  const existingUsers = localStorage.getItem(USERS_KEY);
  
  if (!existingUsers) {
    // Aucun utilisateur trouvé, créer l'administrateur par défaut
    return createDefaultAdmin();
  }
  
  // Des utilisateurs existent déjà
  const users = JSON.parse(existingUsers);
  
  // Vérifier si l'utilisateur admin existe
  const adminExists = users.some((user: User) => 
    user.email.toLowerCase() === 'admin@systemair.ma' && user.role === 'admin'
  );
  
  if (!adminExists) {
    // Aucun admin trouvé, mais des utilisateurs existent
    // Créer l'administrateur et l'ajouter à la liste existante
    console.log('Aucun admin trouvé, création du compte admin par défaut');
    const admin: User = {
      id: 'admin-' + Date.now().toString(),
      email: 'admin@systemair.ma',
      firstName: 'Admin',
      lastName: 'Système',
      role: 'admin',
      roles: ['admin'],
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Stocker le mot de passe admin
    localStorage.setItem(ADMIN_PASSWORD_KEY, 'admin123');
    
    users.push(admin);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(ADMIN_INITIALIZED, 'true');
    console.log('Compte administrateur initial ajouté:', admin);
  }
  
  return users;
};

// Récupérer tous les utilisateurs
export const getUsers = (): User[] => {
  return initializeUsers();
};

// Récupérer l'utilisateur actuellement connecté
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(AUTH_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Connexion d'un utilisateur
export const login = (credentials: AuthCredentials): User | null => {
  const users = initializeUsers();
  const { email, password } = credentials;
  
  console.log(`Tentative de connexion pour: ${email}`);
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('Utilisateur non trouvé:', email);
    return null;
  }
  
  // Vérifier si le compte est activé
  if (!user.isActive) {
    console.log('Compte non activé');
    return null; // Refuser la connexion si le compte n'est pas activé
  }
  
  // Vérifier le mot de passe pour admin
  if (email.toLowerCase() === 'admin@systemair.ma') {
    const adminPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (password !== adminPassword) {
      console.log('Mot de passe admin incorrect');
      return null; // Mot de passe admin incorrect
    }
  } else {
    // Pour les autres utilisateurs, dans une implémentation réelle,
    // on vérifierait le mot de passe haché ici
    // Pour cette démo, on accepte tous les mots de passe pour les non-admin
    // TODO: implémenter une vérification réelle des mots de passe
  }
  
  console.log('Connexion réussie pour:', user.email);
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

// Inscription d'un nouvel utilisateur
export const register = (data: RegisterData): User | null => {
  initializeUsers();
  const { email, password, firstName, lastName, role = 'commercial', roles = [], isActive = false } = data;
  
  // Vérifier si l'email existe déjà
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return null; // Email déjà utilisé
  }
  
  // Créer un nouvel utilisateur
  const newUser: User = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    role,
    roles: roles.length > 0 ? roles : [role], // Stocker tous les rôles pour une future implémentation multi-rôles
    createdAt: new Date().toISOString(),
    isActive: isActive // L'utilisateur peut être activé directement par l'admin
  };
  
  // Ajouter l'utilisateur à la liste
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Ne pas connecter automatiquement l'utilisateur
  // L'administrateur doit d'abord activer le compte
  
  return newUser;
};

// Déconnexion
export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

// Activer un compte utilisateur
export const activateUser = (userId: string, adminId: string): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    isActive: true,
    activatedBy: adminId,
    activatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return users[userIndex];
};

// Désactiver un compte utilisateur
export const deactivateUser = (userId: string): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    isActive: false
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Si l'utilisateur désactivé est actuellement connecté, le déconnecter
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logout();
  }
  
  return users[userIndex];
};

// Supprimer un utilisateur
export const deleteUser = (userId: string): boolean => {
  let users = getUsers();
  
  // Vérifier si l'utilisateur existe
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;
  
  // Supprimer l'utilisateur du tableau
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Si l'utilisateur supprimé est actuellement connecté, le déconnecter
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logout();
  }
  
  return true;
};

// Mettre à jour les rôles d'un utilisateur et sa signature
export const updateUserProfile = (userId: string, updates: {
  role?: UserRole, 
  roles?: UserRole[],
  signature?: string
}): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...(updates.role && { role: updates.role }),
    ...(updates.roles && { roles: updates.roles }),
    ...(updates.signature && { signature: updates.signature }),
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Mettre à jour l'utilisateur actuel s'il s'agit du même utilisateur
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users[userIndex]));
  }
  
  return users[userIndex];
};

// Mettre à jour les rôles d'un utilisateur
export const updateUserRoles = (userId: string, role: UserRole, roles?: UserRole[]): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    role,
    roles: roles && roles.length > 0 ? roles : [role]
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Mettre à jour l'utilisateur actuel s'il s'agit du même utilisateur
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users[userIndex]));
  }
  
  return users[userIndex];
};

// Vérifier si l'utilisateur a un rôle spécifique
export const hasRole = (role: UserRole | UserRole[]): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // Vérifier dans le tableau des rôles s'il existe
  if (currentUser.roles && currentUser.roles.length > 0) {
    if (Array.isArray(role)) {
      return role.some(r => currentUser.roles?.includes(r));
    }
    return currentUser.roles.includes(role);
  }
  
  // Sinon vérifier le rôle principal
  if (Array.isArray(role)) {
    return role.includes(currentUser.role);
  }
  
  return currentUser.role === role;
};

// Traduire le rôle en français pour l'affichage
export const translateRole = (role: UserRole): string => {
  const translations: Record<UserRole, string> = {
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
