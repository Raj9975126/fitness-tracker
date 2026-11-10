const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FitTrack API is running' });
});

// Route handlers
app.use('/api/auth', authRouter);

module.exports = app;

