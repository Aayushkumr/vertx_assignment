import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const { username, bio, avatar } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const res = await axios.put('http://localhost:5000/api/dashboard/profile', formData);
      
      // Update user context with new data
      updateUser(res.data.data.user);
      
      // Show notification
      setNotification({
        type: 'success',
        message: res.data.data.creditsEarned 
          ? `Profile updated successfully! You earned ${res.data.data.creditsEarned} credits.` 
          : 'Profile updated successfully!'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Error updating profile'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
        
        {/* Notification */}
        {notification && (
          <div 
            className={`${
              notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
            } px-4 py-3 rounded relative mb-4`} 
            role="alert"
          >
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Preview */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full mb-4 overflow-hidden bg-gray-200">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={username || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold">{username || 'Username'}</h2>
                <p className="text-sm text-center text-gray-600 mt-2">{bio || 'No bio provided'}</p>
                
                <div className="mt-4 w-full">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile Completion:</span>
                    <span className="font-medium">
                      {user?.profileCompleted ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: user?.profileCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                  {!user?.profileCompleted && (
                    <p className="text-xs text-blue-600 mt-1">
                      Complete your profile to earn 20 credits!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Form */}
          <div className="md:col-span-2">
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Username"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  value={bio}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Tell us about yourself"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="avatar" className="block text-gray-700 text-sm font-bold mb-2">
                  Avatar URL
                </label>
                <input
                  type="text"
                  name="avatar"
                  id="avatar"
                  value={avatar}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://example.com/your-avatar.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to an image for your profile picture
                </p>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;