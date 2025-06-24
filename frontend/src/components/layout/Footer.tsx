
import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 px-6 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <img src="/lovable-uploads/9f771d38-8150-4e0e-a2e1-9ded7a2ced8d.png" alt="Systemair Logo" className="h-8" />
        </div>
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Systemair. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
