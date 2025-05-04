// filepath: /Users/aayushkumar/Intern/Vertx_Assignment/client/src/components/notifications/NotificationPermission.js
import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';

const NotificationPermission = () => {
  const [permission, setPermission] = useState('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Subscribe to push notifications
        navigator.serviceWorker.ready.then(registration => {
          // Here you would typically send the subscription to your backend
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
          })
          .then(subscription => {
            // Send subscription to backend
            console.log('User subscribed:', subscription);
          })
          .catch(err => {
            console.error('Failed to subscribe user:', err);
          });
        });
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };
  
  // Convert VAPID key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  
  if (permission === 'granted') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={requestPermission}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg transition-colors"
      >
        {permission === 'denied' ? <FaBellSlash className="mr-2" /> : <FaBell className="mr-2" />}
        <span>
          {permission === 'denied' 
            ? 'Notifications blocked' 
            : 'Enable notifications'}
        </span>
      </button>
    </div>
  );
};

export default NotificationPermission;