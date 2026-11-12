const express = require('express');
const {
    startSession,
    getMySessions,
    getSession,
    updateSessionDetails,
    getSessionSets,
    saveSessionSets,
    updateSessionSet,
    deleteSessionSet,
} = require('../controllers/session.controller');
const {
    validateStartSession,
    validateUpdateSession,
    validateBatchSets,
    validateUpdateSet,
} = require('../middlewares/validateBody');

const sessionRouter = express.Router();

sessionRouter.post('/', validateStartSession, startSession);
sessionRouter.get('/', getMySessions);
sessionRouter.get('/:id', getSession);
sessionRouter.patch('/:id', validateUpdateSession, updateSessionDetails);

sessionRouter.get('/:id/sets', getSessionSets);
sessionRouter.post('/:id/sets', validateBatchSets, saveSessionSets);
sessionRouter.put('/:id/sets', validateBatchSets, saveSessionSets);
sessionRouter.patch('/:id/sets/:setId', validateUpdateSet, updateSessionSet);
sessionRouter.delete('/:id/sets/:setId', deleteSessionSet);

module.exports = sessionRouter;

