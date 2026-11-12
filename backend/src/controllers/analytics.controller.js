/* global require, module */
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const { getAnalyticsSummary } = require('../repository/analytics.repository');

const getUserId = (req) => {
  const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId;
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new AppError('User authentication required or x-user-id header missing', 401);
  }
  return userId.trim();
};

/**
 * GET /api/analytics/summary
 * Returns overall user workout summary and weekly volume statistics.
 */
const getSummary = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const summary = await getAnalyticsSummary(userId);

  return res.status(200).json({
    success: true,
    message: 'Analytics summary fetched successfully',
    data: summary,
  });
});

module.exports = {
  getSummary,
};
