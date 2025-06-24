import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paperclip, FileText, Download } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PurchaseRequest } from "@/services/purchaseRequest.service";
import { useAuth } from "@/contexts/AuthContext";

const purchaseOrderFormSchema = z.object({
  purchaseOrderNumber: z.string().min(1, {
    message: "Le numéro de bon de commande est requis",
  }),
  purchaseOrderFile: z.string().optional(),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;

interface PurchaseOrderFormProps {
  request: PurchaseRequest;
  onSubmit: (values: PurchaseOrderFormValues) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export default function PurchaseOrderForm({ request, onSubmit, onCancel, readOnly = false }: PurchaseOrderFormProps) {
  // Protection si request n'est pas défini
  if (!request) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded">
        Impossible d’afficher ce bon de commande : aucune demande d’achat liée.
      </div>
    );
  }

  const { user } = useAuth();
  const isLogisticsService = user?.role === 'logistique';
  const [viewOnly, setViewOnly] = useState(readOnly || (isLogisticsService && request.purchasing?.purchaseOrderNumber));
  
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      purchaseOrderNumber: request.purchasing?.purchaseOrderNumber || "",
      purchaseOrderFile: request.purchasing?.purchaseOrderFile || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("purchaseOrderFile", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Générer un PDF pour le bon de commande
  const generatePurchaseOrderPDF = () => {
    // Créer le contenu HTML du bon de commande
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Commande - ${request.purchasing?.purchaseOrderNumber || "Non défini"}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1a5276; text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .logo { max-width: 150px; margin-bottom: 20px; }
          .footer { margin-top: 40px; font-size: 0.8em; color: #777; text-align: center; }
          .signature-section { margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 20px; }
          .signature-box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SYSTEMAIR - BON DE COMMANDE</h1>
          <p><strong>N° ${request.purchasing?.purchaseOrderNumber || "Non défini"}</strong></p>
        </div>
        
        <div class="section">
          <h2>Détails de la Commande</h2>
          <div class="info-grid">
            <p><strong>Produit:</strong> ${request.productName}</p>
            <p><strong>Projet:</strong> ${request.projectName}</p>
            <p><strong>Quantité:</strong> ${request.quantity}</p>
            <p><strong>Prix estimé:</strong> ${request.estimatedPrice} €</p>
            <p><strong>Date de commande:</strong> ${new Date(request.purchasing?.purchaseDate || request.updatedAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Demandé par:</strong> ${request.createdBy?.name || 'Non spécifié'}</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Informations de Livraison</h2>
          <p><strong>Date de livraison prévue:</strong> ${new Date(request.deliveryDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Adresse de livraison:</strong> Systemair SA, Route de Brest, 35000 Rennes</p>
          <p><strong>Instructions spéciales:</strong> ${request.purchasing?.comments || 'Aucune instruction spéciale'}</p>
        </div>
        
        <div class="signature-section">
          <h2>Confirmation de réception</h2>
          <p>En signant ce document, vous confirmez avoir reçu les articles mentionnés ci-dessus en bon état.</p>
          
          <div class="signature-box">
            <p>Nom et signature: _____________________________________</p>
            <p>Date: _____________________________________</p>
            <p>Commentaires: _____________________________________</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} par le système Systemair.</p>
          <p>Pour toute question concernant cette commande, veuillez contacter le service achats.</p>
        </div>
      </body>
      </html>
    `;
    
    // Créer un Blob avec le contenu HTML
    const blob = new Blob([htmlContent], {type: 'text/html'});
    
    // Créer une URL pour le Blob
    return URL.createObjectURL(blob);
  };

  // Télécharger le bon de commande
  const downloadPurchaseOrder = () => {
    try {
      // Générer et obtenir l'URL du document bon de commande
      const documentUrl = generatePurchaseOrderPDF();
      
      // Créer un élément d'ancre et déclencher le téléchargement
      const a = document.createElement('a');
      a.href = documentUrl;
      a.download = `BC_${request.purchasing?.purchaseOrderNumber || request.requestNumber}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer après le déclenchement du téléchargement
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(documentUrl); // Libérer la mémoire
      }, 100);
    } catch (error) {
      console.error("Erreur lors du téléchargement du bon de commande:", error);
    }
  };

  return (
    <ScrollArea className="max-h-[600px] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium mb-2">Demande d'achat {request.requestNumber}</h3>
            <p className="text-sm text-gray-500 mb-3">
              {viewOnly 
                ? `Bon de commande pour la demande "${request.productName}" du projet ${request.projectName}`
                : `Ajout d'un bon de commande pour la demande "${request.productName}" du projet ${request.projectName}`
              }
            </p>
          </div>

          {viewOnly ? (
            <>
              <div className="bg-white p-4 rounded-lg border mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Numéro de bon de commande</p>
                    <p className="font-medium">{request.purchasing?.purchaseOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de commande</p>
                    <p className="font-medium">{new Date(request.purchasing?.purchaseDate || request.updatedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {request.purchasing?.purchaseOrderFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Fichier attaché</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = request.purchasing.purchaseOrderFile as string;
                        link.download = `BC_${request.purchasing.purchaseOrderNumber || request.requestNumber}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Télécharger le PDF original
                    </Button>
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant="default"
                    className="flex items-center gap-2 bg-systemair-blue"
                    onClick={downloadPurchaseOrder}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le bon de commande
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Fermer
                </Button>
              </div>
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="purchaseOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de bon de commande</FormLabel>
                    <FormControl>
                      <Input placeholder="BC-2025-0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Bon de commande (PDF)</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    id="purchase-order-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("purchase-order-file")?.click()}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Joindre un fichier PDF
                  </Button>
                  {form.watch("purchaseOrderFile") && (
                    <span className="text-sm text-green-600">
                      Fichier sélectionné
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ce fichier sera accessible au service logistique pour le suivi de la commande.
                </p>
              </FormItem>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-systemair-blue">
                  Enregistrer le bon de commande
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </ScrollArea>
  );
}