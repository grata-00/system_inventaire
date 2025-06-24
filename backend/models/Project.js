
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Project extends Model {
  static associate(models) {
    // Relation avec User
    Project.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

Project.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commercialName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'commercial'
  },
  pricedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  orderDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  orderAmount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expectedSalesCoefficient: {
    type: DataTypes.STRING,
    allowNull: true
  },
  effectiveSalesCoefficient: {
    type: DataTypes.STRING,
    allowNull: true
  },
  poundRate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dollarRate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transportAmount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('virement', 'cheque', 'en_compte', 'espece'),
    allowNull: true
  },
  effectiveDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects'
});

module.exports = Project;
