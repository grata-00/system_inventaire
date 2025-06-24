
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PurchaseRequest extends Model {
  static associate(models) {
    PurchaseRequest.belongsTo(models.User, {
      foreignKey: 'requestedBy',
      as: 'requester'
    });
    
    PurchaseRequest.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    PurchaseRequest.hasMany(models.PurchaseOrder, {
      foreignKey: 'purchaseRequestId',
      as: 'purchaseOrders'
    });
  }
}

PurchaseRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commercialName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estimatedPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  requestedProducts: {
    type: DataTypes.JSON,
    allowNull: false
  },
  totalEstimatedCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Basse', 'Normale', 'Haute', 'Urgente'),
    defaultValue: 'Normale'
  },
  status: {
    type: DataTypes.ENUM('En attente', 'En cours d\'approbation', 'Approuvée', 'Rejetée', 'Commandée'),
    defaultValue: 'En attente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Champ pour stocker le fichier PDF uploadé manuellement (base64)
  purchaseOrderFile: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  // Champ pour stocker le bon de commande PDF généré automatiquement (conservé pour compatibilité)
  purchaseOrderPdf: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  // Nouveau système d'approbation des directeurs
  directorApprovals: {
    type: DataTypes.JSON,
    defaultValue: {
      directeurGeneral: null,
      directeurCommercial: null,
      directeurFinancier: null
    }
  },
  // Système d'approbation multiple (conservé pour compatibilité)
  approvals: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  approvalCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFullyApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requiredApprovalsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  }
}, {
  sequelize,
  modelName: 'PurchaseRequest',
  tableName: 'purchase_requests'
});

module.exports = PurchaseRequest;