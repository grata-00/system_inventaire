
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Product extends Model {
  static associate(models) {
    // Relation avec User
    Product.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }

  // Static method to find by ID
  static async findById(id) {
    return await this.findByPk(id);
  }

  // Static method to update by ID
  static async updateById(id, updateData) {
    const product = await this.findByPk(id);
    if (!product) return null;
    
    await product.update(updateData);
    return product;
  }

  // Static method to delete by ID
  static async deleteById(id) {
    const product = await this.findByPk(id);
    if (!product) return false;
    
    await product.destroy();
    return true;
  }

  // Static method to update stock
  static async updateStock(id, quantity) {
    const product = await this.findByPk(id);
    if (!product) return null;

    let status = 'En stock';
    if (quantity === 0) {
      status = 'Rupture de stock';
    } else if (quantity <= 10) {
      status = 'Stock limité';
    }

    await product.update({ 
      quantity, 
      status 
    });
    return product;
  }
}

Product.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('En stock', 'Stock limité', 'Rupture de stock'),
    defaultValue: 'En stock'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specifications: {
    type: DataTypes.JSON,
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
  modelName: 'Product',
  tableName: 'products'
});

module.exports = Product;
