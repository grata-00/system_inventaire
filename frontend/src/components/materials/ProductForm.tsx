
import React, { useState, useEffect } from "react";
import { Check, Image, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { materialsApiService } from "../../services/materials.api.service";
import { apiService } from "../../services/api.service";
import ImageUploader from "./ImageUploader";

const ProductForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [restockDate, setRestockDate] = useState("");
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Vérifier la connexion au backend
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      try {
        const connected = await apiService.testConnection();
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    
    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !quantity || !restockDate || !user) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    if (!isConnected) {
      toast.error("Impossible de se connecter au serveur. Vérifiez que le backend est démarré.");
      return;
    }

    if (parseInt(quantity) <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const materialData = {
        name: productName.trim(),
        quantity: parseInt(quantity),
        restockDate
      };

      console.log('Envoi des données matériel:', materialData);
      console.log('Fichier image:', productImageFile);
      
      const response = await materialsApiService.createMaterial(materialData, productImageFile || undefined);
      
      if (response.success) {
        toast.success("Matériel ajouté avec succès et stock créé automatiquement!");
        
        // Rediriger vers la page d'inventaire
        setTimeout(() => {
          navigate('/inventory');
        }, 1500);
        
        // Reset form
        setProductName("");
        setQuantity("");
        setRestockDate("");
        setProductImagePreview(null);
        setProductImageFile(null);
      } else {
        console.error('Erreur API:', response.error);
        toast.error(response.error || "Erreur lors de l'ajout du matériel");
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du matériel:', error);
      toast.error("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (file: File, preview: string) => {
    setProductImageFile(file);
    setProductImagePreview(preview);
  };

  const ConnectionIndicator = () => (
    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gray-50">
      {connectionStatus === 'checking' ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-systemair-blue"></div>
          <span className="text-sm text-gray-600">Vérification de la connexion...</span>
        </>
      ) : connectionStatus === 'connected' ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">Connecté au serveur</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Connexion au serveur impossible</span>
        </>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ConnectionIndicator />
      
      <div className="form-group-transition">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du Produit *
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-systemair-blue focus:ring-2 focus:ring-systemair-blue/20 outline-none transition-all"
          placeholder="Entrez le nom du produit"
          required
          disabled={isSubmitting || !isConnected}
        />
      </div>

      <div className="form-group-transition">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantité *
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-systemair-blue focus:ring-2 focus:ring-systemair-blue/20 outline-none transition-all"
          placeholder="Quantité"
          required
          disabled={isSubmitting || !isConnected}
        />
      </div>

      <div className="form-group-transition">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de réapprovisionnement *
        </label>
        <input
          type="date"
          value={restockDate}
          onChange={(e) => setRestockDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-systemair-blue focus:ring-2 focus:ring-systemair-blue/20 outline-none transition-all"
          required
          disabled={isSubmitting || !isConnected}
        />
      </div>
      
      <ImageUploader
        icon={<Image className="h-10 w-10 mx-auto text-gray-400 mb-2" />}
        label="Image du Produit"
        imagePreview={productImagePreview}
        setImagePreview={(preview) => setProductImagePreview(preview)}
        onFileSelect={handleImageUpload}
        id="product-image"
      />
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="w-full py-3 px-6 flex justify-center items-center bg-systemair-blue text-white rounded-lg hover:bg-systemair-darkBlue transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Ajout en cours...
            </>
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Ajouter le Matériel
            </>
          )}
        </button>
      </div>

      {!isConnected && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Impossible de se connecter au serveur. Veuillez vérifier que le backend est démarré et accessible.
          </p>
        </div>
      )}
    </form>
  );
};

export default ProductForm;
