const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'profile_update', 'content_save', 'content_share', 'content_report', 'credit_earn', 'credit_spend'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creditsChange: {
    type: Number,
    default: 0
  },
  metadata: {
    contentId: mongoose.Schema.Types.ObjectId,
    contentSource: String,
    contentType: String,
    details: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster querying by user and date
ActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);