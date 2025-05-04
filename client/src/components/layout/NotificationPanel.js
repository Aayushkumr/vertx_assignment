import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaBell, FaCheck } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';

const NotificationPanel = () => {
  const { isAuthenticated, token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Setup WebSocket connection
  useEffect(() => {
    if (isAuthenticated && token && user) {
      const newSocket = io('http://localhost:5000', {
        query: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification service');
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification service');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token, user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n._id);

      await axios.put('http://localhost:5000/api/notifications/read', {
        notificationIds: unreadIds
      });

      // Update local state
      setNotifications(
        notifications.map(n => ({
          ...n,
          read: true
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-600 hover:text-blue-500 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAsRead}
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaCheck className="mr-1" /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={notification._id || index}
                  className={`px-4 py-3 border-b ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <div className="mt-1 flex justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notification.metadata?.credits > 0 && (
                      <span className="text-xs font-medium text-green-600">
                        +{notification.metadata.credits} credits
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">No notifications yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;