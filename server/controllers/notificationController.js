const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationManager');
const { getIo } = require('../utils/socket');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(30);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of notification IDs'
      });
    }

    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        user: req.user._id
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Save content
// @route   POST /api/content/save
// @access  Private
exports.saveContent = async (req, res) => {
  try {
    const { contentId, source, title, creditsEarned } = req.body;

    // Create activity record (assume this is implemented elsewhere)
    const activity = await createActivity(req.user._id, contentId, source, title, creditsEarned);

    // Create notification
    await createNotification(
      req.user._id,
      'save',
      `You saved content: ${title}`,
      {
        contentId,
        source,
        title,
        credits: creditsEarned
      }
    );

    // Emit notification via WebSocket
    try {
      const io = getIo();
      io.to(req.user._id.toString()).emit('notification', {
        type: 'save',
        message: `You saved content: ${title}`,
        credits: creditsEarned
      });
    } catch (error) {
      console.error('WebSocket notification error:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Content saved successfully',
      data: activity
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};