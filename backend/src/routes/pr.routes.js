/* global require, module */
const express = require('express');
const { getAllPRs, getExercisePRs } = require('../controllers/pr.controller');

const prRouter = express.Router();

prRouter.get('/', getAllPRs);
prRouter.get('/exercise/:exerciseId', getExercisePRs);
prRouter.get('/:exerciseId', getExercisePRs);

module.exports = prRouter;
