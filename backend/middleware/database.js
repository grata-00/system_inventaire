
const { sequelize } = require('../models');

const checkDatabaseConnection = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({
      success: false,
      error: 'Service de base de données temporairement indisponible'
    });
  }
};

module.exports = { checkDatabaseConnection };
