const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Entry = require('../models/Entry');
const DsaProblem = require('../models/DsaProblem');
const DsaProgress = require('../models/DsaProgress');
const auth = require('../middleware/auth');

// GET /api/github/auth-url
// Returns the GitHub OAuth URL to initiate login/linking
router.get('/auth-url', auth, (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId === 'your_github_client_id_here') {
    return res.status(400).json({
      message: 'GitHub OAuth Client ID is not configured in backend .env'
    });
  }

  // Pass userId in state so we know who to link upon callback
  const state = req.user._id.toString();
  const scope = 'read:user repo';

  // Build authorize URL
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.json({
    authUrl,
    callbackUrls: [
      `http://localhost:5001/api/github/callback`,
      `http://localhost:5001/api/auth/github/callback`,
    ]
  });
});

// Handler for GitHub OAuth redirect
const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).send('Missing authorization code from GitHub');
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).send('GitHub credentials not configured in backend');
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).send(`Failed to obtain access token: ${JSON.stringify(tokenResponse.data)}`);
    }

    // Fetch GitHub user profile
    const userProfileRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Shiplog-App'
      }
    });

    const githubUsername = userProfileRes.data.login;

    // Link to User
    if (state) {
      const user = await User.findById(state);
      if (user) {
        user.githubUsername = githubUsername;
        user.githubAccessToken = accessToken;
        await user.save();
      }
    }

    // Redirect to mobile app via deep link
    const appScheme = process.env.CLIENT_APP_SCHEME || 'shiplog';
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GitHub Linked - Shiplog</title>
          <style>
            body { background: #0F1319; color: #EDEAE2; font-family: monospace; text-align: center; padding: 40px 20px; }
            .card { background: #171C24; border: 1px solid #262C36; padding: 24px; border-radius: 8px; max-width: 400px; margin: 0 auto; }
            .brass { color: #C9963C; font-weight: bold; }
            a.btn { display: inline-block; background: #C9963C; color: #0F1319; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>GitHub Linked!</h2>
            <p>Connected GitHub account: <span class="brass">@${githubUsername}</span></p>
            <p>You can now return to the Shiplog app.</p>
            <a class="btn" href="${appScheme}://github-auth-success?username=${githubUsername}">Open Shiplog</a>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = "${appScheme}://github-auth-success?username=${githubUsername}";
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err.response?.data || err.message);
    res.status(500).send('Error completing GitHub authentication');
  }
};

// POST /api/github/sync
// Directly fetches recent commits from GitHub API for the authenticated user and syncs them into Shiplog
router.post('/sync', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'User is not part of any team' });
    }

    if (!req.user.githubUsername) {
      return res.status(400).json({ message: 'No GitHub account linked. Tap Connect GitHub first.' });
    }

    const headers = {
      'User-Agent': 'Shiplog-App',
      Accept: 'application/vnd.github.v3+json',
    };
    if (req.user.githubAccessToken) {
      headers.Authorization = `Bearer ${req.user.githubAccessToken}`;
    }

    // Fetch user's recent push events
    const eventsRes = await axios.get(
      `https://api.github.com/users/${req.user.githubUsername}/events`,
      { headers }
    );

    const pushEvents = (eventsRes.data || []).filter(e => e.type === 'PushEvent');
    const allProblems = await DsaProblem.find({ sheetSource: 'striver_a2z' });

    let newEntriesCount = 0;
    let autoTickedCount = 0;

    for (const event of pushEvents.slice(0, 10)) {
      const repoName = event.repo?.name || 'repo';
      let commits = event.payload?.commits || [];

      // If commits array is empty in event payload, fallback to head SHA
      if (commits.length === 0 && event.payload?.head) {
        try {
          const commitDetailRes = await axios.get(
            `https://api.github.com/repos/${repoName}/commits/${event.payload.head}`,
            { headers }
          );
          commits = [{
            sha: event.payload.head,
            message: commitDetailRes.data.commit?.message || `Push to ${repoName}`,
          }];
        } catch (commitErr) {
          commits = [{
            sha: event.payload.head,
            message: `Push to ${repoName}`,
          }];
        }
      }

      for (const commit of commits) {
        const commitHash = commit.sha?.substring(0, 7) || 'commit';
        const msg = (commit.message || '').trim();
        const firstLine = msg.split('\n')[0] || `Commit to ${repoName}`;

        // Check if already logged
        const existing = await Entry.findOne({
          userId: req.user._id,
          commitHash,
        });

        if (!existing) {
          // Parse tag
          let tag = 'feature';
          if (/^fix(\(.*\))?:/i.test(firstLine)) tag = 'fix';
          else if (/^(feat|feature)(\(.*\))?:/i.test(firstLine)) tag = 'feature';
          else if (/^(design|style|ui)(\(.*\))?:/i.test(firstLine)) tag = 'design';
          else if (/^(docs|chore|refactor|test)(\(.*\))?:/i.test(firstLine)) tag = 'research';
          else if (/^blocker:/i.test(firstLine)) tag = 'blocker';

          const entry = new Entry({
            teamId: req.user.teamId,
            userId: req.user._id,
            text: `[${repoName.split('/')[1] || repoName}] ${firstLine}`,
            tag,
            source: 'github_commit',
            commitHash,
            commitUrl: `https://github.com/${repoName}/commit/${commit.sha}`,
            createdAt: event.created_at ? new Date(event.created_at) : new Date(),
          });

          await entry.save();
          newEntriesCount++;

          // Match DSA problem
          const searchSpace = msg.toLowerCase();
          for (const prob of allProblems) {
            const slugClean = prob.slug.toLowerCase().replace(/-/g, ' ');
            if (searchSpace.includes(prob.slug.toLowerCase()) || searchSpace.includes(slugClean)) {
              await DsaProgress.findOneAndUpdate(
                { userId: req.user._id, problemId: prob._id },
                {
                  userId: req.user._id,
                  problemId: prob._id,
                  status: 'done',
                  completedVia: 'commit_match',
                  completedAt: new Date(),
                },
                { upsert: true }
              );
              autoTickedCount++;
            }
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Synced ${newEntriesCount} new commits from @${req.user.githubUsername}!`,
      newEntriesCount,
      autoTickedCount,
    });
  } catch (err) {
    console.error('GitHub sync error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to sync GitHub commits. Ensure your GitHub account is linked.',
    });
  }
});

router.get('/callback', handleCallback);
router.get('/github/callback', handleCallback);

// POST /api/github/webhook
// Receives GitHub webhook push events, auto-creates feed entries, auto-ticks DSA problems
router.post('/webhook', async (req, res) => {
  try {
    const event = req.header('x-github-event');
    if (event !== 'push') {
      return res.status(200).json({ message: 'Ignoring non-push event' });
    }

    const payload = req.body;
    const pusher = payload.sender?.login || payload.pusher?.name;
    const commits = payload.commits || [];

    if (!commits.length || !pusher) {
      return res.status(200).json({ message: 'No commits in payload' });
    }

    // Find the user with this githubUsername
    const user = await User.findOne({
      githubUsername: { $regex: new RegExp(`^${pusher}$`, 'i') }
    });

    if (!user || !user.teamId) {
      console.log(`Pusher @${pusher} not found or has no active team in Shiplog`);
      return res.status(200).json({ message: 'User not mapped in Shiplog' });
    }

    // Fetch all DSA problem slugs to check for matches
    const allProblems = await DsaProblem.find({ sheetSource: 'striver_a2z' });

    for (const commit of commits) {
      const msg = commit.message.trim();
      const firstLine = msg.split('\n')[0];

      // Parse tag from prefix (e.g., "fix: ...", "feat: ...", "style: ...")
      let tag = 'feature';
      if (/^fix(\(.*\))?:/i.test(firstLine)) tag = 'fix';
      else if (/^(feat|feature)(\(.*\))?:/i.test(firstLine)) tag = 'feature';
      else if (/^(design|style|ui)(\(.*\))?:/i.test(firstLine)) tag = 'design';
      else if (/^(docs|chore|refactor|test)(\(.*\))?:/i.test(firstLine)) tag = 'research';
      else if (/^blocker:/i.test(firstLine)) tag = 'blocker';

      // Create Entry
      const entry = new Entry({
        teamId: user.teamId,
        userId: user._id,
        text: firstLine,
        tag,
        source: 'github_commit',
        commitHash: commit.id?.substring(0, 7),
        commitUrl: commit.url,
      });
      await entry.save();

      // Check if commit message or modified files match any DSA problem slug/title
      const searchSpace = (msg + ' ' + (commit.modified || []).join(' ')).toLowerCase();

      for (const prob of allProblems) {
        const slugClean = prob.slug.toLowerCase().replace(/-/g, ' ');
        const isMatched = searchSpace.includes(prob.slug.toLowerCase()) || searchSpace.includes(slugClean);

        if (isMatched) {
          // Auto-mark DSA progress as done via commit_match
          await DsaProgress.findOneAndUpdate(
            { userId: user._id, problemId: prob._id },
            {
              userId: user._id,
              problemId: prob._id,
              status: 'done',
              completedVia: 'commit_match',
              completedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          console.log(`Auto-ticked DSA problem [${prob.title}] for @${user.name} via commit match!`);
        }
      }
    }

    res.json({ success: true, processedCommits: commits.length });
  } catch (err) {
    console.error('GitHub webhook error:', err);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

module.exports = router;
