const User = require('../models/User');
const Activity = require('../models/Activity');
const SavedContent = require('../models/SavedContent');
const Report = require('../models/Report');

// @desc    Get user dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user._id;
    
    // Get credit statistics
    const user = await User.findById(userId);
    
    // Get types of credits
    const loginCredits = await Activity.aggregate([
      { $match: { user: userId, activityType: 'login' } },
      { $group: { _id: null, total: { $sum: '$creditsEarned' } } }
    ]);
    
    const saveCredits = await Activity.aggregate([
      { $match: { user: userId, activityType: 'save_content' } },
      { $group: { _id: null, total: { $sum: '$creditsEarned' } } }
    ]);
    
    const shareCredits = await Activity.aggregate([
      { $match: { user: userId, activityType: 'share_content' } },
      { $group: { _id: null, total: { $sum: '$creditsEarned' } } }
    ]);
    
    const creditStats = {
      total: user.credits,
      fromLogin: loginCredits[0]?.total || 0,
      fromSaves: saveCredits[0]?.total || 0,
      fromShares: shareCredits[0]?.total || 0
    };
    
    // Get recent activity
    const recentActivity = await Activity.find({ user: userId })
      .sort('-createdAt')
      .limit(10);
    
    // Get recent saved content
    const savedContent = await SavedContent.find({ user: userId })
      .sort('-createdAt')
      .limit(6);
    
    res.status(200).json({
      success: true,
      data: {
        creditStats,
        recentActivity,
        savedContent
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get user's saved content
// @route   GET /api/dashboard/saved
// @access  Private
exports.getSavedContent = async (req, res) => {
  try {
    const savedContent = await SavedContent.find({ user: req.user._id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      data: savedContent
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;
    
    // Credit statistics
    const creditAggregation = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCredits: { $sum: '$credits' },
          avgCredits: { $avg: '$credits' },
          maxCredits: { $max: '$credits' },
          minCredits: { $min: '$credits' }
        }
      }
    ]);
    
    const creditStats = creditAggregation.length > 0 ? creditAggregation[0] : {
      totalCredits: 0,
      avgCredits: 0,
      maxCredits: 0,
      minCredits: 0
    };
    
    // Top users by credits
    const topUsers = await User.find()
      .sort('-credits')
      .select('username email credits')
      .limit(10);
    
    // Recently reported content
    const reportedContent = await Report.find()
      .populate('user', 'username email')
      .sort('-createdAt')
      .limit(10);
    
    // Recent activities
    const recentActivities = await Activity.find()
      .populate('user', 'username email')
      .sort('-createdAt')
      .limit(20);
    
    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          admins: adminUsers,
          regularUsers
        },
        creditStats,
        topUsers,
        reportedContent,
        recentActivities
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update user credits (admin only)
// @route   PUT /api/dashboard/admin/credits/:userId
// @access  Private/Admin
exports.updateUserCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    
    if (credits === undefined || isNaN(parseInt(credits))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid credits value'
      });
    }
    
    // Get user to update
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate credits change
    const previousCredits = user.credits;
    const newCredits = parseInt(credits);
    const creditsChange = newCredits - previousCredits;
    
    // Update user credits
    user.credits = newCredits;
    await user.save();
    
    // Record activity
    await Activity.create({
      user: user._id,
      activityType: 'admin_update',
      description: `Admin updated credits from ${previousCredits} to ${newCredits}`,
      creditsEarned: creditsChange,
      metadata: {
        adminId: req.user._id,
        previousCredits,
        newCredits
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};