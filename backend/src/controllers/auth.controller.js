const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const { signToken } = require('../utils/jwt');
const {
    findUserByEmail,
    findUserById,
    createUser,
    touchLastLogin,
} = require('../repository/user.repository');

const SALT_ROUNDS = 10;

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
        throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ name, email, passwordHash });
    const token = signToken(user);

    return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user, token },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existing = await findUserByEmail(email);
    const isMatch = existing ? await bcrypt.compare(password, existing.passwordHash) : false;

    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    const user = await touchLastLogin(existing.id);
    const token = signToken(user);

    return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: { user, token },
    });
});

const getMe = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    return res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user,
    });
});

module.exports = { register, login, getMe };
