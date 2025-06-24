
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {
  static associate(models) {
    // Relation avec User (créateur)
    Notification.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'new_project',
      'new_delivery',
      'new_order',
      'status_update',
      'stock_alert',
      'user_action'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  targetRole: {
    type: DataTypes.ENUM(
      'admin',
      'commercial',
      'magasinier',
      'directeur_general',
      'directeur_commercial',
      'directeur_financier',
      'logistique',
      'responsable_achat',
      'service_facturation'
    ),
    allowNull: true
  },
  targetUserId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sourceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sourceType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications'
});

module.exports = Notification;
