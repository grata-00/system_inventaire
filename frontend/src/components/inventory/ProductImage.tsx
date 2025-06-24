
import React from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  imageUrl?: string;
  productName: string;
  className?: string;
}

export const ProductImage = ({ imageUrl, productName, className = "w-12 h-12" }: ProductImageProps) => {
  if (!imageUrl) {
    return (
      <div className={`${className} bg-gray-100 rounded-md flex items-center justify-center`}>
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // Construire l'URL complète pour l'image
  const imageFullUrl = imageUrl.startsWith('/') 
    ? `http://localhost:3001${imageUrl}` 
    : imageUrl;

  console.log('ProductImage: Loading image URL:', imageFullUrl);

  return (
    <div className={`${className} relative`}>
      <img
        src={imageFullUrl}
        alt={productName}
        className={`${className} object-cover rounded-md`}
        onError={(e) => {
          console.error('ProductImage: Failed to load image:', imageFullUrl);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
        onLoad={(e) => {
          console.log('ProductImage: Successfully loaded image:', imageFullUrl);
          const target = e.target as HTMLImageElement;
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'none';
        }}
      />
      <div className={`${className} bg-gray-100 rounded-md flex items-center justify-center`} style={{ display: 'none' }}>
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
};

export default ProductImage;