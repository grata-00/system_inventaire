
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PurchaseRequest, generateApprovedRequestPDF } from '@/services/purchaseRequest.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectRecordView from './ProjectRecordView';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects } from '@/services/projectRecord.service';

interface ApprovedRequestViewProps {
  request: PurchaseRequest;
}

const ApprovedRequestView = ({ request }: ApprovedRequestViewProps) => {
  const { user, hasRole } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get director approvals
  const dgApproval = request.approvals.directeurGeneral;
  const dfApproval = request.approvals.directeurFinancier;
  const dcApproval = request.approvals.directeurCommercial;

  // Trouver le projet associé pour obtenir des informations supplémentaires sur le commercial
  const projects = getProjects();
  const projectRecord = projects.find(p => p.projectName === request.projectName);
  const commercialName = projectRecord?.commercialName || request.createdBy.name;

  const downloadApprovedRequest = () => {
    try {
      setIsGenerating(true);
      console.log("Generating PDF for download...");
      console.log("Current user role:", user?.role);
      
      // Generate and get URL for the approved request document
      const pdfDataUri = generateApprovedRequestPDF(request);
      console.log("PDF generated successfully");
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = pdfDataUri;
      a.download = `DA_${request.requestNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up after download is initiated
      setTimeout(() => {
        document.body.removeChild(a);
        setIsGenerating(false);
      }, 100);
      
      toast.success('Téléchargement du document initié');
    } catch (error) {
      setIsGenerating(false);
      console.error("Erreur lors du téléchargement du document:", error);
      toast.error("Erreur lors du téléchargement du document: " + (error instanceof Error ? error.message : "erreur inconnue"));
    }
  };

  // Télécharger le bon de commande existant
  const downloadPurchaseOrder = () => {
    if (!request.purchasing?.purchaseOrderFile) {
      toast.error('Aucun bon de commande n\'est disponible pour cette demande');
      return;
    }

    console.log("Downloading purchase order...");
    console.log("Current user role:", user?.role);
    
    // Créer un lien pour télécharger le bon de commande
    const a = document.createElement('a');
    a.href = request.purchasing.purchaseOrderFile;
    a.download = `BC_${request.purchasing.purchaseOrderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer après le téléchargement
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    
    toast.success('Téléchargement du bon de commande initié');
  };

  // Check if request is approved by all directors
  const isFullyApproved = 
    dgApproval?.approved === true && 
    dfApproval?.approved === true && 
    dcApproval?.approved === true;

  // Display signatures section if request is fully approved or status is approved
  const showSignatures = isFullyApproved || request.status === 'approved';

  // Vérifier si toutes les signatures sont présentes
  const hasAllSignatures = 
    dgApproval?.signature && 
    dfApproval?.signature && 
    dcApproval?.signature;
  
  // Définir explicitement chaque rôle pour plus de clarté
  const isDirectorGeneral = user?.role === 'directeur_general';
  const isDirectorFinancier = user?.role === 'directeur_financier';
  const isDirectorCommercial = user?.role === 'directeur_commercial';
  const isDirector = isDirectorGeneral || isDirectorFinancier || isDirectorCommercial;
  
  const isCommercial = user?.role === 'commercial';
  const isResponsableAchat = user?.role === 'responsable_achat';
  const isAdmin = user?.role === 'admin';
  const isServiceFacturation = user?.role === 'service_facturation';
  const isLogistique = user?.role === 'logistique';
  
  // Permission de téléchargement explicite - s'assurer que tous les rôles mentionnés peuvent télécharger
  const canDownloadPdf = Boolean(
    user && (isDirector || isCommercial || isResponsableAchat || isAdmin || isServiceFacturation || isLogistique)
  );
  
  // Vérifier si l'utilisateur est du service facturation, logistique, commercial ou responsable achat
  const canViewAndDownload = Boolean(
    user && (isServiceFacturation || isLogistique || isCommercial || isResponsableAchat)
  );

  // Vérifier si un bon de commande est disponible
  const hasPurchaseOrder = Boolean(
    request.purchasing?.purchaseOrderFile && 
    request.purchasing?.purchaseOrderNumber
  );

  console.log("Current user role:", user?.role);
  console.log("Is director:", isDirector);
  console.log("Is commercial:", isCommercial);
  console.log("Is responsable achat:", isResponsableAchat);
  console.log("Is admin:", isAdmin);
  console.log("Can download PDF:", canDownloadPdf);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="request">
        <TabsList className="w-full">
          <TabsTrigger value="request" className="flex-1">Demande d'achat</TabsTrigger>
          <TabsTrigger value="project" className="flex-1">Fiche Projet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request" className="pt-4">
          {/* Information commerciale mise en évidence - ajout d'une alerte pour les directeurs */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-800">Demande créée par:</span> 
                <span className="font-semibold">{request.createdBy.name}</span>
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Commercial
                </span>
              </div>
              {/* Afficher le commercial associé au projet si différent de createdBy */}
              {projectRecord && projectRecord.commercialName !== request.createdBy.name && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-800">Commercial en charge du projet:</span> 
                  <span className="font-semibold">{projectRecord.commercialName}</span>
                </div>
              )}
              <div className="text-sm text-blue-700 mt-1">
                Date de création: {new Date(request.createdAt).toLocaleDateString('fr-FR')}
              </div>
              
              {/* Alerte spéciale pour les directeurs qui consultent la demande */}
              {isDirector && (
                <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    Note aux directeurs: Cette demande a été créée par le commercial {request.createdBy.name} 
                    {projectRecord && projectRecord.commercialName !== request.createdBy.name && 
                      ` pour un projet géré par ${projectRecord.commercialName}`}.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Request details section */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">Détails de la demande</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Numéro de demande</p>
                <p>{request.requestNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Produit</p>
                <p>{request.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Projet</p>
                <p>{request.projectName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quantité</p>
                <p>{request.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Prix estimé</p>
                <p>{request.estimatedPrice} €</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date de livraison souhaitée</p>
                <p>{new Date(request.deliveryDate).toLocaleDateString('fr-FR')}</p>
              </div>
              {/* Removed redundant commercial info since it's now in the highlighted section above */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Disponibilité en stock</p>
                <p className="text-red-500">Non disponible - Nécessite commande</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Impact budgétaire</p>
                <p>{Number(request.estimatedPrice) > 5000 ? 
                  "Impact important - Validation requise du Directeur Financier" : 
                  "Impact modéré - Dans les limites budgétaires"}</p>
              </div>
            </div>
          </div>

          {/* Approvals section */}
          <div className={`p-4 rounded-lg mb-6 ${showSignatures ? 'bg-green-50' : 'bg-slate-50'}`}>
            <h3 className="text-lg font-medium mb-4">Approbations des directeurs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DG Approval */}
              <div className={`p-3 rounded shadow-sm ${dgApproval ? (dgApproval.approved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-white'}`}>
                <h4 className="font-medium">Directeur Général</h4>
                {dgApproval ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dgApproval.approved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="text-sm font-medium">{dgApproval.approved ? 'Approuvé' : 'Refusé'}</p>
                    </div>
                    <p className="text-sm">{dgApproval.directorName}</p>
                    <p className="text-xs text-gray-500">{new Date(dgApproval.date).toLocaleDateString('fr-FR')}</p>
                    {dgApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500 mb-1">Signature :</p>
                        <img 
                          src={dgApproval.signature} 
                          alt="Signature DG" 
                          className="h-16 object-contain" 
                        />
                      </div>
                    )}
                    {!dgApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-red-500">Signature manquante</p>
                      </div>
                    )}
                    {dgApproval.comment && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500">Commentaire :</p>
                        <p className="text-sm italic">{dgApproval.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">En attente de validation</p>
                )}
              </div>
              
              {/* DF Approval */}
              <div className={`p-3 rounded shadow-sm ${dfApproval ? (dfApproval.approved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-white'}`}>
                <h4 className="font-medium">Directeur Financier</h4>
                {dfApproval ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dfApproval.approved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="text-sm font-medium">{dfApproval.approved ? 'Approuvé' : 'Refusé'}</p>
                    </div>
                    <p className="text-sm">{dfApproval.directorName}</p>
                    <p className="text-xs text-gray-500">{new Date(dfApproval.date).toLocaleDateString('fr-FR')}</p>
                    {dfApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500 mb-1">Signature :</p>
                        <img 
                          src={dfApproval.signature} 
                          alt="Signature DF" 
                          className="h-16 object-contain" 
                        />
                      </div>
                    )}
                    {!dfApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-red-500">Signature manquante</p>
                      </div>
                    )}
                    {dfApproval.comment && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500">Commentaire :</p>
                        <p className="text-sm italic">{dfApproval.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">En attente de validation</p>
                )}
              </div>
              
              {/* DC Approval */}
              <div className={`p-3 rounded shadow-sm ${dcApproval ? (dcApproval.approved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-white'}`}>
                <h4 className="font-medium">Directeur Commercial</h4>
                {dcApproval ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dcApproval.approved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="text-sm font-medium">{dcApproval.approved ? 'Approuvé' : 'Refusé'}</p>
                    </div>
                    <p className="text-sm">{dcApproval.directorName}</p>
                    <p className="text-xs text-gray-500">{new Date(dcApproval.date).toLocaleDateString('fr-FR')}</p>
                    {dcApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500 mb-1">Signature :</p>
                        <img 
                          src={dcApproval.signature} 
                          alt="Signature DC" 
                          className="h-16 object-contain" 
                        />
                      </div>
                    )}
                    {!dcApproval.signature && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-red-500">Signature manquante</p>
                      </div>
                    )}
                    {dcApproval.comment && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-500">Commentaire :</p>
                        <p className="text-sm italic">{dcApproval.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">En attente de validation</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              {/* Download button for purchase request - explicitly visible for all authorized roles */}
              {canDownloadPdf && (
                <Button 
                  onClick={downloadApprovedRequest}
                  className="flex-1 bg-systemair-blue"
                  disabled={isGenerating}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Génération en cours...' : 'Télécharger la demande avec détails complets'}
                </Button>
              )}
              
              {/* Download button for purchase order - visible for all relevant roles */}
              {hasPurchaseOrder && canDownloadPdf && (
                <Button 
                  onClick={downloadPurchaseOrder}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Télécharger le bon de commande
                </Button>
              )}
            </div>
          </div>

          {/* History section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Historique</h3>
            
            <div className="space-y-3">
              {request.history.map((event, index) => (
                <div 
                  key={index} 
                  className="bg-white p-3 rounded shadow-sm flex gap-4"
                >
                  <div className="text-sm text-gray-500 min-w-[120px]">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-gray-500">par {event.user}</p>
                    {event.comment && (
                      <p className="text-sm italic mt-1">{event.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="project" className="pt-4">
          <ProjectRecordView purchaseRequest={request} downloadable={canDownloadPdf} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovedRequestView;

