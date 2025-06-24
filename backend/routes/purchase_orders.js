const express = require('express');
const { PurchaseOrder, PurchaseRequest, User, Notification } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// DEBUG: Log pour vérifier montage des routes (affiche au lancement du serveur)
console.log('>> [purchase_orders.js] Router mounted: /purchase-orders');

// Get all purchase orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /purchase-orders - Fetching purchase orders');
    
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: orders } = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: PurchaseRequest,
          as: 'purchaseRequest', // AJOUT : inclure la demande liée !
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`Found ${orders.length} purchase orders`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Confirm purchase order by purchase manager
router.patch('/:id/confirm', authMiddleware, requireRole(['responsable_achat', 'admin']), async (req, res) => {
  try {
    console.log(`PATCH /purchase-orders/${req.params.id}/confirm`);
    
    const { supplier, notes } = req.body;
    
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    if (order.status !== 'Brouillon') {
      return res.status(400).json({
        success: false,
        error: 'Cette commande ne peut plus être modifiée'
      });
    }

    // Update purchase order
    await order.update({
      status: 'Confirmée',
      supplier: supplier || order.supplier,
      notes: notes || order.notes,
      confirmedBy: req.user.id,
      confirmedAt: new Date()
    });

    // Update related purchase request
    if (order.purchaseRequestId) {
      await PurchaseRequest.update({
        status: 'Confirmée_Achat',
        confirmedBy: req.user.id,
        confirmedAt: new Date()
      }, {
        where: { id: order.purchaseRequestId }
      });
    }

    const updatedOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_order_confirmed', updatedOrder);
    }

    console.log('Purchase order confirmed successfully:', order.id);

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Commande confirmée par le responsable achat'
    });
  } catch (error) {
    console.error('Error confirming purchase order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send to logistics
router.patch('/:id/send-to-logistics', authMiddleware, requireRole(['responsable_achat', 'admin']), async (req, res) => {
  console.log(`PATCH /purchase-orders/${req.params.id}/send-to-logistics appelé`);
  
  try {
    console.log(`PATCH /purchase-orders/${req.params.id}/send-to-logistics`);
    
    const { deliveryInstructions } = req.body;
    
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    if (order.status !== 'Confirmée') {
      return res.status(400).json({
        success: false,
        error: 'La commande doit être confirmée avant d\'être envoyée à la logistique'
      });
    }

    // Update purchase order
    await order.update({
      status: 'Envoyée_Logistique',
      sentToLogisticsBy: req.user.id,
      sentToLogisticsAt: new Date(),
      notes: deliveryInstructions ? `${order.notes || ''}\n\nInstructions de livraison: ${deliveryInstructions}` : order.notes
    });

    // Update related purchase request
    if (order.purchaseRequestId) {
      await PurchaseRequest.update({
        status: 'Envoyée_Logistique',
        sentToLogisticsBy: req.user.id,
        sentToLogisticsAt: new Date()
      }, {
        where: { id: order.purchaseRequestId }
      });
    }

    // Create notification for logistics team
    await Notification.create({
      type: 'new_order',
      title: 'Nouvelle commande à livrer',
      message: `Commande ${order.orderNumber} prête pour livraison`,
      targetRole: 'logistique',
      sourceId: order.id,
      sourceType: 'purchase_order',
      createdBy: req.user.id
    });

    const updatedOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_order_sent_to_logistics', updatedOrder);
      io.emit('notification_created', {
        type: 'new_order',
        targetRole: 'logistique',
        data: updatedOrder
      });
    }

    console.log('Purchase order sent to logistics successfully:', order.id);

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Commande envoyée au service logistique'
    });
  } catch (error) {
    console.error('Error sending to logistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get purchase order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /purchase-orders/${req.params.id}`);
    
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: PurchaseRequest,
          as: 'purchaseRequest', // AJOUT ici aussi !
        },
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update status (logguer dans l'historique)
router.patch('/:id/status', authMiddleware, requireRole(['logistique', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: "Statut manquant" });

    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Commande non trouvée" });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Historisation dans une table purchase_order_status_logs (à créer en BDD)
    if (req.app.get("models")?.PurchaseOrderStatusLog) {
      await req.app.get("models").PurchaseOrderStatusLog.create({
        purchaseOrderId: order.id,
        fromStatus: oldStatus,
        toStatus: status,
        changedBy: req.user.id
      });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_order_status_updated', { id: order.id, from: oldStatus, to: status });
    }

    res.json({
      success: true,
      data: order,
      message: "Statut mis à jour"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du statut" });
  }
});

module.exports = router;