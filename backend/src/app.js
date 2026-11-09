const express = require('express');
const cors = require('cors');

const routineRouter = require('./routes/routine.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FitTrack API is running' });
});

app.use('/api/v1/routines', routineRouter);
app.use('/api/routines', routineRouter);
app.use('/routines', routineRouter);

module.exports = app;
