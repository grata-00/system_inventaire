
const express = require('express');
const { Product, User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /products - Fetching products');
    
    const { page = 1, limit = 10, search, category, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { reference: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const { count, rows: products } = await Product.findAndCountAll({
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

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create product
router.post('/', authMiddleware, requireRole(['admin', 'magasinier']), upload.single('file'), async (req, res) => {
  try {
    console.log('POST /products - Creating product');
    
    const productData = {
      ...req.body,
      createdBy: req.user.id
    };

    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    const productWithDetails = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('product_created', productWithDetails);
    }

    res.status(201).json({
      success: true,
      data: productWithDetails
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update product stock
router.put('/:id/stock', authMiddleware, requireRole(['admin', 'magasinier']), async (req, res) => {
  try {
    console.log(`PUT /products/${req.params.id}/stock - Updating stock`);
    
    const { quantity } = req.body;
    
    const updatedProduct = await Product.updateStock(req.params.id, quantity);
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('product_updated', updatedProduct);
    }

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
