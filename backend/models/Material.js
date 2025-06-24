
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Material extends Model {
  static associate(models) {
    // Relation avec User
    Material.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    // Relation avec Stock
    Material.hasOne(models.Stock, {
      foreignKey: 'materialId',
      as: 'stock'
    });
  }
}

Material.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  restockDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Material',
  tableName: 'materials'
});

module.exports = Material;
