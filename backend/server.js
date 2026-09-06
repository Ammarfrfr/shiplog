require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint (for Render ping & status checks)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Shiplog API',
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Shiplog Backend API',
    status: 'Running',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      team: '/api/team',
      entries: '/api/entries',
      cheers: '/api/cheers',
      stats: '/api/stats',
      milestones: '/api/milestones',
      dsa: '/api/dsa',
      github: '/api/github',
      nudge: '/api/nudge',
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/team', require('./routes/team'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/cheers', require('./routes/cheers'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/dsa', require('./routes/dsa'));
app.use('/api/github', require('./routes/github'));
app.use('/api/auth/github', require('./routes/github'));
app.use('/api/nudge', require('./routes/nudge'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Shiplog API running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
});
