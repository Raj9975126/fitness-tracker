const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const { findUserById, updateUserProfile } = require('../repository/user.repository');

const DECIMAL_FIELDS = ['heightCm', 'weightKg', 'targetWeightKg'];

// Prisma returns Decimal columns as strings in JSON; send plain numbers to the app.
const formatUser = (user) => {
    if (!user.profile) return user;
    const profile = { ...user.profile };
    for (const field of DECIMAL_FIELDS) {
        profile[field] = profile[field] === null ? null : Number(profile[field]);
    }
    return { ...user, profile };
};

const getProfile = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    return res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: formatUser(user),
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const existing = await findUserById(req.user.id);
    if (!existing) {
        throw new AppError('User not found', 404);
    }

    const user = await updateUserProfile(req.user.id, req.body);

    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: formatUser(user),
    });
});

module.exports = { getProfile, updateProfile };
