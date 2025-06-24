
const express = require('express');
const { Notification, User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /notifications - Fetching notifications for user:', req.user.role);
    
    const whereClause = {
      $or: [
        { targetRole: req.user.role },
        { targetUserId: req.user.id }
      ]
    };

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    console.log(`Found ${notifications.length} notifications for user role: ${req.user.role}`);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    console.log(`PATCH /notifications/${req.params.id}/read`);
    
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await notification.update({
      read: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    console.log('PATCH /notifications/mark-all-read');
    
    const whereClause = {
      $or: [
        { targetRole: req.user.role },
        { targetUserId: req.user.id }
      ],
      read: false
    };

    await Notification.update({
      read: true,
      readAt: new Date()
    }, {
      where: whereClause
    });

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create notification (admin only)
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    console.log('POST /notifications - Creating notification');
    
    const notification = await Notification.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;