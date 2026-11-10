const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth.routes');
const routineRouter = require('./routes/routine.routes');
const sessionRouter = require('./routes/session.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FitTrack API is running' });
});

app.use('/api/auth', authRouter);

app.use('/api/v1/routines', routineRouter);
app.use('/api/routines', routineRouter);
app.use('/routines', routineRouter);

app.use('/api/v1/sessions', sessionRouter);
app.use('/api/sessions', sessionRouter);
app.use('/sessions', sessionRouter);

module.exports = app;
