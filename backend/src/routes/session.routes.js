const express = require('express');
const {
    startSession,
    getMySessions,
    getSession,
    updateSessionDetails,
} = require('../controllers/session.controller');
const {
    validateStartSession,
    validateUpdateSession,
} = require('../middlewares/validateBody');

const sessionRouter = express.Router();

sessionRouter.post('/', validateStartSession, startSession);
sessionRouter.get('/', getMySessions);
sessionRouter.get('/:id', getSession);
sessionRouter.patch('/:id', validateUpdateSession, updateSessionDetails);

module.exports = sessionRouter;

