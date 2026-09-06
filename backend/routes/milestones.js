const express = require('express');
const router = express.Router();
const Milestone = require('../models/Milestone');
const auth = require('../middleware/auth');

// GET /api/milestones
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'Join or create a team to view milestones' });
    }

    const milestones = await Milestone.find({ teamId: req.user.teamId })
      .populate('updatedBy', 'name initials')
      .sort({ orderIndex: 1, createdAt: 1 });

    res.json({ milestones });
  } catch (err) {
    console.error('Fetch milestones error:', err);
    res.status(500).json({ message: 'Error fetching milestones' });
  }
});

// POST /api/milestones
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'Join or create a team to add milestones' });
    }

    const { name, status = 'upcoming', subLabel = 'not started' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Milestone name is required' });
    }

    const count = await Milestone.countDocuments({ teamId: req.user.teamId });

    const milestone = new Milestone({
      teamId: req.user.teamId,
      name: name.trim(),
      status,
      subLabel: subLabel.trim(),
      orderIndex: count,
      updatedBy: req.user._id,
      completedAt: status === 'done' ? new Date() : null,
    });

    await milestone.save();

    res.status(201).json({ milestone });
  } catch (err) {
    console.error('Create milestone error:', err);
    res.status(500).json({ message: 'Error creating milestone' });
  }
});

// PATCH /api/milestones/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, status, subLabel } = req.body;
    const milestone = await Milestone.findOne({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (name) milestone.name = name.trim();
    if (status) {
      milestone.status = status;
      if (status === 'done' && !milestone.completedAt) {
        milestone.completedAt = new Date();
      } else if (status !== 'done') {
        milestone.completedAt = null;
      }
    }
    if (subLabel !== undefined) milestone.subLabel = subLabel.trim();
    milestone.updatedBy = req.user._id;

    await milestone.save();
    res.json({ milestone });
  } catch (err) {
    console.error('Update milestone error:', err);
    res.status(500).json({ message: 'Error updating milestone' });
  }
});

// DELETE /api/milestones/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const milestone = await Milestone.findOneAndDelete({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    res.json({ success: true, message: 'Milestone removed' });
  } catch (err) {
    console.error('Delete milestone error:', err);
    res.status(500).json({ message: 'Error deleting milestone' });
  }
});

// POST /api/milestones/reorder
router.post('/reorder', auth, async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array of milestone IDs
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds array required' });
    }

    const updates = orderedIds.map((id, index) =>
      Milestone.updateOne(
        { _id: id, teamId: req.user.teamId },
        { $set: { orderIndex: index } }
      )
    );

    await Promise.all(updates);

    const milestones = await Milestone.find({ teamId: req.user.teamId })
      .sort({ orderIndex: 1 });

    res.json({ milestones });
  } catch (err) {
    console.error('Reorder milestones error:', err);
    res.status(500).json({ message: 'Error reordering milestones' });
  }
});

module.exports = router;
