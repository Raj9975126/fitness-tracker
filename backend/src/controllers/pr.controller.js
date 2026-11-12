/* global require, module */
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const { getUserPRs, getPRsByExercise } = require('../repository/pr.repository');

const getUserId = (req) => {
  const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId;
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new AppError('User authentication required or x-user-id header missing', 401);
  }
  return userId.trim();
};

/**
 * GET /api/prs
 * Fetches all personal records for the user.
 */
const getAllPRs = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const records = await getUserPRs(userId);

  // Group records by exercise for cleaner frontend consumption
  const groupedByExercise = {};
  for (const record of records) {
    const exId = record.exerciseId;
    if (!groupedByExercise[exId]) {
      groupedByExercise[exId] = {
        exercise: record.exercise,
        records: {},
      };
    }
    groupedByExercise[exId].records[record.recordType] = {
      id: record.id,
      value: record.value,
      weight: record.weight,
      reps: record.reps,
      achievedAt: record.achievedAt,
    };
  }

  return res.status(200).json({
    success: true,
    message: 'Personal records fetched successfully',
    data: {
      total: records.length,
      records,
      grouped: Object.values(groupedByExercise),
    },
  });
});

/**
 * GET /api/prs/exercise/:exerciseId (or /api/prs/:exerciseId)
 * Fetches personal records for a specific exercise.
 */
const getExercisePRs = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const exerciseId = req.params.exerciseId || req.params.id;

  if (!exerciseId || typeof exerciseId !== 'string') {
    throw new AppError('Exercise ID is required', 400);
  }

  const records = await getPRsByExercise(userId, exerciseId.trim());

  return res.status(200).json({
    success: true,
    message: 'Exercise personal records fetched successfully',
    data: {
      exerciseId: exerciseId.trim(),
      total: records.length,
      records,
    },
  });
});

module.exports = {
  getAllPRs,
  getExercisePRs,
};
