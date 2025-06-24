const express = require('express');
const { PurchaseRequest, User, PurchaseOrder, Notification } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Fonction utilitaire centralisée pour calculer le trackingStatus à partir des statuts (backend)
// Peut être extraite dans un util lorsque factorisé
function computeTrackingStatus(request, latestOrder) {
  // Si rejetée
  if (request.status === 'Rejetée') return 'Annulée';

  // À traiter
  if (request.status === 'En attente' || request.status === "En cours d'approbation") return "À traiter";

  // En traitement
  if (request.status === "Approuvée") return "En traitement";

  // Commandée → dépend du(s) BC
  if (request.status === "Commandée") {
    // No PO : "En traitement"
    if (!request.purchaseOrders || !request.purchaseOrders.length) return "En traitement";

    // Cherche le dernier BC…
    let po = latestOrder;
    if (!po) {
      po = [...request.purchaseOrders].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      )[0];
    }

    switch (po.status) {
      case "Brouillon":
      case "Confirmée":
        return "En traitement";
      case "Envoyée_Logistique":
      case "En_Livraison":
        return "Expédiée";
      case "Livrée":
        return "Livrée";
      case "Annulée":
        return "Annulée";
      default:
        return "En traitement";
    }
  }

  // Par défaut
  return "À traiter";
}

function computeGlobalTrackingStatus(request, latestOrder) {
  // Règle 1
  if (request.status === 'Rejetée') return 'Annulée';
  if (request.status === 'En attente' || request.status === "En cours d'approbation") return "À traiter";
  if (request.status === "Approuvée") return "En traitement";
  if (request.status === "Commandée") {
    // fallback (aucun BC créé)
    if (!request.purchaseOrders || !request.purchaseOrders.length) return "En traitement";
    let po = latestOrder;
    if (!po) {
      po = [...request.purchaseOrders].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      )[0];
    }
    switch (po.status) {
      case "Brouillon":
      case "Confirmée":
        return "En traitement";
      case "Envoyée_Logistique":
      case "En_Livraison":
        return "Expédiée";
      case "Livrée":
        return "Livrée";
      case "Annulée":
        return "Annulée";
      default:
        return "En traitement";
    }
  }
  return "À traiter";
}

// Get all purchase requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /purchase-requests - Fetching purchase requests');
    
    const { page = 1, limit = 10, status, priority } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const { count, rows: requests } = await PurchaseRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: PurchaseOrder, as: 'purchaseOrders' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // → Ajoute le champ virtual "trackingStatus"
    const requestsWithTracking = requests.map(r => {
      // .get({ plain: true }) pour virer l'instance Sequelize
      const plain = r.get ? r.get({ plain: true }) : r;
      let lastOrder = plain.purchaseOrders && plain.purchaseOrders.length
        ? [...plain.purchaseOrders].sort(
            (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
          )[0]
        : null;
      return {
        ...plain,
        trackingStatus: computeGlobalTrackingStatus(plain, lastOrder)
      }
    });

    console.log(`Found ${requests.length} purchase requests`);

    res.json({
      success: true,
      data: requestsWithTracking,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create purchase request
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /purchase-requests - Creating purchase request');
    console.log('Request body:', req.body);
    
    const requestNumber = `PR-${Date.now()}`;
    
    const requestData = {
      ...req.body,
      requestNumber,
      requestedBy: req.user.id,
      commercialName: `${req.user.firstName} ${req.user.lastName}`,
      status: 'En attente',
      approvals: [],
      approvalCount: 0,
      isFullyApproved: false,
      directorApprovals: {
        directeur_general: null,
        directeur_commercial: null,
        directeur_financier: null
      }
    };

    console.log('Creating request with data:', requestData);

    const request = await PurchaseRequest.create(requestData);

    const requestWithDetails = await PurchaseRequest.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_created', requestWithDetails);
    }

    console.log('Purchase request created successfully:', request.id);

    res.status(201).json({
      success: true,
      data: requestWithDetails,
      message: 'Purchase request created successfully'
    });
  } catch (error) {
    console.error('Error creating purchase request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Director approval/rejection - UPDATED VERSION with notifications
router.patch('/:id/director-approval', authMiddleware, requireRole(['directeur_general', 'directeur_commercial', 'directeur_financier']), async (req, res) => {
  try {
    console.log(`PATCH /purchase-requests/${req.params.id}/director-approval`);
    console.log('Request body:', req.body);
    console.log('User role:', req.user.role);
    
    const { approved, comment } = req.body;
    
    if (!approved && !comment) {
      return res.status(400).json({
        success: false,
        error: 'Un commentaire est obligatoire lors du refus d\'une demande'
      });
    }
    
    const request = await PurchaseRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }

    console.log('Current request status:', request.status);
    console.log('Current director approvals:', request.directorApprovals);

    if (request.status === 'Approuvée' || request.status === 'Rejetée' || request.status === 'Commandée') {
      return res.status(400).json({
        success: false,
        error: 'Cette demande ne peut plus être modifiée'
      });
    }

    // Get current approvals
    let currentApprovals = {};
    try {
      currentApprovals = request.directorApprovals ? 
        (typeof request.directorApprovals === 'string' ? 
          JSON.parse(request.directorApprovals) : 
          request.directorApprovals) : 
        {};
    } catch (e) {
      console.error('Error parsing director approvals:', e);
      currentApprovals = {};
    }

    if (!currentApprovals.directeur_general) currentApprovals.directeur_general = null;
    if (!currentApprovals.directeur_commercial) currentApprovals.directeur_commercial = null;
    if (!currentApprovals.directeur_financier) currentApprovals.directeur_financier = null;
    
    const directorType = req.user.role;
    const directorName = `${req.user.firstName} ${req.user.lastName}`;
    
    if (currentApprovals[directorType]) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà donné votre approbation pour cette demande'
      });
    }

    // Add director approval
    currentApprovals[directorType] = {
      approved,
      comment: comment || null,
      approvedAt: new Date().toISOString(),
      directorName
    };

    console.log('Updated approvals:', currentApprovals);

    // Check global status
    let newStatus = 'En cours d\'approbation';
    
    if (!approved) {
      newStatus = 'Rejetée';
      console.log('Request rejected by:', directorName);
    } else {
      const approvalValues = Object.values(currentApprovals).filter(approval => approval !== null);
      const allApproved = approvalValues.every(approval => approval && approval.approved === true);
      
      if (allApproved && approvalValues.length === 3) {
        newStatus = 'Approuvée';
        console.log('Request fully approved');
      }
    }

    console.log('New status:', newStatus);

    const updateData = {
      directorApprovals: currentApprovals,
      status: newStatus,
      approvedBy: newStatus === 'Approuvée' ? req.user.id : null,
      approvedAt: newStatus === 'Approuvée' ? new Date() : null,
      rejectionReason: !approved ? comment : null,
      updatedAt: new Date()
    };

    await request.update(updateData);

    // If fully approved, create purchase order and notify purchase manager
    if (newStatus === 'Approuvée') {
      const orderNumber = `PO-${Date.now()}`;
      
      const purchaseOrder = await PurchaseOrder.create({
        orderNumber,
        supplier: 'À définir',
        products: request.requestedProducts,
        totalAmount: request.totalEstimatedCost,
        status: 'Brouillon',
        orderDate: new Date(),
        expectedDeliveryDate: request.deliveryDate,
        notes: `Commande générée automatiquement depuis la demande ${request.requestNumber}`,
        purchaseRequestId: request.id,
        createdBy: req.user.id
      });

      await request.update({ status: 'Commandée' });

      // Create notification for purchase manager
      await Notification.create({
        type: 'new_order',
        title: 'Nouvelle demande d\'achat approuvée',
        message: `La demande ${request.requestNumber} a été approuvée par tous les directeurs et nécessite votre traitement`,
        targetRole: 'responsable_achat',
        sourceId: request.id,
        sourceType: 'purchase_request',
        createdBy: req.user.id
      });

      console.log('Purchase order created and notification sent to purchase manager');
    }

    const updatedRequest = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO events
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_updated', updatedRequest);
      if (newStatus === 'Commandée') {
        io.emit('purchase_order_created', { purchaseRequestId: request.id });
        io.emit('notification_created', {
          type: 'new_order',
          targetRole: 'responsable_achat',
          data: updatedRequest
        });
      }
    }

    const message = approved 
      ? (newStatus === 'Approuvée' ? 'Demande approuvée par tous les directeurs et envoyée au responsable achat' : 'Votre approbation a été enregistrée')
      : 'Demande rejetée';

    res.json({
      success: true,
      data: updatedRequest,
      message
    });

  } catch (error) {
    console.error('Error processing director approval:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Approve purchase request (système d'approbation multiple)
router.patch('/:id/approve', authMiddleware, requireRole(['admin', 'directeur_general', 'directeur_commercial', 'directeur_financier']), async (req, res) => {
  try {
    console.log(`PATCH /purchase-requests/${req.params.id}/approve`);
    
    const { notes } = req.body;
    
    const request = await PurchaseRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }

    // Vérifier si la demande peut encore être approuvée
    if (request.status === 'Approuvée' || request.status === 'Rejetée' || request.status === 'Commandée') {
      return res.status(400).json({
        success: false,
        error: 'Cette demande ne peut plus être approuvée'
      });
    }

    // Get current approvals
    const currentApprovals = request.approvals || [];
    
    // Check if this user already approved
    const alreadyApproved = currentApprovals.some(approval => approval.userId === req.user.id);
    if (alreadyApproved) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà approuvé cette demande'
      });
    }

    // Add new approval
    const newApproval = {
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      approvedAt: new Date().toISOString(),
      notes: notes || null
    };

    const updatedApprovals = [...currentApprovals, newApproval];
    const newApprovalCount = updatedApprovals.length;
    const requiredCount = request.requiredApprovalsCount || 3;
    const isFullyApproved = newApprovalCount >= requiredCount;

    // Update the request
    const updateData = {
      approvals: updatedApprovals,
      approvalCount: newApprovalCount,
      isFullyApproved,
      status: newApprovalCount === 1 ? 'En cours d\'approbation' : request.status
    };

    if (isFullyApproved) {
      updateData.status = 'Approuvée';
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    }

    await request.update(updateData);

    // If fully approved, create purchase order automatically
    if (isFullyApproved) {
      const orderNumber = `PO-${Date.now()}`;
      
      await PurchaseOrder.create({
        orderNumber,
        supplier: 'À définir', // Will be updated by purchase manager
        products: request.requestedProducts,
        totalAmount: request.totalEstimatedCost,
        status: 'Brouillon',
        orderDate: new Date(),
        expectedDeliveryDate: request.deliveryDate,
        notes: `Commande générée automatiquement depuis la demande ${request.requestNumber}`,
        purchaseRequestId: request.id,
        createdBy: req.user.id
      });

      // Update request status to 'Commandée'
      await request.update({ status: 'Commandée' });
    }

    const updatedRequest = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_updated', updatedRequest);
      if (isFullyApproved) {
        io.emit('purchase_order_created', { purchaseRequestId: request.id });
      }
    }

    console.log('Purchase request approval updated:', {
      requestId: request.id,
      approvalCount: newApprovalCount,
      requiredCount,
      isFullyApproved
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: isFullyApproved 
        ? 'Demande entièrement approuvée et bon de commande créé' 
        : `Approbation ajoutée (${newApprovalCount}/${requiredCount})`
    });
  } catch (error) {
    console.error('Error approving purchase request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update purchase request status
router.patch('/:id/status', authMiddleware, requireRole(['admin', 'directeur_general', 'responsable_achat', 'logistique']), async (req, res) => {
  try {
    console.log(`PATCH /purchase-requests/${req.params.id}/status`);
    
    const { status, rejectionReason } = req.body;
    
    const request = await PurchaseRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }

    const updateData = { status };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    }

    await request.update(updateData);

    const updatedRequest = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_updated', updatedRequest);
    }

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating purchase request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get purchase request by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /purchase-requests/${req.params.id}`);
    
    const request = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName', 'email', 'role']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrders'
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }

    const plain = request.get ? request.get({ plain: true }) : request;
    let lastOrder = plain.purchaseOrders && plain.purchaseOrders.length
      ? [...plain.purchaseOrders].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        )[0]
      : null;
    const trackingStatus = computeGlobalTrackingStatus(plain, lastOrder);

    res.json({
      success: true,
      data: { ...plain, trackingStatus }
    });
  } catch (error) {
    console.error('Error fetching purchase request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH: Service logistique met à jour le statut d'une demande d'achat
router.patch('/:id/update-logistics-status', authMiddleware, requireRole(['logistique']), async (req, res) => {
  try {
    const { status } = req.body;
    // Statuts autorisés = enum PurchaseOrder.status
    const ALLOWED_STATUSES = [
      'Brouillon',
      'Confirmée',
      'Envoyée_Logistique',
      'En_Livraison',
      'Livrée',
      'Annulée'
    ];
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide'
      });
    }
    // On récupère la demande AVEC les bons de commande associés
    const request = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: PurchaseOrder, as: 'purchaseOrders' }
      ]
    });
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }
    // On cible le dernier (plus récent) bon de commande
    let lastOrder = request.purchaseOrders && request.purchaseOrders.length
      ? [...request.purchaseOrders].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        )[0]
      : null;

    if (!lastOrder) {
      return res.status(400).json({
        success: false,
        error: 'Aucun bon de commande lié à cette demande'
      });
    }
    // Mettre à jour le statut du bon de commande
    await lastOrder.update({ status });

    // Mettre à jour la demande si besoin (optionnel: ex 'Annulée' déclenche update aussi purchaseRequest.status)
    if (status === 'Annulée') {
      await request.update({ status: 'Rejetée' });
    }
    if (status === 'Livrée') {
      // Option: on peut également marquer la PurchaseRequest comme 'Livrée' ou autre (métier)
    }

    // On recharge la demande pour retour propre avec PO à jour
    const updatedRequest = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['firstName', 'lastName', 'email', 'role'] },
        { model: PurchaseOrder, as: 'purchaseOrders' }
      ]
    });

    // Recalcul du suivi métier (trackingStatus)
    const plain = updatedRequest.get ? updatedRequest.get({ plain: true }) : updatedRequest;
    lastOrder = plain.purchaseOrders && plain.purchaseOrders.length
      ? [...plain.purchaseOrders].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        )[0]
      : null;

    function computeTrackingStatus(request, po) {
      if (status === 'Annulée' || request.status === 'Rejetée') return 'Annulée';
      if (request.status === 'En attente' || request.status === "En cours d'approbation") return "À traiter";
      if (request.status === 'Approuvée') return "En traitement";
      // Cas principal : s'appuie sur le statut du dernier BC
      if (po) {
        switch (po.status) {
          case "Brouillon":
          case "Confirmée":
            return "En traitement";
          case "Envoyée_Logistique":
          case "En_Livraison":
            return "Expédiée";
          case "Livrée":
            return "Livrée";
          case "Annulée":
            return "Annulée";
          default:
            return "En traitement";
        }
      }
      return "À traiter";
    }
    const trackingStatus = computeTrackingStatus(plain, lastOrder);

    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_updated', updatedRequest);
    }

    res.json({
      success: true,
      data: { ...plain, trackingStatus },
      message: "Statut logistique mis à jour"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH: Transfert de la demande au service logistique (action Responsable achat)
router.patch('/:id/transfer-to-logistics', authMiddleware, requireRole(['responsable_achat', 'admin']), async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Purchase request not found'
      });
    }
    // Mettre à jour le statut de la demande pour indiquer la prise en charge logistique
    await request.update({ status: 'À traiter (logistique)' });

    // Créer une notification
    await Notification.create({
      type: 'new_delivery',
      title: 'Nouvelle demande d\'achat à traiter',
      message: `La demande ${request.requestNumber} doit être prise en charge et suivie par le service logistique.`,
      targetRole: 'logistique',
      sourceId: request.id,
      sourceType: 'purchase_request',
      createdBy: req.user.id
    });

    // Emit socket.io event si besoin
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_request_updated', request);
      io.emit('notification_created', {
        type: 'new_delivery',
        targetRole: 'logistique',
        data: request
      });
    }

    res.json({ success: true, data: request, message: "Demande transférée à la logistique" });
  } catch (error) {
    console.error('Erreur lors du transfert à la logistique:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;