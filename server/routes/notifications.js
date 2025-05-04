const express = require('express');
const { 
  getNotifications, 
  markNotificationsAsRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', protect, getNotifications);
router.put('/read', protect, markNotificationsAsRead);

module.exports = router;