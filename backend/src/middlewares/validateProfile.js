const { Gender, FitnessGoal, ActivityLevel } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');

// Numeric profile fields with sane human limits (metric units).
const NUMERIC_FIELDS = {
    heightCm: { min: 50, max: 272 },
    weightKg: { min: 20, max: 400 },
    targetWeightKg: { min: 20, max: 400 },
};

const ENUM_FIELDS = {
    gender: Gender,
    goal: FitnessGoal,
    activityLevel: ActivityLevel,
};

/**
 * Validates PUT /users/profile. Every field is optional (partial update);
 * sending `null` clears a profile field. Only whitelisted fields pass through.
 */
const validateUpdateProfile = asyncHandler(async (req, _res, next) => {
    const body = req.body || {};
    const user = {};
    const profile = {};

    if (body.name !== undefined) {
        if (typeof body.name !== 'string' || body.name.trim() === '') {
            throw new AppError('Name must be a non-empty string', 400);
        }
        if (body.name.trim().length > 60) {
            throw new AppError('Name must not exceed 60 characters', 400);
        }
        user.name = body.name.trim();
    }

    for (const [field, { min, max }] of Object.entries(NUMERIC_FIELDS)) {
        const value = body[field];
        if (value === undefined) continue;
        if (value === null) {
            profile[field] = null;
            continue;
        }
        if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
            throw new AppError(`${field} must be a number between ${min} and ${max}`, 400);
        }
        profile[field] = value;
    }

    for (const [field, enumObj] of Object.entries(ENUM_FIELDS)) {
        const value = body[field];
        if (value === undefined) continue;
        if (value !== null && !Object.values(enumObj).includes(value)) {
            throw new AppError(`${field} must be one of: ${Object.values(enumObj).join(', ')}`, 400);
        }
        profile[field] = value;
    }

    if (body.dateOfBirth !== undefined) {
        if (body.dateOfBirth === null) {
            profile.dateOfBirth = null;
        } else {
            const dob = new Date(body.dateOfBirth);
            if (typeof body.dateOfBirth !== 'string' || Number.isNaN(dob.getTime()) || dob > new Date()) {
                throw new AppError('dateOfBirth must be a valid past date (YYYY-MM-DD)', 400);
            }
            profile.dateOfBirth = dob;
        }
    }

    if (body.avatarUrl !== undefined) {
        if (body.avatarUrl !== null && (typeof body.avatarUrl !== 'string' || !/^https?:\/\//.test(body.avatarUrl))) {
            throw new AppError('avatarUrl must be an http(s) URL', 400);
        }
        profile.avatarUrl = body.avatarUrl;
    }

    if (Object.keys(user).length === 0 && Object.keys(profile).length === 0) {
        throw new AppError('No valid profile fields provided', 400);
    }

    req.body = { user, profile };
    return next();
});

module.exports = { validateUpdateProfile };
