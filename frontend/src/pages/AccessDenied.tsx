
import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-systemair-grey">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex justify-center">
            <ShieldAlert className="h-24 w-24 text-red-500" />
          </div>
          <img 
            src="/lovable-uploads/9f771d38-8150-4e0e-a2e1-9ded7a2ced8d.png" 
            alt="Systemair Logo" 
            className="mx-auto h-16 w-16 mt-6" 
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Accès refusé</h2>
          <div className="mt-4">
            <div className="p-6 bg-red-50 rounded-xl border border-red-100 shadow-sm">
              <p className="text-base text-gray-700">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Veuillez contacter votre administrateur ou retourner à la page d'accueil.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            to="/"
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-systemair-blue hover:bg-systemair-darkBlue focus:outline-none transition-colors duration-300 items-center"
          >
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
