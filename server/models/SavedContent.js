const mongoose = require('mongoose');

const SavedContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit', 'linkedin', 'other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate saves
SavedContentSchema.index({ user: 1, contentId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('SavedContent', SavedContentSchema);