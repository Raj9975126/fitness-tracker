const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validateAuth');
const { authenticate } = require('../middlewares/auth.middleware');

const authRouter = express.Router();

authRouter.post('/register', validateRegister, register);
authRouter.post('/login', validateLogin, login);
authRouter.get('/me', authenticate, getMe);

module.exports = authRouter;
