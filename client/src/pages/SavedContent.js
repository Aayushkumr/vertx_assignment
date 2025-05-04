import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTwitter, FaReddit, FaTrash, FaShare } from 'react-icons/fa';

const SavedContent = () => {
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  useEffect(() => {
    fetchSavedContent();
  }, []);

  const fetchSavedContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/dashboard/saved');
      setSavedContent(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching saved content');
      setLoading(false);
    }
  };

  const handleShare = async (content) => {
    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(content.url);
      
      // Record the share
      const res = await axios.post('http://localhost:5000/api/feed/share', {
        contentId: content.contentId,
        source: content.source,
        title: content.title
      });
      
      // Show notification
      setNotification({
        type: 'success',
        message: `Link copied to clipboard! You earned ${res.data.creditsEarned} credits.`
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Error sharing content'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleDelete = async (contentId) => {
    // In a real application, we would implement a delete endpoint
    // For this demo, we'll just remove it from the UI
    try {
      // Simulating delete
      setSavedContent(savedContent.filter(item => item._id !== contentId));
      
      // Show notification
      setNotification({
        type: 'success',
        message: 'Content removed from saved items'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Error removing content'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const filteredContent = savedContent.filter(content => {
    // Filter by search term
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by source
    const matchesSource = filterSource === 'all' || content.source === filterSource;
    
    return matchesSearch && matchesSource;
  });

  const SourceIcon = ({ source }) => {
    switch (source.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'reddit':
        return <FaReddit className="text-orange-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Content</h1>
        
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
        
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search saved content..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="twitter">Twitter</option>
              <option value="reddit">Reddit</option>
              <option value="linkedin">LinkedIn</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Saved content */}
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((content) => (
              <div key={content._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {content.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={content.image} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SourceIcon source={content.source} />
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                      {content.source}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2 truncate">{content.title}</h3>
                  {content.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 mt-2 border-t">
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Original
                    </a>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleShare(content)}
                        className="text-gray-600 hover:text-blue-600"
                        title="Share"
                      >
                        <FaShare />
                      </button>
                      <button 
                        onClick={() => handleDelete(content._id)}
                        className="text-gray-600 hover:text-red-600"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {savedContent.length === 0 ? 
                "You haven't saved any content yet." : 
                "No content matches your search criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedContent;