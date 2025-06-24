
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Stock extends Model {
  static associate(models) {
    // Relation avec Material
    Stock.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material'
    });
    
    // Relation avec User
    Stock.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  }
}

Stock.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  materialId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'materials',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  minQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  maxQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lastMovement: {
    type: DataTypes.ENUM('Entrée', 'Sortie', 'Ajustement'),
    allowNull: true
  },
  lastMovementDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastMovementQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Stock',
  tableName: 'stocks'
});

module.exports = Stock;
