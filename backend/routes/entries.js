const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Cheer = require('../models/Cheer');
const auth = require('../middleware/auth');

// GET /api/entries
// Returns feed entries for user's team, grouped by day or flat with pagination
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'Join or create a team to view entries' });
    }

    const { tag, userId, limit = 50, page = 1 } = req.query;
    const query = { teamId: req.user.teamId };

    if (tag && tag !== 'all') {
      query.tag = tag;
    }
    if (userId) {
      query.userId = userId;
    }

    const entries = await Entry.find(query)
      .populate('userId', 'name initials avatarColor githubUsername')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Check which entries the current user has cheered
    const entryIds = entries.map(e => e._id);
    const userCheers = await Cheer.find({
      userId: req.user._id,
      entryId: { $in: entryIds }
    });
    const cheeredMap = new Set(userCheers.map(c => c.entryId.toString()));

    const enrichedEntries = entries.map(entry => {
      const isCheered = cheeredMap.has(entry._id.toString());
      return {
        id: entry._id,
        text: entry.text,
        tag: entry.tag,
        source: entry.source,
        commitHash: entry.commitHash,
        commitUrl: entry.commitUrl,
        cheerCount: entry.cheerCount || 0,
        isCheered,
        createdAt: entry.createdAt,
        user: entry.userId ? {
          id: entry.userId._id,
          name: entry.userId.name,
          initials: entry.userId.initials,
          avatarColor: entry.userId.avatarColor,
          githubUsername: entry.userId.githubUsername,
        } : null,
        isOwner: entry.userId && entry.userId._id.toString() === req.user._id.toString(),
      };
    });

    res.json({
      entries: enrichedEntries,
      page: Number(page),
      hasMore: entries.length === Number(limit),
    });
  } catch (err) {
    console.error('Fetch entries error:', err);
    res.status(500).json({ message: 'Error fetching entries' });
  }
});

// POST /api/entries
// Create a new progress log entry
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'You must belong to a team to post entries' });
    }

    const { text, tag = 'feature' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Entry text is required' });
    }

    const validTags = ['feature', 'fix', 'design', 'research', 'blocker'];
    const safeTag = validTags.includes(tag) ? tag : 'feature';

    const entry = new Entry({
      teamId: req.user.teamId,
      userId: req.user._id,
      text: text.trim(),
      tag: safeTag,
      source: 'manual',
    });

    await entry.save();
    await entry.populate('userId', 'name initials avatarColor githubUsername');

    res.status(201).json({
      entry: {
        id: entry._id,
        text: entry.text,
        tag: entry.tag,
        source: entry.source,
        cheerCount: 0,
        isCheered: false,
        createdAt: entry.createdAt,
        user: {
          id: req.user._id,
          name: req.user.name,
          initials: req.user.initials,
          avatarColor: req.user.avatarColor,
          githubUsername: req.user.githubUsername,
        },
        isOwner: true,
      }
    });
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({ message: 'Error creating entry' });
  }
});

// DELETE /api/entries/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    await Entry.findByIdAndDelete(req.params.id);
    await Cheer.deleteMany({ entryId: req.params.id });

    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

module.exports = router;
