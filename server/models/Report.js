const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit', 'linkedin', 'other']
  },
  reason: {
    type: String,
    required: true,
    enum: ['inappropriate', 'spam', 'misleading', 'offensive', 'other']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent users from reporting the same content multiple times
ReportSchema.index({ user: 1, contentId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Report', ReportSchema);