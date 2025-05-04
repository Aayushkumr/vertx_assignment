const axios = require('axios');
const User = require('../models/User');
const SavedContent = require('../models/SavedContent');
const Report = require('../models/Report');
const Activity = require('../models/Activity');
const { cacheData, getCachedData } = require('../utils/cacheManager');

// @desc    Get feed content
// @route   GET /api/feed
// @access  Private
exports.getFeed = async (req, res) => {
  try {
    const cacheKey = `feed:${req.user._id}`;
    
    // Check if data exists in cache
    const cachedFeed = await getCachedData(cacheKey);
    
    if (cachedFeed) {
      console.log('Serving feed from cache');
      return res.status(200).json({
        success: true,
        data: cachedFeed,
        fromCache: true
      });
    }
    
    console.log('Cache miss, fetching fresh data');
    
    // In a real application, we would fetch data from external APIs (Twitter, Reddit, etc.)
    // For this demo, we'll generate mock data
    const mockFeed = await fetchExternalContent();
    
    // Store in cache for 10 minutes
    await cacheData(cacheKey, mockFeed, 600);
    
    res.status(200).json({
      success: true,
      data: mockFeed,
      fromCache: false
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Function to fetch content from external APIs
const fetchExternalContent = async () => {
  try {
    // For a real application, we would make actual API calls here
    const twitterContent = await fetchTwitterContent();
    const redditContent = await fetchRedditContent();
    
    // Normalize and combine the data
    return [...twitterContent, ...redditContent].sort(() => 0.5 - Math.random());
  } catch (error) {
    console.error('Error fetching external content:', error);
    // Fallback to mock data if API calls fail
    return generateMockFeed();
  }
};

const fetchTwitterContent = async () => {
  // In a real app, this would use the Twitter API
  // For demo purposes, return mock data
  return [
    {
      id: 'tw1',
      source: 'twitter',
      title: 'Latest Web Development Trends in 2023',
      description: 'Check out these amazing web development trends that are shaping the industry in 2023! #webdev #javascript #react',
      image: 'https://picsum.photos/800/400?random=1',
      url: 'https://twitter.com/example/status/1',
      upvotes: 452,
      comments: 28,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    // More Twitter content...
  ];
};

const fetchRedditContent = async () => {
  // In a real app, this would use the Reddit API
  // For demo purposes, return mock data
  return [
    {
      id: 'rd1',
      source: 'reddit',
      title: 'I built a full-stack application with MERN stack',
      description: 'After 3 months of learning, I finally built my first full-stack application using MongoDB, Express, React, and Node.js. Here\'s what I learned in the process...',
      image: 'https://picsum.photos/800/400?random=4',
      url: 'https://reddit.com/r/webdev/comments/example1',
      upvotes: 1245,
      comments: 137,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    // More Reddit content...
  ];
};

// @desc    Save content
// @route   POST /api/feed/save
// @access  Private
exports.saveContent = async (req, res) => {
  try {
    const { contentId, source, title, description, url, image } = req.body;
    
    if (!contentId || !source || !title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contentId, source, title, and url'
      });
    }
    
    // Check if content is already saved
    const existingSave = await SavedContent.findOne({
      user: req.user._id,
      contentId,
      source
    });
    
    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Content already saved'
      });
    }
    
    // Save the content
    await SavedContent.create({
      user: req.user._id,
      contentId,
      source,
      title,
      description,
      url,
      image
    });
    
    // Award credits for saving content
    const creditsEarned = 2;
    
    // Update user credits
    const user = await User.findById(req.user._id);
    user.credits += creditsEarned;
    await user.save();
    
    // Create activity record
    await Activity.create({
      user: req.user._id,
      activityType: 'save_content',
      description: `Saved content: ${title}`,
      creditsEarned,
      metadata: {
        contentId,
        source,
        title
      }
    });
    
    res.status(201).json({
      success: true,
      creditsEarned,
      totalCredits: user.credits,
      message: 'Content saved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Share content
// @route   POST /api/feed/share
// @access  Private
exports.shareContent = async (req, res) => {
  try {
    const { contentId, source, title } = req.body;
    
    if (!contentId || !source || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contentId, source, and title'
      });
    }
    
    // Award credits for sharing content
    const creditsEarned = 3;
    
    // Update user credits
    const user = await User.findById(req.user._id);
    user.credits += creditsEarned;
    await user.save();
    
    // Create activity record
    await Activity.create({
      user: req.user._id,
      activityType: 'share_content',
      description: `Shared content: ${title}`,
      creditsEarned,
      metadata: {
        contentId,
        source,
        title
      }
    });
    
    res.status(200).json({
      success: true,
      creditsEarned,
      totalCredits: user.credits,
      message: 'Content shared successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Report content
// @route   POST /api/feed/report
// @access  Private
exports.reportContent = async (req, res) => {
  try {
    const { contentId, source, reason, description } = req.body;
    
    if (!contentId || !source || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contentId, source, and reason'
      });
    }
    
    // Check if content is already reported by this user
    const existingReport = await Report.findOne({
      user: req.user._id,
      contentId,
      source
    });
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Content already reported'
      });
    }
    
    // Save the report
    await Report.create({
      user: req.user._id,
      contentId,
      source,
      reason,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Content reported successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Helper function to generate mock feed data
const generateMockFeed = () => {
  const twitterPosts = [
    {
      id: 'tw1',
      source: 'twitter',
      title: 'Latest Web Development Trends in 2023',
      description: 'Check out these amazing web development trends that are shaping the industry in 2023! #webdev #javascript #react',
      image: 'https://picsum.photos/800/400?random=1',
      url: 'https://twitter.com/example/status/1',
      upvotes: 452,
      comments: 28,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 'tw2',
      source: 'twitter',
      title: 'AI Tools for Developers',
      description: 'These AI tools are changing how developers work. Boost your productivity with these amazing tools! #AI #development #coding',
      image: 'https://picsum.photos/800/400?random=2',
      url: 'https://twitter.com/example/status/2',
      upvotes: 378,
      comments: 42,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
      id: 'tw3',
      source: 'twitter',
      title: 'Mobile App Design Inspiration',
      description: 'Looking for mobile app design inspiration? Here are some outstanding examples to get your creative juices flowing. #design #mobileapp #UI',
      image: 'https://pics