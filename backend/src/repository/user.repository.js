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

module.exports = { findUserByEmail, findUserById, createUser, touchLastLogin };
