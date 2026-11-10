const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = asyncHandler(async (req, _res, next) => {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new AppError('Name is required', 400);
    }
    if (name.trim().length > 60) {
        throw new AppError('Name must not exceed 60 characters', 400);
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        throw new AppError('A valid email is required', 400);
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
    }

    req.body = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
    };

    return next();
});

const validateLogin = asyncHandler(async (req, _res, next) => {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || email.trim() === '') {
        throw new AppError('Email is required', 400);
    }
    if (!password || typeof password !== 'string') {
        throw new AppError('Password is required', 400);
    }

    req.body = { email: email.trim().toLowerCase(), password };
    return next();
});

module.exports = { validateRegister, validateLogin };
