const express = require('express');
const { 
  getFeed, 
  saveContent, 
  shareContent, 
  reportContent 
} = require('../controllers/feedController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getFeed);
router.post('/save', saveContent);
router.post('/share', shareContent);
router.post('/report', reportContent);

module.exports = router;