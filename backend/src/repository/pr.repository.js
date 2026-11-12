/* global require, module */
const prisma = require('../prisma');

/**
 * Retrieves all personal records for a user with exercise details.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getUserPRs = async (userId) => {
  return await prisma.personalRecord.findMany({
    where: { userId },
    include: {
      exercise: {
        select: {
          id: true,
          name: true,
          category: true,
          primaryMuscle: true,
          equipment: true,
        },
      },
    },
    orderBy: [
      { exerciseId: 'asc' },
      { recordType: 'asc' },
    ],
  });
};

/**
 * Retrieves personal records for a specific exercise.
 *
 * @param {string} userId
 * @param {string} exerciseId
 * @returns {Promise<Array<object>>}
 */
const getPRsByExercise = async (userId, exerciseId) => {
  return await prisma.personalRecord.findMany({
    where: {
      userId,
      exerciseId,
    },
    include: {
      exercise: {
        select: {
          id: true,
          name: true,
          category: true,
          primaryMuscle: true,
          equipment: true,
        },
      },
      setLog: {
        select: {
          id: true,
          weight: true,
          reps: true,
          setNumber: true,
          workoutSessionId: true,
        },
      },
    },
    orderBy: {
      achievedAt: 'desc',
    },
  });
};

/**
 * Counts total PRs achieved by a user.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const countUserPRs = async (userId) => {
  return await prisma.personalRecord.count({
    where: { userId },
  });
};

module.exports = {
  getUserPRs,
  getPRsByExercise,
  countUserPRs,
};
