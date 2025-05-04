import React, { useState } from 'react';
import { FaTwitter, FaReddit, FaBookmark, FaShare, FaFlag, FaCheck } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const FeedCard = ({ item }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [reported, setReported] = useState(false);

  const getSourceIcon = () => {
    switch (item.source) {
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'reddit':
        return <FaReddit className="text-orange-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSave = async () => {
    if (saved) return;
    
    setIsSaving(true);
    try {
      const res = await api.post('/feed/save', {
        contentId: item.id,
        source: item.source,
        title: item.title,
        description: item.description,
        image: item.image,
        url: item.url
      });
      
      setSaved(true);
      toast.success(`Content saved! You earned ${res.data.creditsEarned} credits.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (shared) return;
    
    setIsSharing(true);
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(item.url);
      
      // Record share in backend
      const res = await api.post('/feed/share', {
        contentId: item.id,
        source: item.source,
        url: item.url
      });
      
      setShared(true);
      toast.success(`Link copied! You earned ${res.data.creditsEarned} credits.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sharing content');
    } finally {
      setIsSharing(false);
    }
  };

  const handleReport = async () => {
    if (reported) return;
    
    setIsReporting(true);
    try {
      await api.post('/feed/report', {
        contentId: item.id,
        source: item.source,
        reason: 'inappropriate',
        url: item.url
      });
      
      setReported(true);
      toast.success('Content reported. Thanks for keeping our platform safe!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error reporting content');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {item.image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getSourceIcon()}
            <span className="text-sm text-gray-600 capitalize">{item.source}</span>
          </div>
          <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <span className="mr-3">{item.upvotes} upvotes</span>
          <span>{item.comments} comments</span>
        </div>
        
        <div className="flex justify-between border-t pt-3">
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
              saved
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {saved ? <FaCheck className="mr-1" /> : <FaBookmark className="mr-1" />}
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button
            onClick={handleShare}
            disabled={isSharing || shared}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
              shared
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {shared ? <FaCheck className="mr-1" /> : <FaShare className="mr-1" />}
            <span>{shared ? 'Shared' : 'Share'}</span>
          </button>
          
          <button
            onClick={handleReport}
            disabled={isReporting || reported}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
              reported
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {reported ? <FaCheck className="mr-1" /> : <FaFlag className="mr-1" />}
            <span>{reported ? 'Reported' : 'Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;