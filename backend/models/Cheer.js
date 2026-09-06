const mongoose = require('mongoose');

const CheerSchema = new mongoose.Schema({
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Ensure 1 cheer per user per entry
CheerSchema.index({ entryId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Cheer', CheerSchema);
