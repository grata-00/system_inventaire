
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PurchaseOrder extends Model {
  static associate(models) {
    // Relation avec User
    PurchaseOrder.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    // Relation avec PurchaseRequest
    PurchaseOrder.belongsTo(models.PurchaseRequest, {
      foreignKey: 'purchaseRequestId',
      as: 'purchaseRequest'
    });
  }
}

PurchaseOrder.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: false
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Brouillon', 'Confirmée', 'Envoyée_Logistique', 'En_Livraison', 'Livrée', 'Annulée'),
    defaultValue: 'Brouillon'
  },
  orderDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expectedDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  actualDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  purchaseRequestId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  confirmedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentToLogisticsBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sentToLogisticsAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'PurchaseOrder',
  tableName: 'purchase_orders'
});

module.exports = PurchaseOrder;