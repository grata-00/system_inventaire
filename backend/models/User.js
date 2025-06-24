
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

class User extends Model {
  // Instance method to convert user to JSON (exclude password)
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  // Static method to validate password
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
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
    defaultValue: 'commercial'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  activatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

module.exports = User;
