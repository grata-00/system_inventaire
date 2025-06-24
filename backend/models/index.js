
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Material = require('./Material');
const Stock = require('./Stock');
const Delivery = require('./Delivery');
const Project = require('./Project');
const Product = require('./Product');
const PurchaseRequest = require('./PurchaseRequest');
const PurchaseOrder = require('./PurchaseOrder');
const Notification = require('./Notification');

// Initialize models
const models = {
  User,
  Material,
  Stock,
  Delivery,
  Project,
  Product,
  PurchaseRequest,
  PurchaseOrder,
  Notification
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Additional associations for proper foreign key relationships
User.hasMany(Material, { foreignKey: 'createdBy', as: 'materials' });
User.hasMany(Stock, { foreignKey: 'updatedBy', as: 'stockUpdates' });
User.hasMany(Delivery, { foreignKey: 'createdBy', as: 'deliveries' });
User.hasMany(Project, { foreignKey: 'createdBy', as: 'projects' });
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' });
User.hasMany(PurchaseRequest, { foreignKey: 'requestedBy', as: 'purchaseRequests' });
User.hasMany(PurchaseRequest, { foreignKey: 'approvedBy', as: 'approvedRequests' });
User.hasMany(PurchaseOrder, { foreignKey: 'createdBy', as: 'purchaseOrders' });
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'notifications' });

// Purchase Request - Purchase Order relationship (utiliser l'alias correct)
PurchaseOrder.belongsTo(PurchaseRequest, { foreignKey: 'purchaseRequestId', as: 'request' });

// Sync database function
const syncDatabase = async () => {
  try {
    console.log('🔄 Synchronizing database...');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  ...models,
  syncDatabase
};
