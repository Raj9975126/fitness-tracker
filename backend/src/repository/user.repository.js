const prisma = require('../prisma');

// Never return passwordHash to clients.
const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    lastLoginAt: true,
    createdAt: true,
};

const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });

const findUserById = (id) =>
    prisma.user.findUnique({ where: { id }, select: { ...publicUserSelect, profile: true } });

const createUser = ({ name, email, passwordHash }) =>
    prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            profile: { create: {} },
        },
        select: publicUserSelect,
    });

const touchLastLogin = (id) =>
    prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
        select: publicUserSelect,
    });

/**
 * Updates the user's name and/or profile fields in one transaction.
 * Upserts the profile in case an older account has none yet.
 */
const updateUserProfile = (id, { user, profile }) =>
    prisma.user.update({
        where: { id },
        data: {
            ...user,
            ...(Object.keys(profile).length > 0 && {
                profile: { upsert: { create: profile, update: profile } },
            }),
        },
        select: { ...publicUserSelect, profile: true },
    });

module.exports = { findUserByEmail, findUserById, createUser, touchLastLogin, updateUserProfile };
