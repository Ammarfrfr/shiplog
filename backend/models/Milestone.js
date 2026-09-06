const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['done', 'current', 'upcoming'],
    default: 'upcoming',
  },
  subLabel: {
    type: String,
    default: 'not started',
    trim: true,
  },
  orderIndex: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

MilestoneSchema.index({ teamId: 1, orderIndex: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
