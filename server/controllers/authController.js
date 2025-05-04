const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with that email or username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if it's a new day since last login for daily credits
    const today = new Date();
    const lastLogin = new Date(user.lastLogin);
    
    // If it's a new day (different day), award credits
    let dailyLoginCredits = 0;
    if (
      today.getDate() !== lastLogin.getDate() ||
      today.getMonth() !== lastLogin.getMonth() ||
      today.getFullYear() !== lastLogin.getFullYear()
    ) {
      dailyLoginCredits = 5;
      user.credits += dailyLoginCredits;
      
      // Create activity record for daily login
      await Activity.create({
        user: user._id,
        activityType: 'login',
        description: 'Daily login bonus',
        creditsEarned: dailyLoginCredits
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res, dailyLoginCredits);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    
    // Get current user
    const user = await User.findById(req.user.id);
    
    // Check if completing profile for the first time
    const profileWasIncomplete = !user.profileCompleted;
    let creditsEarned = 0;
    
    // Update fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    
    // Check if profile is now complete (has all fields)
    if (profileWasIncomplete && user.username && user.bio && user.avatar) {
      user.profileCompleted = true;
      
      // Award credits for completing profile
      creditsEarned = 20;
      user.credits += creditsEarned;
      
      // Create activity record
      await Activity.create({
        user: user._id,
        activityType: 'profile_update',
        description: 'Completed profile',
        creditsEarned
      });
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        user,
        creditsEarned
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, dailyLoginCredits = 0) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    dailyLoginCredits
  });
};