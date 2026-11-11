const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { validateUpdateProfile } = require('../middlewares/validateProfile');
const { authenticate } = require('../middlewares/auth.middleware');

const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get('/profile', getProfile);
userRouter.put('/profile', validateUpdateProfile, updateProfile);

module.exports = userRouter;
