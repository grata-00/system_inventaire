
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseRequest {
  id: string;
  requestNumber: string;
  projectName: string;
  commercialName?: string;
  productName?: string;
  quantity: number;
  estimatedPrice?: number;
  totalEstimatedCost: number;
  deliveryDate?: string;
  estimationDate?: string;
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  status: 'En attente' | 'En cours d\'approbation' | 'Approuvée' | 'Rejetée' | 'Commandée';
  notes?: string;
  rejectionReason?: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrderFile?: string;
  directorApprovals?: {
    directeurGeneral?: {
      approved: boolean;
      comment?: string;
      approvedAt: string;
      directorName: string;
    };
    directeurCommercial?: {
      approved: boolean;
      comment?: string;
      approvedAt: string;
      directorName: string;
    };
    directeurFinancier?: {
      approved: boolean;
      comment?: string;
      approvedAt: string;
      directorName: string;
    };
  };
  requestedProducts: any[];
  createdBy: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
  requester?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface PurchaseRequestsListProps {
  requests: PurchaseRequest[];
  onEdit?: (request: PurchaseRequest) => void;
  onDelete?: (id: string) => void;
  onApprove?: (request: PurchaseRequest, approved: boolean, comment: string) => void;
  onAddPurchaseOrder?: (request: PurchaseRequest) => void;
  onUpdateDelivery?: (request: PurchaseRequest) => void;
  onComplete?: (request: PurchaseRequest) => void;
  onViewApproved?: (request: PurchaseRequest) => void;
  onViewDetails?: (request: PurchaseRequest) => void;
  disableActions?: {
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

export const PurchaseRequestsList: React.FC<PurchaseRequestsListProps> = ({
  requests,
  onEdit,
  onDelete,
  onApprove,
  onAddPurchaseOrder,
  onUpdateDelivery,
  onComplete,
  onViewApproved,
  onViewDetails,
  disableActions = {}
}) => {
  const { user, hasRole } = useAuth();

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande d'achat</h3>
          <p className="text-gray-500">Il n'y a pas encore de demandes d'achat à afficher.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'En attente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'En cours d\'approbation': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Approuvée': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejetée': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'Commandée': { color: 'bg-purple-100 text-purple-800', icon: Package }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['En attente'];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'Basse': 'bg-gray-100 text-gray-800',
      'Normale': 'bg-blue-100 text-blue-800',
      'Haute': 'bg-orange-100 text-orange-800',
      'Urgente': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['Normale']}>
        {priority}
      </Badge>
    );
  };

  const isAdmin = hasRole(['admin']);

  const canEditOrDelete = (request: PurchaseRequest) => {
    if (isAdmin) return true;
    
    if (user?.role === 'commercial') {
      if (request.createdBy && typeof request.createdBy === 'object' && 'id' in request.createdBy) {
        return request.createdBy.id === user.id && request.status === 'En attente';
      }
      if (typeof request.createdBy === 'string') {
        return request.createdBy === user.id && request.status === 'En attente';
      }
    }
    
    return false;
  };

  const getCreatorName = (request: PurchaseRequest) => {
    if (request.commercialName) {
      return request.commercialName;
    }
    
    if (!request.createdBy) {
      return 'Utilisateur inconnu';
    }
    
    if (typeof request.createdBy === 'object' && 'name' in request.createdBy && request.createdBy.name) {
      return request.createdBy.name;
    }
    
    if (typeof request.createdBy === 'object' && 'firstName' in request.createdBy && 'lastName' in request.createdBy) {
      return `${request.createdBy.firstName} ${request.createdBy.lastName}`;
    }
    
    if (request.requester) {
      return `${request.requester.firstName} ${request.requester.lastName}`;
    }
    
    return 'Utilisateur inconnu';
  };

  const getDirectorApprovalsStatus = (request: PurchaseRequest) => {
    if (!request.directorApprovals) return null;
    
    const approvals = request.directorApprovals;
    const roles = ['directeurGeneral', 'directeurCommercial', 'directeurFinancier'];
    const roleNames = {
      directeurGeneral: 'DG',
      directeurCommercial: 'DC', 
      directeurFinancier: 'DF'
    };
    
    return (
      <div className="flex gap-1 flex-wrap">
        {roles.map(role => {
          const approval = approvals[role as keyof typeof approvals];
          const roleName = roleNames[role as keyof typeof roleNames];
          
          if (!approval) {
            return (
              <Badge key={role} className="bg-gray-100 text-gray-600 text-xs">
                {roleName}: En attente
              </Badge>
            );
          }
          
          return (
            <Badge 
              key={role} 
              className={`text-xs ${approval.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              title={`${approval.directorName} - ${format(new Date(approval.approvedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}`}
            >
              {roleName}: {approval.approved ? 'Approuvé' : 'Refusé'}
            </Badge>
          );
        })}
      </div>
    );
  };

  const handleDownloadPdf = (request: PurchaseRequest) => {
    if (request.purchaseOrderFile) {
      try {
        const link = document.createElement('a');
        link.href = request.purchaseOrderFile;
        link.download = `bon-commande-${request.requestNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
  };

  const handleViewPdf = (request: PurchaseRequest) => {
    if (request.purchaseOrderFile) {
      try {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Bon de commande ${request.requestNumber}</title></head>
              <body style="margin:0;">
                <iframe src="${request.purchaseOrderFile}" width="100%" height="100%" style="border:none;"></iframe>
              </body>
            </html>
          `);
        }
      } catch (error) {
        console.error('Erreur lors de la visualisation:', error);
      }
    }
  };

  const getDetailedApprovalHistory = (request: PurchaseRequest) => {
    if (!request.directorApprovals) return null;
    
    const approvals = request.directorApprovals;
    const approvedDirectors = Object.entries(approvals)
      .filter(([_, approval]) => approval?.approved)
      .map(([role, approval]) => {
        const roleNames = {
          directeurGeneral: 'Directeur Général',
          directeurCommercial: 'Directeur Commercial', 
          directeurFinancier: 'Directeur Financier'
        };
        return {
          role: roleNames[role as keyof typeof roleNames],
          name: approval!.directorName,
          date: approval!.approvedAt,
          comment: approval!.comment
        };
      });

    if (approvedDirectors.length === 0) return null;

    return (
      <div className="mt-2 text-xs text-gray-600">
        <p className="font-medium">Approuvé par:</p>
        {approvedDirectors.map((approval, index) => (
          <div key={index} className="ml-2">
            <span className="font-medium">{approval.role}</span> ({approval.name}) 
            - {format(new Date(approval.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
            {approval.comment && (
              <p className="italic text-gray-500 ml-2">"{approval.comment}"</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {request.requestNumber}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(request.status)}
                  {getPriorityBadge(request.priority)}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Boutons pour voir et télécharger le PDF */}
                {request.purchaseOrderFile && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPdf(request)}
                      title="Voir le bon de commande PDF"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Voir PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(request)}
                      title="Télécharger le bon de commande PDF"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </>
                )}
                
                {/* Bouton pour voir les détails - accessible à tous */}
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Button>
                )}
                
                {request.status === 'Approuvée' && onViewApproved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewApproved(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Bon de commande
                  </Button>
                )}
                
                {canEditOrDelete(request) && !disableActions.edit && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(request)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
                
                {canEditOrDelete(request) && !disableActions.delete && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(request.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Produit:</span>
                </div>
                <p className="text-sm font-medium">
                  {request.productName || (request.requestedProducts[0]?.name || 'Non spécifié')}
                </p>
                <p className="text-xs text-gray-500">
                  Quantité: {request.quantity}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Projet:</span>
                </div>
                <p className="text-sm font-medium">{request.projectName}</p>
                <p className="text-xs text-gray-500">
                  Commercial: {getCreatorName(request)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Coût estimé:</span>
                </div>
                <p className="text-sm font-medium">
                  {(request.estimatedPrice || request.totalEstimatedCost).toLocaleString('fr-FR')} €
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Livraison souhaitée:</span>
                </div>
                <p className="text-sm font-medium">
                  {request.deliveryDate 
                    ? format(new Date(request.deliveryDate), 'dd/MM/yyyy', { locale: fr })
                    : 'Non spécifiée'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Créée le {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            
            {/* Affichage des approbations des directeurs avec historique détaillé */}
            {request.directorApprovals && (request.status === 'En cours d\'approbation' || request.status === 'Approuvée' || request.status === 'Rejetée') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Approbations des directeurs:</span>
                </div>
                {getDirectorApprovalsStatus(request)}
                
                {/* Historique détaillé des approbations */}
                {getDetailedApprovalHistory(request)}
                
                {request.status === 'Rejetée' && request.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                    <span className="font-medium text-red-800">Raison du refus:</span>
                    <p className="text-red-700 mt-1">{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
            
            {request.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {request.notes}
                </p>
              </div>
            )}

            {/* Indication de la présence d'un bon de commande */}
            {request.purchaseOrderFile && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Bon de commande PDF joint</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};