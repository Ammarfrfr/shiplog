const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const { calculateStreak } = require('../utils/streak');

// POST /api/team/create
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const code = await Team.generateUniqueCode();
    const team = new Team({
      name: name.trim(),
      code,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await team.save();

    req.user.teamId = team._id;
    await req.user.save();

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        memberCount: 1,
      }
    });
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ message: 'Error creating team' });
  }
});

// POST /api/team/join
router.post('/join', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Team invite code is required' });
    }

    const cleanCode = code.toUpperCase().trim();
    const team = await Team.findOne({ code: cleanCode });
    if (!team) {
      return res.status(404).json({ message: 'No team found with this invite code' });
    }

    if (!team.members.includes(req.user._id)) {
      team.members.push(req.user._id);
      await team.save();
    }

    req.user.teamId = team._id;
    await req.user.save();

    res.json({
      message: 'Joined team successfully',
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        memberCount: team.members.length,
      }
    });
  } catch (err) {
    console.error('Join team error:', err);
    res.status(500).json({ message: 'Error joining team' });
  }
});

// GET /api/team/crew
// Returns all crew members with last active time, streak, and recent logs
router.get('/crew', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'User is not part of any team' });
    }

    const team = await Team.findById(req.user.teamId).populate('members', 'name initials avatarColor email lastActive githubUsername');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Compute streak and entry count for each member
    const crewMembers = await Promise.all(
      team.members.map(async (member) => {
        const entries = await Entry.find({ userId: member._id })
          .select('createdAt')
          .sort({ createdAt: -1 });
        
        const dates = entries.map(e => e.createdAt);
        const { currentStreak, longestStreak } = calculateStreak(dates);

        return {
          id: member._id,
          name: member.name,
          initials: member.initials,
          avatarColor: member.avatarColor,
          githubUsername: member.githubUsername,
          lastActive: member.lastActive,
          currentStreak,
          longestStreak,
          totalEntries: entries.length,
          isCurrentUser: member._id.toString() === req.user._id.toString(),
        };
      })
    );

    res.json({
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
      },
      members: crewMembers,
    });
  } catch (err) {
    console.error('Crew endpoint error:', err);
    res.status(500).json({ message: 'Error fetching crew members' });
  }
});

module.exports = router;
