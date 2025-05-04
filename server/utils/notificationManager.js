const Notification = require('../models/Notification');

// Function to create a new notification
const createNotification = async (userId, type, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      metadata
    });
    
    // If we had WebSockets set up, we would emit the notification here
    // Example: io.to(userId.toString()).emit('new-notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Function to get unread notifications for a user
const getUnreadNotifications = async (userId) => {
  try {
    return await Notification.find({ 
      user: userId,
      read: false 
    })
    .sort('-createdAt')
    .limit(20);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

// Function to mark notifications as read
const markAsRead = async (notificationIds, userId) => {
  try {
    return await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        user: userId 
      },
      { read: true }
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUnreadNotifications,
  markAsRead
};