
// import React, { ReactNode, isValidElement, cloneElement } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { UserRole } from '../../services/auth.service';

// interface ProtectedRouteProps {
//   children: ReactNode;
//   allowedRoles?: UserRole[];
//   disableActions?: {
//     edit?: boolean;
//     delete?: boolean;
//     add?: boolean; // Propriété pour désactiver l'ajout
//   };
// }

// const ProtectedRoute = ({ children, allowedRoles, disableActions }: ProtectedRouteProps) => {
//   const { user, loading, hasRole } = useAuth();
//   const location = useLocation();

//   // Afficher un indicateur de chargement pendant la vérification de l'authentification
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-systemair-grey">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-systemair-blue"></div>
//           <p className="mt-4 text-systemair-blue font-medium">Chargement en cours...</p>
//         </div>
//       </div>
//     );
//   }

//   // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
//   if (!user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Vérifier si le compte est activé (tous les administrateurs sont activés par défaut)
//   if (!user.isActive && !hasRole('admin')) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-systemair-grey">
//         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//           <h2 className="text-2xl font-bold text-red-500 mb-4">Compte non activé</h2>
//           <p className="text-gray-700 mb-6">
//             Votre compte n'a pas encore été activé par un administrateur. 
//             Veuillez patienter ou contacter un administrateur pour activer votre compte.
//           </p>
//           <button
//             onClick={() => { window.location.href = '/login'; }}
//             className="w-full bg-systemair-blue text-white py-2 px-4 rounded hover:bg-blue-700"
//           >
//             Retour à la page de connexion
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Vérifier les rôles autorisés
//   if (allowedRoles && allowedRoles.length > 0) {
//     const hasRequiredRole = hasRole(allowedRoles);
//     if (!hasRequiredRole) {
//       return <Navigate to="/access-denied" replace />;
//     }
//   }

//   // Définir les restrictions d'actions en fonction du rôle
//   let effectiveDisableActions = { ...disableActions };
  
//   // Configurer les restrictions par défaut selon les rôles
//   if (user) {
//     // Magasinier peut voir le stock, ajouter, mais pas modifier/supprimer
//     if (hasRole('magasinier') && !hasRole(['admin', 'directeur_general'])) {
//       if (location.pathname === '/inventory') {
//         effectiveDisableActions = { edit: true, delete: true };
//       }
//     }
    
//     // Commercial, directeur commercial, directeur financier et responsable achat peuvent consulter le stock mais sans modification
//     if (hasRole(['commercial', 'directeur_commercial', 'directeur_financier', 'responsable_achat']) && !hasRole('admin')) {
//       if (location.pathname === '/inventory') {
//         effectiveDisableActions = { edit: true, delete: true };
//       }

//       // Responsable achat ne peut pas ajouter de matériels
//       if (hasRole('responsable_achat') && location.pathname === '/materials-add') {
//         // Rediriger vers la page de consultation d'inventaire
//         return <Navigate to="/inventory" replace />;
//       }
//     }
    
//     // Directeur commercial peut uniquement consulter les fiches projet, pas de modification ni ajout
//     if (hasRole('directeur_commercial') && !hasRole('admin')) {
//       // Restrictions pour les fiches projet et livraisons - consultation uniquement
//       if (location.pathname === '/project-records' || location.pathname === '/delivery') {
//         effectiveDisableActions = { edit: true, delete: true, add: true };
//       }
      
//       // Restrictions pour les demandes d'achat - consultation uniquement
//       if (location.pathname === '/purchase-requests') {
//         effectiveDisableActions = { add: true, edit: true, delete: true };
//       }
      
//       // Rediriger si le directeur commercial tente d'accéder à la page d'ajout de matériels
//       if (location.pathname === '/materials-add') {
//         return <Navigate to="/inventory" replace />;
//       }
      
//       // Rediriger si le directeur commercial tente d'accéder à la page d'ajout de fiches projet
//       if (location.pathname === '/project-add') {
//         return <Navigate to="/project-records" replace />;
//       }
//     }
//   }

//   // Passer les restrictions au composant enfant via la propriété disableActions
//   // Seulement pour les éléments React valides, pas pour les chaînes de caractères ou autres types
//   const childrenWithRestrictions = React.Children.map(children, (child) => {
//     if (isValidElement(child)) {
//       // Use a proper type assertion that works with any React element
//       return cloneElement(child, {
//         disableActions: effectiveDisableActions
//       } as any); // Use 'any' to bypass the TypeScript error
//     }
//     return child;
//   });

//   // L'utilisateur est connecté et a le rôle requis
//   return <>{childrenWithRestrictions}</>;
// };

// export default ProtectedRoute;
import React, { ReactNode, isValidElement, cloneElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../services/auth.service';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  disableActions?: {
    edit?: boolean;
    delete?: boolean;
    add?: boolean; // Propriété pour désactiver l'ajout
  };
}

const ProtectedRoute = ({ children, allowedRoles, disableActions }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-systemair-grey">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-systemair-blue"></div>
          <p className="mt-4 text-systemair-blue font-medium">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier si le compte est activé (tous les administrateurs sont activés par défaut)
  if (!user.isActive && !hasRole('admin')) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-systemair-grey">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Compte non activé</h2>
          <p className="text-gray-700 mb-6">
            Votre compte n'a pas encore été activé par un administrateur. 
            Veuillez patienter ou contacter un administrateur pour activer votre compte.
          </p>
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="w-full bg-systemair-blue text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  // Vérifier les rôles autorisés
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = hasRole(allowedRoles);
    if (!hasRequiredRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Définir les restrictions d'actions en fonction du rôle
  let effectiveDisableActions = { ...disableActions };
  
  // Configurer les restrictions par défaut selon les rôles
  if (user) {
    // Magasinier peut voir le stock, ajouter, mais pas modifier/supprimer
    if (hasRole('magasinier') && !hasRole(['admin', 'directeur_general'])) {
      if (location.pathname === '/inventory') {
        effectiveDisableActions = { edit: true, delete: true };
      }
    }
    
    // Commercial, directeur commercial, directeur financier et responsable achat peuvent consulter le stock mais sans modification
    if (hasRole(['commercial', 'directeur_commercial', 'directeur_financier', 'responsable_achat']) && !hasRole('admin')) {
      if (location.pathname === '/inventory') {
        effectiveDisableActions = { edit: true, delete: true };
      }

      // Responsable achat ne peut pas ajouter de matériels
      if (hasRole('responsable_achat') && location.pathname === '/materials-add') {
        // Rediriger vers la page de consultation d'inventaire
        return <Navigate to="/inventory" replace />;
      }
    }
    
    // Updated: Directeur commercial, directeur financier et responsable achat peuvent uniquement consulter les fiches projet, pas de modification ni ajout
    if (hasRole(['directeur_commercial', 'directeur_financier', 'responsable_achat']) && !hasRole('admin')) {
      // Restrictions pour les fiches projet et livraisons - consultation uniquement
      if (location.pathname === '/project-records' || location.pathname === '/delivery') {
        effectiveDisableActions = { edit: true, delete: true, add: true };
      }
      
      // Restrictions pour les demandes d'achat - consultation uniquement
      if (location.pathname === '/purchase-requests') {
        effectiveDisableActions = { add: true, edit: true, delete: true };
      }
      
      // Rediriger si le directeur commercial, financier ou responsable achat tente d'accéder à la page d'ajout de matériels
      if (location.pathname === '/materials-add') {
        return <Navigate to="/inventory" replace />;
      }
      
      // Rediriger si le directeur commercial, financier ou responsable achat tente d'accéder à la page d'ajout de fiches projet
      if (location.pathname === '/project-add') {
        return <Navigate to="/project-records" replace />;
      }
    }

    // Directeur général peut uniquement consulter les fiches projet, pas de modification ni ajout
    if (hasRole('directeur_general') && !hasRole('admin')) {
      if (location.pathname === '/project-records') {
        effectiveDisableActions = { edit: true, delete: true, add: true };
      }
    }

    // Restrictions pour la page de livraisons selon les rôles
    if (location.pathname === '/delivery') {
      // Seuls admin et service_facturation peuvent créer des livraisons
      if (!hasRole(['admin', 'service_facturation'])) {
        effectiveDisableActions = { ...effectiveDisableActions, add: true };
      }
    }
  }

  // Passer les restrictions au composant enfant via la propriété disableActions
  // Seulement pour les éléments React valides, pas pour les chaînes de caractères ou autres types
  const childrenWithRestrictions = React.Children.map(children, (child) => {
    if (isValidElement(child)) {
      // Use a proper type assertion that works with any React element
      return cloneElement(child, {
        disableActions: effectiveDisableActions
      } as any); // Use 'any' to bypass the TypeScript error
    }
    return child;
  });

  // L'utilisateur est connecté et a le rôle requis
  return <>{childrenWithRestrictions}</>;
};

export default ProtectedRoute;