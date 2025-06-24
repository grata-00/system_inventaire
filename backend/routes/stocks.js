
const express = require('express');
const { Stock, Material, User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all stocks
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /stocks - Fetching stocks');
    
    const { search, status, minQuantity, maxQuantity } = req.query;
    
    const whereClause = {};
    if (minQuantity) whereClause.quantity = { [require('sequelize').Op.gte]: parseInt(minQuantity) };
    if (maxQuantity) {
      if (whereClause.quantity) {
        whereClause.quantity[require('sequelize').Op.lte] = parseInt(maxQuantity);
      } else {
        whereClause.quantity = { [require('sequelize').Op.lte]: parseInt(maxQuantity) };
      }
    }

    const includeClause = [
      {
        model: Material,
        as: 'material',
        attributes: ['id', 'name', 'image', 'restockDate']
      },
      {
        model: User,
        as: 'updater',
        attributes: ['firstName', 'lastName']
      }
    ];

    // Add search to material name if provided
    if (search) {
      includeClause[0].where = {
        name: { [require('sequelize').Op.iLike]: `%${search}%` }
      };
    }

    const stocks = await Stock.findAll({
      where: whereClause,
      include: includeClause,
      order: [['updatedAt', 'DESC']]
    });

    console.log(`Found ${stocks.length} stocks`);

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get stock by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /stocks/${req.params.id} - Fetching stock`);
    
    const stock = await Stock.findByPk(req.params.id, {
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name', 'image', 'restockDate']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create stock movement
router.post('/movement', authMiddleware, requireRole(['admin', 'magasinier']), async (req, res) => {
  try {
    console.log('POST /stocks/movement - Creating stock movement');
    console.log('Body:', req.body);
    
    const { materialId, quantity, movement, location } = req.body;

    if (!materialId || !quantity || !movement) {
      return res.status(400).json({
        success: false,
        error: 'Material ID, quantity and movement type are required'
      });
    }

    // Find or create stock record
    let stock = await Stock.findOne({ where: { materialId } });
    
    if (!stock) {
      // Create new stock record
      stock = await Stock.create({
        materialId,
        quantity: movement === 'Entrée' ? quantity : 0,
        location: location || 'Magasin principal',
        minQuantity: 5,
        lastMovement: movement,
        lastMovementDate: new Date(),
        lastMovementQuantity: quantity,
        updatedBy: req.user.id
      });
    } else {
      // Update existing stock
      let newQuantity = stock.quantity;
      
      if (movement === 'Entrée') {
        newQuantity += quantity;
      } else if (movement === 'Sortie') {
        newQuantity = Math.max(0, newQuantity - quantity);
      } else if (movement === 'Ajustement') {
        newQuantity = quantity;
      }

      await stock.update({
        quantity: newQuantity,
        location: location || stock.location,
        lastMovement: movement,
        lastMovementDate: new Date(),
        lastMovementQuantity: quantity,
        updatedBy: req.user.id
      });
    }

    // Update material quantity
    const material = await Material.findByPk(materialId);
    if (material) {
      await material.update({ quantity: stock.quantity });
    }

    const stockWithDetails = await Stock.findByPk(stock.id, {
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name', 'image', 'restockDate']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('stock_updated', stockWithDetails);
    }

    console.log('Stock movement created successfully:', stock.id);

    res.status(201).json({
      success: true,
      data: stockWithDetails,
      message: 'Stock movement created successfully'
    });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get low stocks
router.get('/low', authMiddleware, async (req, res) => {
  try {
    console.log('GET /stocks/low - Fetching low stocks');
    
    const stocks = await Stock.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { quantity: { [require('sequelize').Op.lte]: require('sequelize').col('minQuantity') } },
          { quantity: 0 }
        ]
      },
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name', 'image', 'restockDate']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    console.error('Error fetching low stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete stock
router.delete('/:id', authMiddleware, requireRole(['admin', 'magasinier']), async (req, res) => {
  try {
    console.log(`DELETE /stocks/${req.params.id} - Deleting stock`);
    
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    await stock.destroy();

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('stock_deleted', { id: req.params.id });
    }

    res.json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
