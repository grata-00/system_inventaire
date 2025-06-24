import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  icon: React.ReactNode;
  label: string;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  onFileSelect?: (file: File, preview: string) => void;
  id: string;
}

const ImageUploader = ({
  icon,
  label,
  imagePreview,
  setImagePreview,
  onFileSelect,
  id,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
        if (onFileSelect) {
          onFileSelect(file, preview);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
        if (onFileSelect) {
          onFileSelect(file, preview);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="form-group-transition">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragging 
            ? 'border-systemair-blue bg-systemair-lightBlue/30' 
            : 'border-gray-300 hover:border-systemair-blue hover:bg-systemair-lightBlue/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
        
        {imagePreview ? (
          <div className="mb-4">
            <img 
              src={imagePreview} 
              alt={label} 
              className="max-h-32 mx-auto rounded-md"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="mt-3 text-sm text-systemair-blue hover:underline focus:outline-none"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <div className="text-center">
            {icon}
            <p className="text-sm text-gray-500 mb-2">
              Glissez-déposez une image ou
            </p>
            <label
              htmlFor={id}
              className="inline-flex items-center px-4 py-2 bg-systemair-blue text-white text-sm rounded-lg cursor-pointer hover:bg-systemair-blue/90 transition-colors"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Sélectionner une image
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
