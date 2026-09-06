const mongoose = require('mongoose');

const DsaProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DsaProblem',
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'done'],
    default: 'todo',
  },
  completedVia: {
    type: String,
    enum: ['manual', 'commit_match'],
    default: 'manual',
  },
  completedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

DsaProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('DsaProgress', DsaProgressSchema);
