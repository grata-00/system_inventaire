
const express = require('express');
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { PurchaseRequest } = require('../models');

const router = express.Router();

// console.log('Type de db:', typeof db);
// console.log('Méthodes disponibles:', Object.keys(db));

// Obtenir toutes les demandes d'achat
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT pr.*, 
             u1.firstName as requesterFirstName, u1.lastName as requesterLastName,
             u2.firstName as approverFirstName, u2.lastName as approverLastName
      FROM purchase_requests pr 
      LEFT JOIN users u1 ON pr.requestedBy = u1.id 
      LEFT JOIN users u2 ON pr.approvedBy = u2.id 
      ORDER BY pr.createdAt DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes d\'achat:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Créer une nouvelle demande d'achat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestNumber, deliveryDate, estimationDate, totalEstimatedCost, quantity,projectName, requestedProducts,status, requestedBy} = req.body;

    if (!projectName || !requestedProducts) {
      return res.status(400).json({
        success: false,
        error: 'Nom du projet et produits requis'
      });
    }
    // console.log({ requestNumber, deliveryDate, estimationDate, totalEstimatedCost, quantity,projectName, requestedProducts,status})
    // return

    const id = uuidv4();
    
    const p={requestNumber, deliveryDate, estimationDate, totalEstimatedCost, quantity,projectName, requestedProducts,status, requestedBy}
    const pr = await PurchaseRequest.create(p)
    // await db.execute(
    //   `INSERT INTO purchase_requests (id, requestNumber, projectName, requestedProducts, totalEstimatedCost, priority, notes, requestedBy,estimationDate, quantity,deliveryDate, status) 
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
    //   [id, requestNumber, projectName, JSON.stringify(requestedProducts), totalEstimatedCost || 0, priority || 'Normale', notes, req.user.id,estimationDate, quantity,deliveryDate, status]
    // );

    // const [rows] = await db.execute(`
    //   SELECT pr.*, 
    //          u1.firstName as requesterFirstName, u1.lastName as requesterLastName
    //   FROM purchase_requests pr 
    //   LEFT JOIN users u1 ON pr.requestedBy = u1.id 
    //   WHERE pr.id = ?
    // `, [id]);

    res.status(201).json({
      success: true,
      data: pr 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande d\'achat:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Approuver une demande d'achat
router.patch('/:id/approve', authMiddleware, requireRole(['admin', 'directeur_general', 'directeur_financier', 'responsable_achat']), async (req, res) => {
  try {
    const { notes } = req.body;

    await db.execute(
      `UPDATE purchase_requests 
       SET status = 'Approuvée', approvedBy = ?, approvedAt = NOW(), notes = ?
       WHERE id = ?`,
      [req.user.id, notes || null, req.params.id]
    );

    const [rows] = await db.execute(`
      SELECT pr.*, 
             u1.firstName as requesterFirstName, u1.lastName as requesterLastName,
             u2.firstName as approverFirstName, u2.lastName as approverLastName
      FROM purchase_requests pr 
      LEFT JOIN users u1 ON pr.requestedBy = u1.id 
      LEFT JOIN users u2 ON pr.approvedBy = u2.id 
      WHERE pr.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demande d\'achat non trouvée'
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'Demande d\'achat approuvée'
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Rejeter une demande d'achat
router.patch('/:id/reject', authMiddleware, requireRole(['admin', 'directeur_general', 'directeur_financier', 'responsable_achat']), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Raison du rejet requise'
      });
    }

    await db.execute(
      `UPDATE purchase_requests 
       SET status = 'Rejetée', approvedBy = ?, approvedAt = NOW(), rejectionReason = ?
       WHERE id = ?`,
      [req.user.id, rejectionReason, req.params.id]
    );

    const [rows] = await db.query(`
      SELECT pr.*, 
             u1.firstName as requesterFirstName, u1.lastName as requesterLastName,
             u2.firstName as approverFirstName, u2.lastName as approverLastName
      FROM purchase_requests pr 
      LEFT JOIN users u1 ON pr.requestedBy = u1.id 
      LEFT JOIN users u2 ON pr.approvedBy = u2.id 
      WHERE pr.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Demande d\'achat non trouvée'
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'Demande d\'achat rejetée'
    });
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
