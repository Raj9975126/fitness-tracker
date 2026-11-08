const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FitTrack API is running' });
});

// Route handlers will be mounted here
// e.g., app.use('/api/auth', authRoutes);

module.exports = app;

