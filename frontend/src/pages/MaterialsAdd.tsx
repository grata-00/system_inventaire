
import React from "react";
import Navbar from "../components/Navbar";
import ProductForm from "../components/materials/ProductForm";
import Footer from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const MaterialsAdd = () => {
  const { user, hasRole } = useAuth();
  
  // Redirect directeur_commercial to inventory page
  if (user && hasRole('directeur_commercial') && !hasRole('admin')) {
    return <Navigate to="/inventory" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 flex-grow animate-fade-in">
        <div className="max-w-3xl mx-auto bg-white rounded-xl card-shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-systemair-dark border-b pb-4">
            Ajouter un Nouveau Matériel
          </h1>
          
          <ProductForm />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MaterialsAdd;
