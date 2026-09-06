const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  initials: {
    type: String,
    default: function() {
      if (!this.name) return '??';
      const parts = this.name.trim().split(' ');
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  },
  avatarColor: {
    type: String,
    default: function() {
      const colors = ['#C9963C', '#3E6E62', '#8E5B4D', '#5B7F98', '#6E8B6B', '#A85454'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  githubUsername: {
    type: String,
    default: null,
    trim: true,
  },
  githubAccessToken: {
    type: String,
    default: null,
  },
  expoPushToken: {
    type: String,
    default: null,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
