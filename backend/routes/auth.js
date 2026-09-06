const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'shiplog_fallback_jwt_secret',
      { expiresIn: '90d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        avatarColor: user.avatarColor,
        teamId: user.teamId,
        githubUsername: user.githubUsername,
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'shiplog_fallback_jwt_secret',
      { expiresIn: '90d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        avatarColor: user.avatarColor,
        teamId: user.teamId,
        githubUsername: user.githubUsername,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    let team = null;
    if (req.user.teamId) {
      team = await Team.findById(req.user.teamId).select('name code createdBy members');
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        initials: req.user.initials,
        avatarColor: req.user.avatarColor,
        teamId: req.user.teamId,
        githubUsername: req.user.githubUsername,
        lastActive: req.user.lastActive,
      },
      team: team ? {
        id: team._id,
        name: team.name,
        code: team.code,
        memberCount: team.members.length,
      } : null
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// PATCH /api/auth/push-token
router.patch('/push-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    req.user.expoPushToken = token || null;
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Push token update error:', err);
    res.status(500).json({ message: 'Error updating push token' });
  }
});

module.exports = router;
