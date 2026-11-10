const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set in environment variables');
    }
    return secret;
};

const signToken = (user) =>
    jwt.sign({ sub: user.id, email: user.email, role: user.role }, getSecret(), {
        expiresIn: JWT_EXPIRES_IN,
    });

const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { signToken, verifyToken };
