const express = require('express');
const { 
  getDashboard, 
  getSavedContent, 
  getAdminDashboard, 
  updateUserCredits 
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', protect, getDashboard);
router.get('/saved', protect, getSavedContent);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.put('/admin/credits/:userId', protect, authorize('admin'), updateUserCredits);

module.exports = router;