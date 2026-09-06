const mongoose = require('mongoose');

const DsaProblemSchema = new mongoose.Schema({
  sheetSource: {
    type: String,
    default: 'striver_a2z',
  },
  slug: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  step: {
    type: String,
    default: 'Step 1',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  link: {
    type: String,
    default: '',
  },
  orderIndex: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('DsaProblem', DsaProblemSchema);
