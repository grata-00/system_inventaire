
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, FileText } from 'lucide-react';

interface PurchaseOrderPdfViewerProps {
  pdfDataUri?: string;
  requestNumber: string;
  className?: string;
}

export const PurchaseOrderPdfViewer: React.FC<PurchaseOrderPdfViewerProps> = ({
  pdfDataUri,
  requestNumber,
  className
}) => {
  if (!pdfDataUri) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bon de commande PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun bon de commande PDF disponible</p>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `bon-commande-${requestNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleView = () => {
    try {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Bon de commande ${requestNumber}</title></head>
            <body style="margin:0;">
              <iframe src="${pdfDataUri}" width="100%" height="100%" style="border:none;"></iframe>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Erreur lors de la visualisation:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bon de commande PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bon de commande pour la demande {requestNumber}
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleView} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Visualiser
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
          
          {/* Aperçu iframe pour les navigateurs supportés */}
          <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <iframe 
              src={pdfDataUri} 
              width="100%" 
              height="100%"
              title={`Bon de commande ${requestNumber}`}
              className="border-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};