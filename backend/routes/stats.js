const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const { calculateStreak } = require('../utils/streak');
const { generateHeatmapData } = require('../utils/heatmap');

// GET /api/stats
// Query params: ?target=team or ?target=userId
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'Join or create a team to view stats' });
    }

    const { target = 'team' } = req.query;
    const query = { teamId: req.user.teamId };

    if (target !== 'team') {
      query.userId = target;
    }

    // Fetch all entries for streak & heatmap
    const entries = await Entry.find(query)
      .select('createdAt source tag userId')
      .sort({ createdAt: 1 });

    const entryDates = entries.map(e => e.createdAt);

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreak(entryDates);

    // Calculate entries this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const entriesThisMonth = entries.filter(e => new Date(e.createdAt) >= startOfMonth).length;

    // Generate 14-week heatmap
    const heatmap = generateHeatmapData(entries);

    res.json({
      target,
      stats: {
        currentStreak,
        longestStreak,
        entriesThisMonth,
        totalEntries: entries.length,
      },
      heatmap: {
        weeks: heatmap.weeks,
        days: heatmap.days,
      }
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ message: 'Error calculating stats' });
  }
});

module.exports = router;
