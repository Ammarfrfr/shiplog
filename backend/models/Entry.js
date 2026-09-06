const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  tag: {
    type: String,
    enum: ['feature', 'fix', 'design', 'research', 'blocker'],
    default: 'feature',
  },
  source: {
    type: String,
    enum: ['manual', 'github_commit'],
    default: 'manual',
  },
  commitHash: {
    type: String,
    default: null,
  },
  commitUrl: {
    type: String,
    default: null,
  },
  cheerCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Index for date filtering and team feeds
EntrySchema.index({ teamId: 1, createdAt: -1 });
EntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Entry', EntrySchema);
