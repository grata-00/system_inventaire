
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Delivery extends Model {
  static associate(models) {
    // Relation avec User (créateur)
    Delivery.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    // Relation avec User (commercial)
    Delivery.belongsTo(models.User, {
      foreignKey: 'commercialId',
      as: 'commercial'
    });
  }
}

Delivery.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deliveryNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commercialId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  products: {
    type: DataTypes.TEXT, // JSON string
    allowNull: false
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Préparée', 'En transit', 'Livrée', 'Annulée'),
    defaultValue: 'Préparée'
  },
  driverName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vehicleInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Delivery',
  tableName: 'deliveries'
});

module.exports = Delivery;
