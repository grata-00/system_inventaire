
const express = require('express');
const { Material, User, Stock } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all materials with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /materials - Fetching materials');
    
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: materials } = await Material.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`Found ${materials.length} materials`);

    res.json({
      success: true,
      data: materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get material by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /materials/${req.params.id} - Fetching material`);
    
    const material = await Material.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create material with optional image upload
router.post('/', authMiddleware, requireRole(['admin', 'magasinier']), upload.any(), async (req, res) => {
  try {
    console.log('POST /materials - Creating material');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    const { name, quantity, restockDate } = req.body;
    
    if (!name || !quantity || !restockDate) {
      return res.status(400).json({
        success: false,
        error: 'Name, quantity, and restock date are required'
      });
    }

    const materialData = {
      name,
      quantity: parseInt(quantity),
      restockDate: new Date(restockDate),
      createdBy: req.user.id,
      isActive: true
    };

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      const imageFile = req.files[0];
      materialData.image = `/uploads/${imageFile.filename}`;
      materialData.imageUrl = `/uploads/${imageFile.filename}`;
      console.log('Image uploaded:', materialData.image);
    }

    const material = await Material.create(materialData);

    // Create corresponding stock entry
    await Stock.create({
      materialId: material.id,
      quantity: parseInt(quantity),
      location: 'Entrepôt principal',
      minQuantity: 5,
      maxQuantity: 100,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Fetch the created material with relations
    const materialWithDetails = await Material.findByPk(material.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    console.log('Material created successfully:', material.id);

    res.status(201).json({
      success: true,
      data: materialWithDetails,
      message: 'Material created successfully'
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update material
router.put('/:id', authMiddleware, requireRole(['admin', 'magasinier']), upload.any(), async (req, res) => {
  try {
    console.log(`PUT /materials/${req.params.id} - Updating material`);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    const { name, quantity, restockDate } = req.body;

    const updateData = {
      name: name || material.name,
      quantity: quantity ? parseInt(quantity) : material.quantity,
      restockDate: restockDate ? new Date(restockDate) : material.restockDate
    };

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      const imageFile = req.files[0];
      updateData.image = `/uploads/${imageFile.filename}`;
      updateData.imageUrl = `/uploads/${imageFile.filename}`;
      console.log('Image updated:', updateData.image);
    }

    await material.update(updateData);

    // Update corresponding stock if quantity changed
    if (quantity) {
      const stock = await Stock.findOne({ where: { materialId: req.params.id } });
      if (stock) {
        await stock.update({
          quantity: parseInt(quantity),
          updatedBy: req.user.id
        });
      }
    }

    // Fetch updated material with relations
    const updatedMaterial = await Material.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    console.log('Material updated successfully:', req.params.id);

    res.json({
      success: true,
      data: updatedMaterial
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete material
router.delete('/:id', authMiddleware, requireRole(['admin', 'magasinier']), async (req, res) => {
  try {
    console.log(`DELETE /materials/${req.params.id} - Deleting material`);
    
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    // Delete corresponding stock entries
    await Stock.destroy({ where: { materialId: req.params.id } });

    // Delete material
    await material.destroy();

    console.log('Material deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
