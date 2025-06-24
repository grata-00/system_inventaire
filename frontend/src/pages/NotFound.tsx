
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-systemair-grey">
      <div className="text-center px-4 animate-fade-in">
        <h1 className="text-8xl font-bold mb-4 text-systemair-blue">404</h1>
        <p className="text-2xl text-gray-700 mb-8">Page non trouvée</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-5 py-3 bg-systemair-blue text-white rounded-lg hover:bg-systemair-darkBlue transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
