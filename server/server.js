const express = require('express');
const cors = require('cors');
const path = require('path');
const { validateScoreSubmission } = require('./validator');
const leaderboardStore = require('./leaderboardStore');

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory rate limiting map (IP -> last timestamp)
const rateLimitMap = new Map();

app.use(cors());
app.use(express.json());

// Serve static frontend build files when deployed
app.use(express.static(path.join(__dirname, '../dist')));

// 1. Get Top Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const topScores = leaderboardStore.getTopScores();
  res.json(topScores);
});

// 2. Submit Score with Anti-Cheat Validation
app.post('/api/leaderboard/submit', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';

  // Rate Limiting: Max 1 submission per 2 seconds per IP
  const now = Date.now();
  if (rateLimitMap.has(clientIp)) {
    const lastTime = rateLimitMap.get(clientIp);
    if (now - lastTime < 2000) {
      return res.status(429).json({ error: 'Too many submissions. Please wait a moment.' });
    }
  }
  rateLimitMap.set(clientIp, now);

  const validation = validateScoreSubmission(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  const { score, distance, regularModaks, jumboModaks } = req.body;
  const result = leaderboardStore.submitScore({
    name: validation.cleanName,
    score,
    distance,
    regularModaks,
    jumboModaks
  });

  res.json({
    success: true,
    message: 'Score successfully validated and added to the official leaderboard!',
    rank: result.rank
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Mushak's Modak Dash server running at http://localhost:${PORT}`);
});
