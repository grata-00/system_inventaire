const express = require('express');
const { Delivery, User, Stock, Material } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all deliveries with enriched data
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /deliveries - Fetching deliveries with relations');
    
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'commercial',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Parse products JSON for each delivery
    const enrichedDeliveries = deliveries.map(delivery => {
      const deliveryData = delivery.toJSON();
      try {
        deliveryData.products = JSON.parse(deliveryData.products || '[]');
      } catch (error) {
        console.error('Error parsing products JSON:', error);
        deliveryData.products = [];
      }
      return deliveryData;
    });

    console.log(`Found ${enrichedDeliveries.length} deliveries`);

    res.json({
      success: true,
      data: enrichedDeliveries
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get delivery by ID with enriched data
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /deliveries/${req.params.id} - Fetching delivery`);
    
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'commercial',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    const deliveryData = delivery.toJSON();
    try {
      deliveryData.products = JSON.parse(deliveryData.products || '[]');
    } catch (error) {
      console.error('Error parsing products JSON:', error);
      deliveryData.products = [];
    }

    res.json({
      success: true,
      data: deliveryData
    });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create delivery
router.post('/', authMiddleware, requireRole(['admin', 'service_facturation', 'logistique', 'responsable_achat']), async (req, res) => {
  try {
    console.log('POST /deliveries - Creating delivery');
    console.log('Body:', req.body);
    console.log('User:', req.user.role);
    
    const { 
      projectName, 
      clientName, 
      commercialId,
      deliveryAddress,
      products, 
      deliveryDate,
      driverName,
      vehicleInfo,
      notes 
    } = req.body;
    
    if (!projectName || !clientName || !products) {
      return res.status(400).json({
        success: false,
        error: 'Project name, client name, and products are required'
      });
    }

    // Generate delivery number
    const deliveryCount = await Delivery.count();
    const deliveryNumber = `LIV-${String(deliveryCount + 1).padStart(4, '0')}`;

    // Calculate total quantity
    const totalQuantity = Array.isArray(products) 
      ? products.reduce((sum, product) => sum + (product.quantity || 0), 0)
      : 0;

    // Determine source based on user role
    const source = req.user.role === 'service_facturation' ? 'service_facturation' : 
                   req.user.role === 'responsable_achat' ? 'responsable_achat' : 
                   'other';

    const deliveryData = {
      deliveryNumber,
      projectName,
      clientName,
      commercialId: commercialId || req.user.id, // Use current user as commercial if not specified
      deliveryAddress,
      products: JSON.stringify(products),
      totalQuantity,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      driverName,
      vehicleInfo,
      notes,
      source: source,
      status: 'Préparée',
      createdBy: req.user.id
    };

    console.log('Creating delivery with data:', deliveryData);

    const delivery = await Delivery.create(deliveryData);

    // Fetch the created delivery with relations
    const deliveryWithDetails = await Delivery.findByPk(delivery.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'commercial',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    const responseData = deliveryWithDetails.toJSON();
    responseData.products = products;

    console.log('Delivery created successfully:', delivery.id);

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Delivery created successfully'
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update delivery status with automatic stock deduction
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    console.log(`PATCH /deliveries/${req.params.id}/status - Updating status`);
    console.log('Body:', req.body);
    
    const { status, signature, actualDeliveryDate } = req.body;
    
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    const updateData = { status };
    
    if (signature) {
      updateData.signature = signature;
    }
    
    if (status === 'Livrée' && !delivery.actualDeliveryDate) {
      updateData.actualDeliveryDate = actualDeliveryDate || new Date();
      
      // Automatic stock deduction when delivery is marked as "Livrée"
      try {
        const products = JSON.parse(delivery.products || '[]');
        console.log('Processing stock deduction for products:', products);
        
        for (const product of products) {
          if (product.stockId && product.quantity) {
            console.log(`Deducting ${product.quantity} from stock ${product.stockId}`);
            
            // Find the stock record
            const stock = await Stock.findByPk(product.stockId, {
              include: [{
                model: Material,
                as: 'material'
              }]
            });
            
            if (stock) {
              // Calculate new quantity
              const newQuantity = Math.max(0, stock.quantity - product.quantity);
              
              // Update stock
              await stock.update({
                quantity: newQuantity,
                lastMovement: 'Sortie',
                lastMovementDate: new Date(),
                lastMovementQuantity: product.quantity,
                updatedBy: req.user.id
              });
              
              console.log(`Stock updated: ${stock.material?.name} - Old: ${stock.quantity}, New: ${newQuantity}`);
            } else {
              console.warn(`Stock not found for stockId: ${product.stockId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error during stock deduction:', error);
        // Don't fail the status update if stock deduction fails
      }
    }

    await delivery.update(updateData);

    // Fetch updated delivery with relations
    const updatedDelivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'commercial',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    const responseData = updatedDelivery.toJSON();
    try {
      responseData.products = JSON.parse(responseData.products || '[]');
    } catch (error) {
      console.error('Error parsing products JSON:', error);
      responseData.products = [];
    }

    console.log('Delivery status updated successfully:', req.params.id);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update delivery
router.put('/:id', authMiddleware, requireRole(['admin', 'service_facturation', 'logistique']), async (req, res) => {
  try {
    console.log(`PUT /deliveries/${req.params.id} - Updating delivery`);
    console.log('Body:', req.body);
    
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    const { 
      projectName, 
      clientName, 
      commercialId,
      deliveryAddress,
      products, 
      deliveryDate,
      driverName,
      vehicleInfo,
      notes 
    } = req.body;

    // Calculate total quantity if products are provided
    const totalQuantity = products && Array.isArray(products)
      ? products.reduce((sum, product) => sum + (product.quantity || 0), 0)
      : delivery.totalQuantity;

    const updateData = {
      projectName: projectName || delivery.projectName,
      clientName: clientName || delivery.clientName,
      commercialId: commercialId !== undefined ? commercialId : delivery.commercialId,
      deliveryAddress: deliveryAddress !== undefined ? deliveryAddress : delivery.deliveryAddress,
      products: products ? JSON.stringify(products) : delivery.products,
      totalQuantity,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : delivery.deliveryDate,
      driverName: driverName !== undefined ? driverName : delivery.driverName,
      vehicleInfo: vehicleInfo !== undefined ? vehicleInfo : delivery.vehicleInfo,
      notes: notes !== undefined ? notes : delivery.notes
    };

    await delivery.update(updateData);

    // Fetch updated delivery with relations
    const updatedDelivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'commercial',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    const responseData = updatedDelivery.toJSON();
    try {
      responseData.products = JSON.parse(responseData.products || '[]');
    } catch (error) {
      console.error('Error parsing products JSON:', error);
      responseData.products = [];
    }

    console.log('Delivery updated successfully:', req.params.id);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete delivery
router.delete('/:id', authMiddleware, requireRole(['admin', 'service_facturation']), async (req, res) => {
  try {
    console.log(`DELETE /deliveries/${req.params.id} - Deleting delivery`);
    
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    await delivery.destroy();

    console.log('Delivery deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;