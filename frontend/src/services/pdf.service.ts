
import jsPDF from 'jspdf';

export interface PurchaseOrderData {
  requestNumber: string;
  projectName: string;
  commercialName: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
  deliveryDate: string;
  estimationDate: string;
  notes?: string;
}

export class PdfService {
  static generatePurchaseOrderPdf(data: PurchaseOrderData): string {
    const doc = new jsPDF();
    
    // En-tête avec style
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BON DE COMMANDE', 105, 25, { align: 'center' });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Informations de la demande avec style amélioré
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPosition = 50;
    
    // Section Informations générales
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS GÉNÉRALES', 20, yPosition);
    yPosition += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`N° de demande: ${data.requestNumber}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Projet: ${data.projectName}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Commercial: ${data.commercialName}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Date d'estimation: ${new Date(data.estimationDate).toLocaleDateString('fr-FR')}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Date de livraison souhaitée: ${new Date(data.deliveryDate).toLocaleDateString('fr-FR')}`, 25, yPosition);
    yPosition += 20;
    
    // Section Produit
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS DU PRODUIT', 20, yPosition);
    yPosition += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Produit: ${data.productName}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Quantité: ${data.quantity}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Prix estimé: ${data.estimatedPrice.toLocaleString('fr-FR')} €`, 25, yPosition);
    yPosition += 20;
    
    // Section Notes
    if (data.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES ET COMMENTAIRES', 20, yPosition);
      yPosition += 15;
      
      doc.setFont('helvetica', 'normal');
      // Gérer les notes sur plusieurs lignes si nécessaire
      const splitNotes = doc.splitTextToSize(data.notes, 170);
      doc.text(splitNotes, 25, yPosition);
      yPosition += splitNotes.length * 8 + 20;
    }
    
    // Signature et validation
    yPosition = Math.max(yPosition, 220);
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDATION', 20, yPosition);
    yPosition += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Commercial:', 25, yPosition);
    doc.text('Date:', 110, yPosition);
    yPosition += 8;
    
    doc.text('Signature:', 25, yPosition);
    doc.text('_____________________', 25, yPosition + 10);
    doc.text('_____________________', 110, yPosition + 10);
    
    // Pied de page
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 285);
    
    return doc.output('datauristring');
  }

  static downloadPdf(dataUri: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static viewPdf(dataUri: string) {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${dataUri}" width="100%" height="100%"></iframe>`);
    }
  }
}