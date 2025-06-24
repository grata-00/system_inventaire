
const express = require('express');
const { User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    console.log('GET /users - Récupération des utilisateurs');
    
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    const usersData = users.map(user => user.toJSON());

    console.log(`Found ${usersData.length} users`);

    res.json({
      success: true,
      data: usersData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Créer un nouvel utilisateur
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    console.log('POST /users - Création d\'un nouvel utilisateur');
    console.log('Body:', req.body);
    
    const { email, password, firstName, lastName, role, isActive } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe, prénom et nom requis'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      role: role || 'commercial',
      isActive: isActive || false,
      activatedBy: isActive ? req.user.id : null,
      activatedAt: isActive ? new Date() : null
    };

    console.log('Creating user with data:', userData);

    const user = await User.create(userData);

    console.log('User created successfully:', user.id);

    res.status(201).json({
      success: true,
      data: user.toJSON(),
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Activer un utilisateur
router.patch('/:id/activate', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await user.update({
      isActive: true,
      activatedBy: req.user.id,
      activatedAt: new Date()
    });

    res.json({
      success: true,
      data: user.toJSON(),
      message: 'Utilisateur activé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Désactiver un utilisateur
router.patch('/:id/deactivate', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await user.update({ isActive: false });

    res.json({
      success: true,
      data: user.toJSON(),
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour le rôle d'un utilisateur
router.patch('/:id/role', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Rôle requis'
      });
    }

    const validRoles = ['admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      data: user.toJSON(),
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Supprimer un utilisateur
router.delete('/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer votre propre compte'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
