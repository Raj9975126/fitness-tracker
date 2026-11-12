/* global require, module */
const express = require('express');
const { getSummary } = require('../controllers/analytics.controller');

const analyticsRouter = express.Router();

analyticsRouter.get('/summary', getSummary);

module.exports = analyticsRouter;
