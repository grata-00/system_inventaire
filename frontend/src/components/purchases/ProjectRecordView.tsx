import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseRequest } from "@/services/purchaseRequest.service";
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { ProjectRecord } from '@/services/projects.api.service';
import jsPDF from 'jspdf';

interface ProjectRecordViewProps {
  purchaseRequest: PurchaseRequest;
  downloadable?: boolean;
}

const ProjectRecordView = ({ purchaseRequest, downloadable = false }: ProjectRecordViewProps) => {
  const { projects, loading } = useProjects();
  
  // Find the project corresponding to the purchase request
  const projectRecord = projects.find(p => p.projectName === purchaseRequest.projectName);
  
  const generateProjectPDF = (project: ProjectRecord) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("SYSTEMAIR - FICHE PROJET", doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Add project basic info
    doc.setFontSize(14);
    doc.text(`Projet: ${project.projectName}`, 20, 40);
    doc.text(`Client: ${project.clientName}`, 20, 50);
    doc.text(`N° Commande: ${project.orderNumber || 'N/A'}`, 20, 60);
    doc.text(`Commercial: ${project.commercialName}`, 20, 70);
    
    // Add financial details
    doc.setFontSize(12);
    doc.text("DÉTAILS FINANCIERS", 20, 90);
    doc.text(`Montant commande: ${project.orderAmount || 0} €`, 20, 100);
    doc.text(`Prix: ${project.price || 0} €`, 20, 110);
    doc.text(`Transport: ${project.transportAmount || 0} €`, 20, 120);
    doc.text(`Mode de paiement: ${project.paymentMethod || 'N/A'}`, 20, 130);
    
    // Add delivery info
    doc.text("LIVRAISON", 20, 150);
    doc.text(`Date de livraison: ${project.effectiveDeliveryDate || 'Non définie'}`, 20, 160);
    doc.text(`Quantité: ${project.quantity || 'N/A'}`, 20, 170);
    
    if (project.remarks) {
      doc.text("REMARQUES", 20, 190);
      doc.text(project.remarks, 20, 200);
    }
    
    return doc;
  };
  
  const downloadProjectRecord = () => {
    if (!projectRecord) {
      toast.error("Aucune fiche projet trouvée pour ce projet");
      return;
    }

    try {
      // Generate the PDF
      const doc = generateProjectPDF(projectRecord);
      
      // Download the PDF
      doc.save(`Projet_${projectRecord.projectName.replace(/\s+/g, '-')}.pdf`);
      
      toast.success('Téléchargement de la fiche projet initié');
    } catch (error) {
      console.error("Erreur lors du téléchargement de la fiche projet:", error);
      toast.error('Erreur lors du téléchargement de la fiche projet');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fiche Projet</CardTitle>
          <CardDescription>
            Chargement des informations sur le projet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-gray-500">
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If project is not found
  if (!projectRecord) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fiche Projet</CardTitle>
          <CardDescription>
            Informations sur le projet associé à cette demande d'achat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-gray-500">
            <p>Aucune fiche projet trouvée pour {purchaseRequest.projectName}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fiche Projet</CardTitle>
          <CardDescription>
            Informations sur le projet associé à cette demande d'achat
          </CardDescription>
        </div>
        {downloadable && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={downloadProjectRecord}
          >
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Informations Générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom du projet</p>
                <p className="font-medium">{projectRecord.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{projectRecord.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">N° de commande</p>
                <p>{projectRecord.orderNumber || "Non spécifié"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commercial</p>
                <p>{projectRecord.commercialName}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Détails Financiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Montant commande</p>
                <p className="font-medium">{projectRecord.orderAmount || 0} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prix</p>
                <p>{projectRecord.price || 0} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transport</p>
                <p>{projectRecord.transportAmount || 0} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p>
                  {projectRecord.paymentMethod === 'virement' ? 'Virement' : 
                   projectRecord.paymentMethod === 'cheque' ? 'Chèque' :
                   projectRecord.paymentMethod === 'en_compte' ? 'En compte' : 
                   projectRecord.paymentMethod === 'espece' ? 'Espèce' : 'Non défini'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Détails de livraison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date de livraison prévue</p>
                <p>{projectRecord.effectiveDeliveryDate ? new Date(projectRecord.effectiveDeliveryDate).toLocaleDateString('fr-FR') : "Non spécifiée"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantité</p>
                <p>{projectRecord.quantity || "Non spécifiée"}</p>
              </div>
            </div>
          </div>

          {projectRecord.remarks && (
            <div>
              <h3 className="text-lg font-medium mb-2">Remarques</h3>
              <p className="bg-slate-50 p-3 rounded">{projectRecord.remarks}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectRecordView;
