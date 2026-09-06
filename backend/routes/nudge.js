const express = require('express');
const router = express.Router();
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const auth = require('../middleware/auth');

const expo = new Expo();

// In-memory rate limiting map: `senderId_targetId` -> timestamp
const nudgeRateLimit = new Map();

// POST /api/nudge/:userId
// Sends a nudge push notification to a teammate
router.post('/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't nudge yourself" });
    }

    // Rate limiting: 1 nudge per minute per target
    const rateLimitKey = `${req.user._id}_${targetUserId}`;
    const lastNudge = nudgeRateLimit.get(rateLimitKey);
    const now = Date.now();
    if (lastNudge && now - lastNudge < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now - lastNudge)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds}s before nudging again.`
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.teamId || targetUser.teamId.toString() !== req.user.teamId.toString()) {
      return res.status(403).json({ message: 'You can only nudge members of your team' });
    }

    nudgeRateLimit.set(rateLimitKey, now);

    // If target user has an Expo push token, send push notification
    if (targetUser.expoPushToken && Expo.isExpoPushToken(targetUser.expoPushToken)) {
      const messages = [{
        to: targetUser.expoPushToken,
        sound: 'default',
        title: '⚡ Shiplog Nudge!',
        body: `${req.user.name} sent you a nudge! Time to log what you shipped today.`,
        data: { type: 'NUDGE', fromUserId: req.user._id },
      }];

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (pushError) {
          console.error('Error sending push notification chunk:', pushError);
        }
      }
    } else {
      console.log(`User ${targetUser.name} does not have an active expoPushToken registered.`);
    }

    res.json({
      success: true,
      message: `Nudged ${targetUser.name}!`,
      targetUserName: targetUser.name,
    });
  } catch (err) {
    console.error('Nudge error:', err);
    res.status(500).json({ message: 'Error sending nudge' });
  }
});

module.exports = router;
