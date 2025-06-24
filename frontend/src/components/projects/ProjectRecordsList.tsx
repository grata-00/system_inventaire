// import React, { useState } from "react";
// import { ProjectRecord } from "../../services/projects.api.service";
// import { Button } from "@/components/ui/button";
// import { Edit2, Trash2, FileText, Download } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import jsPDF from "jspdf";

// interface ProjectRecordsListProps {
//   projects: ProjectRecord[];
//   onEdit: (project: ProjectRecord) => void;
//   onDelete: (id: string) => void;
//   disableActions?: {
//     edit?: boolean;
//     delete?: boolean;
//     add?: boolean;
//   };
// }

// export const ProjectRecordsList: React.FC<ProjectRecordsListProps> = ({ 
//   projects, 
//   onEdit, 
//   onDelete,
//   disableActions = {} 
// }) => {
//   const { user, hasRole } = useAuth();
//   const [viewProject, setViewProject] = useState<ProjectRecord | null>(null);
  
//   const isBillingService = user?.role === 'service_facturation';
//   const isDirectorCommercial = hasRole('directeur_commercial') && !hasRole('admin');
  
//   // Check if editing/deleting should be disabled
//   const isEditDisabled = disableActions.edit || isBillingService || isDirectorCommercial;
//   const isDeleteDisabled = disableActions.delete || isBillingService || isDirectorCommercial;
  
//   // Generate PDF for a single project
//   const generateProjectPDF = (project: ProjectRecord) => {
//     const doc = new jsPDF();
    
//     // Add title
//     doc.setFontSize(20);
//     doc.text("SYSTEMAIR - FICHE PROJET", doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
//     // Add project basic info
//     doc.setFontSize(14);
//     doc.text(`Projet: ${project.projectName}`, 20, 40);
//     doc.text(`Client: ${project.clientName}`, 20, 50);
//     doc.text(`N° Commande: ${project.orderNumber || 'N/A'}`, 20, 60);
//     doc.text(`Commercial: ${project.commercialName}`, 20, 70);
    
//     // Add financial details
//     doc.setFontSize(12);
//     doc.text("DÉTAILS FINANCIERS", 20, 90);
//     doc.text(`Montant commande: ${project.orderAmount || 0} €`, 20, 100);
//     doc.text(`Prix: ${project.price || 0} €`, 20, 110);
//     doc.text(`Transport: ${project.transportAmount || 0} €`, 20, 120);
//     doc.text(`Mode de paiement: ${project.paymentMethod || 'N/A'}`, 20, 130);
    
//     // Add delivery info
//     doc.text("LIVRAISON", 20, 150);
//     doc.text(`Date de livraison: ${project.effectiveDeliveryDate || 'Non définie'}`, 20, 160);
//     doc.text(`Quantité: ${project.quantity || 'N/A'}`, 20, 170);
    
//     if (project.remarks) {
//       doc.text("REMARQUES", 20, 190);
//       doc.text(project.remarks, 20, 200);
//     }
    
//     return doc;
//   };
  
//   // Télécharger tous les projets en un seul PDF
//   const handleDownload = () => {
//     try {
//       if (projects.length === 0) {
//         toast.error("Aucun projet à exporter");
//         return;
//       }
      
//       // Créer un nouveau document PDF
//       const doc = new jsPDF();
      
//       // Ajouter le titre
//       doc.setFontSize(20);
//       doc.text("SYSTEMAIR - LISTE DES PROJETS", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
//       // Ajouter la date de génération
//       doc.setFontSize(12);
//       doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
//       // Créer un tableau pour les projets
//       let yPos = 40;
//       const xStart = 10;
//       const colWidths = [30, 50, 30, 20, 30, 30];
//       const headers = ["N° Commande", "Client / Projet", "Commercial", "Quantité", "Montant", "Livraison"];
      
//       // Dessiner l'en-tête du tableau
//       doc.setFillColor(240, 240, 240);
//       doc.rect(xStart, yPos, doc.internal.pageSize.width - 20, 10, 'F');
//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(10);
      
//       // Écrire les en-têtes
//       let xPos = xStart;
//       headers.forEach((header, i) => {
//         doc.text(header, xPos + 2, yPos + 7);
//         xPos += colWidths[i];
//       });
      
//       yPos += 10;
      
//       // Écrire les données des projets
//       doc.setFontSize(8);
//       projects.forEach((project, index) => {
//         // Alterner les couleurs de fond des lignes
//         if (index % 2 === 0) {
//           doc.setFillColor(250, 250, 250);
//           doc.rect(xStart, yPos, doc.internal.pageSize.width - 20, 10, 'F');
//         }
        
//         xPos = xStart;
        
//         // N° Commande
//         doc.text(project.orderNumber || "N/A", xPos + 2, yPos + 5);
//         xPos += colWidths[0];
        
//         // Client / Projet
//         doc.text(project.clientName, xPos + 2, yPos + 3);
//         doc.text(project.projectName, xPos + 2, yPos + 7);
//         xPos += colWidths[1];
        
//         // Commercial
//         doc.text(project.commercialName, xPos + 2, yPos + 5);
//         xPos += colWidths[2];
        
//         // Quantité
//         doc.text(project.quantity || "0", xPos + 2, yPos + 5);
//         xPos += colWidths[3];
        
//         // Montant
//         doc.text(`${project.orderAmount || 0} €`, xPos + 2, yPos + 5);
//         xPos += colWidths[4];
        
//         // Livraison
//         doc.text(project.effectiveDeliveryDate || "N/A", xPos + 2, yPos + 5);
        
//         yPos += 10;
        
//         // Ajouter une nouvelle page si nécessaire
//         if (yPos > doc.internal.pageSize.height - 20 && index < projects.length - 1) {
//           doc.addPage();
//           yPos = 20;
//         }
//       });
      
//       // Ajouter le pied de page
//       if (yPos > doc.internal.pageSize.height - 20) {
//         doc.addPage();
//         yPos = 20;
//       }
      
//       doc.setFontSize(8);
//       doc.text("Document généré automatiquement par le système Systemair.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
//       // Télécharger le PDF
//       doc.save(`Projets_Systemair_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
      
//       toast.success('Téléchargement de la liste des projets initié');
      
//     } catch (error) {
//       console.error("Erreur lors de l'exportation:", error);
//       toast.error("Erreur lors de l'exportation des projets");
//     }
//   };
  
//   if (projects.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-8 text-center">
//         <p className="text-gray-500">Aucune fiche projet n'a été créée.</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         {(isBillingService || isDirectorCommercial) && (
//           <div className="p-4 flex justify-end">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="flex items-center gap-1"
//               onClick={handleDownload}
//             >
//               <Download className="h-4 w-4" />
//               Télécharger en PDF
//             </Button>
//           </div>
//         )}
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   N° de commande
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Client / Projet
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Commercial
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Quantité
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Montant
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Livraison
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {projects.map((project) => (
//                 <tr key={project.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {project.orderNumber || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <div className="font-medium">{project.clientName}</div>
//                     <div className="text-xs text-gray-400">{project.projectName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {project.commercialName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {project.quantity || 0}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <div className="font-medium">{project.orderAmount || 0} €</div>
//                     <div className="text-xs text-gray-400">Prix: {project.price || 0} €</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {project.effectiveDeliveryDate || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-center">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex items-center gap-1"
//                       onClick={() => setViewProject(project)}
//                     >
//                       <FileText className="h-4 w-4" />
//                     </Button>
//                     {!isEditDisabled && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="flex items-center gap-1"
//                         onClick={() => onEdit(project)}
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                     {!isDeleteDisabled && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
//                         onClick={() => onDelete(project.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Project Details Dialog */}
//       <Dialog open={!!viewProject} onOpenChange={(open) => !open && setViewProject(null)}>
//         <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               Détails de la fiche projet
//             </DialogTitle>
//             <DialogDescription>
//               Informations complètes du projet {viewProject?.projectName}
//             </DialogDescription>
//           </DialogHeader>
          
//           {viewProject && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">N° de commande</p>
//                 <p className="font-medium">{viewProject.orderNumber || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Commercial</p>
//                 <p className="font-medium">{viewProject.commercialName}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Chiffré par</p>
//                 <p className="font-medium">{viewProject.pricedBy || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Client</p>
//                 <p className="font-medium">{viewProject.clientName}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Projet</p>
//                 <p className="font-medium">{viewProject.projectName}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Désignation</p>
//                 <p className="font-medium">{viewProject.orderDescription || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Quantité</p>
//                 <p className="font-medium">{viewProject.quantity || 0}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Montant commande</p>
//                 <p className="font-medium">{viewProject.orderAmount || 0} €</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Prix</p>
//                 <p className="font-medium">{viewProject.price || 0} €</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Coefficient de vente prévisionnel</p>
//                 <p className="font-medium">{viewProject.expectedSalesCoefficient || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Coefficient de vente effectif</p>
//                 <p className="font-medium">{viewProject.effectiveSalesCoefficient || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Taux de charge (£)</p>
//                 <p className="font-medium">{viewProject.poundRate || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Taux de charge ($)</p>
//                 <p className="font-medium">{viewProject.dollarRate || "N/A"}</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Transport</p>
//                 <p className="font-medium">{viewProject.transportAmount || 0} €</p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Modalité de paiement</p>
//                 <p className="font-medium">
//                   {viewProject.paymentMethod === 'virement' ? 'Virement' : 
//                    viewProject.paymentMethod === 'cheque' ? 'Chèque' :
//                    viewProject.paymentMethod === 'en_compte' ? 'En compte' : 
//                    viewProject.paymentMethod === 'espece' ? 'Espèce' : 'N/A'}
//                 </p>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-500">Date de livraison</p>
//                 <p className="font-medium">{viewProject.effectiveDeliveryDate || "Non définie"}</p>
//               </div>
              
//               {viewProject.remarks && (
//                 <div className="space-y-1 col-span-2">
//                   <p className="text-sm text-gray-500">Remarques</p>
//                   <p className="font-medium">{viewProject.remarks}</p>
//                 </div>
//               )}
//             </div>
//           )}
          
//           <DialogFooter className="pt-4">
//             <Button onClick={() => setViewProject(null)}>
//               Fermer
//             </Button>
//             {isBillingService && viewProject && (
//               <Button 
//                 variant="outline" 
//                 onClick={() => {
//                   if (!viewProject) return;
                  
//                   try {
//                     // Générer et télécharger le PDF
//                     const doc = generateProjectPDF(viewProject);
//                     doc.save(`Projet_${viewProject.projectName.replace(/\s+/g, '-')}.pdf`);
                    
//                     toast.success('Téléchargement du projet initié');
//                   } catch (error) {
//                     console.error("Erreur lors du téléchargement:", error);
//                     toast.error("Erreur lors du téléchargement du projet");
//                   }
//                 }}
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 Télécharger en PDF
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };
import React, { useState } from "react";
import { ProjectRecord } from "../../services/projects.api.service";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, FileText, Download } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ProjectRecordsListProps {
  projects: ProjectRecord[];
  onEdit: (project: ProjectRecord) => void;
  onDelete: (id: string) => void;
  disableActions?: {
    edit?: boolean;
    delete?: boolean;
    add?: boolean;
  };
}

export const ProjectRecordsList: React.FC<ProjectRecordsListProps> = ({ 
  projects, 
  onEdit, 
  onDelete,
  disableActions = {} 
}) => {
  const { user, hasRole } = useAuth();
  const [viewProject, setViewProject] = useState<ProjectRecord | null>(null);
  
  const isBillingService = user?.role === 'service_facturation';
  const isDirectorCommercial = hasRole('directeur_commercial') && !hasRole('admin');
  const isDirectorGeneral = hasRole('directeur_general') && !hasRole('admin');
  const isDirectorFinancier = hasRole('directeur_financier') && !hasRole('admin');
  const isResponsableAchat = hasRole('responsable_achat') && !hasRole('admin');
  
  // Check if editing/deleting should be disabled - Updated to include responsable_achat
  const isEditDisabled = disableActions.edit || isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat;
  const isDeleteDisabled = disableActions.delete || isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat;
  
  // Generate PDF for a single project
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
  
  // Télécharger tous les projets en un seul PDF
  const handleDownload = () => {
    try {
      if (projects.length === 0) {
        toast.error("Aucun projet à exporter");
        return;
      }
      
      // Créer un nouveau document PDF
      const doc = new jsPDF();
      
      // Ajouter le titre
      doc.setFontSize(20);
      doc.text("SYSTEMAIR - LISTE DES PROJETS", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Ajouter la date de génération
      doc.setFontSize(12);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      // Créer un tableau pour les projets
      let yPos = 40;
      const xStart = 10;
      const colWidths = [30, 50, 30, 20, 30, 30];
      const headers = ["N° Commande", "Client / Projet", "Commercial", "Quantité", "Montant", "Livraison"];
      
      // Dessiner l'en-tête du tableau
      doc.setFillColor(240, 240, 240);
      doc.rect(xStart, yPos, doc.internal.pageSize.width - 20, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      // Écrire les en-têtes
      let xPos = xStart;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, yPos + 7);
        xPos += colWidths[i];
      });
      
      yPos += 10;
      
      // Écrire les données des projets
      doc.setFontSize(8);
      projects.forEach((project, index) => {
        // Alterner les couleurs de fond des lignes
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(xStart, yPos, doc.internal.pageSize.width - 20, 10, 'F');
        }
        
        xPos = xStart;
        
        // N° Commande
        doc.text(project.orderNumber || "N/A", xPos + 2, yPos + 5);
        xPos += colWidths[0];
        
        // Client / Projet
        doc.text(project.clientName, xPos + 2, yPos + 3);
        doc.text(project.projectName, xPos + 2, yPos + 7);
        xPos += colWidths[1];
        
        // Commercial
        doc.text(project.commercialName, xPos + 2, yPos + 5);
        xPos += colWidths[2];
        
        // Quantité
        doc.text(project.quantity || "0", xPos + 2, yPos + 5);
        xPos += colWidths[3];
        
        // Montant
        doc.text(`${project.orderAmount || 0} €`, xPos + 2, yPos + 5);
        xPos += colWidths[4];
        
        // Livraison
        doc.text(project.effectiveDeliveryDate || "N/A", xPos + 2, yPos + 5);
        
        yPos += 10;
        
        // Ajouter une nouvelle page si nécessaire
        if (yPos > doc.internal.pageSize.height - 20 && index < projects.length - 1) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Ajouter le pied de page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(8);
      doc.text("Document généré automatiquement par le système Systemair.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Télécharger le PDF
      doc.save(`Projets_Systemair_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
      
      toast.success('Téléchargement de la liste des projets initié');
      
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation des projets");
    }
  };
  
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Aucune fiche projet n'a été créée.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {(isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat) && (
          <div className="p-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Télécharger en PDF
            </Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° de commande
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client / Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commercial
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.orderNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">{project.clientName}</div>
                    <div className="text-xs text-gray-400">{project.projectName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.commercialName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">{project.orderAmount || 0} €</div>
                    <div className="text-xs text-gray-400">Prix: {project.price || 0} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.effectiveDeliveryDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setViewProject(project)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {!isEditDisabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => onEdit(project)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {!isDeleteDisabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Dialog */}
      <Dialog open={!!viewProject} onOpenChange={(open) => !open && setViewProject(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la fiche projet
            </DialogTitle>
            <DialogDescription>
              Informations complètes du projet {viewProject?.projectName}
            </DialogDescription>
          </DialogHeader>
          
          {viewProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">N° de commande</p>
                <p className="font-medium">{viewProject.orderNumber || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Commercial</p>
                <p className="font-medium">{viewProject.commercialName}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Chiffré par</p>
                <p className="font-medium">{viewProject.pricedBy || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{viewProject.clientName}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Projet</p>
                <p className="font-medium">{viewProject.projectName}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Désignation</p>
                <p className="font-medium">{viewProject.orderDescription || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Quantité</p>
                <p className="font-medium">{viewProject.quantity || 0}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Montant commande</p>
                <p className="font-medium">{viewProject.orderAmount || 0} €</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Prix</p>
                <p className="font-medium">{viewProject.price || 0} €</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Coefficient de vente prévisionnel</p>
                <p className="font-medium">{viewProject.expectedSalesCoefficient || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Coefficient de vente effectif</p>
                <p className="font-medium">{viewProject.effectiveSalesCoefficient || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Taux de charge (£)</p>
                <p className="font-medium">{viewProject.poundRate || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Taux de charge ($)</p>
                <p className="font-medium">{viewProject.dollarRate || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Transport</p>
                <p className="font-medium">{viewProject.transportAmount || 0} €</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Modalité de paiement</p>
                <p className="font-medium">
                  {viewProject.paymentMethod === 'virement' ? 'Virement' : 
                   viewProject.paymentMethod === 'cheque' ? 'Chèque' :
                   viewProject.paymentMethod === 'en_compte' ? 'En compte' : 
                   viewProject.paymentMethod === 'espece' ? 'Espèce' : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Date de livraison</p>
                <p className="font-medium">{viewProject.effectiveDeliveryDate || "Non définie"}</p>
              </div>
              
              {viewProject.remarks && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Remarques</p>
                  <p className="font-medium">{viewProject.remarks}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button onClick={() => setViewProject(null)}>
              Fermer
            </Button>
            {(isBillingService || isDirectorGeneral || isDirectorFinancier || isResponsableAchat) && viewProject && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!viewProject) return;
                  
                  try {
                    // Générer et télécharger le PDF
                    const doc = generateProjectPDF(viewProject);
                    doc.save(`Projet_${viewProject.projectName.replace(/\s+/g, '-')}.pdf`);
                    
                    toast.success('Téléchargement du projet initié');
                  } catch (error) {
                    console.error("Erreur lors du téléchargement:", error);
                    toast.error("Erreur lors du téléchargement du projet");
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger en PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};