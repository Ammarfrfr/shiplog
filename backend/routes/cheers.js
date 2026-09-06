const express = require('express');
const router = express.Router();
const Cheer = require('../models/Cheer');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

// POST /api/cheers/:entryId
// Toggle cheer on an entry
router.post('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await Entry.findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const existingCheer = await Cheer.findOne({
      entryId,
      userId: req.user._id,
    });

    let cheered = false;
    if (existingCheer) {
      // Remove cheer
      await Cheer.findByIdAndDelete(existingCheer._id);
      entry.cheerCount = Math.max(0, (entry.cheerCount || 1) - 1);
      cheered = false;
    } else {
      // Add cheer
      const cheer = new Cheer({
        entryId,
        userId: req.user._id,
      });
      await cheer.save();
      entry.cheerCount = (entry.cheerCount || 0) + 1;
      cheered = true;
    }

    await entry.save();

    res.json({
      cheered,
      cheerCount: entry.cheerCount,
    });
  } catch (err) {
    console.error('Cheer toggle error:', err);
    res.status(500).json({ message: 'Error updating cheer' });
  }
});

module.exports = router;
