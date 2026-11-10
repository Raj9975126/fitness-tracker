const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const { verifyToken } = require('../utils/jwt');

/**
 * Protects a route: expects `Authorization: Bearer <token>`.
 * On success sets req.user = { id, email, role }.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new AppError('Authentication token missing', 401);
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
        throw new AppError(message, 401);
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
});

module.exports = { authenticate };
