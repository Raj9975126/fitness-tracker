/* global require, module */
const prisma = require('../prisma');

/**
 * Returns the Date object representing the start of the current week (Monday at 00:00:00.000).
 *
 * @returns {Date}
 */
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Computes analytics summary for a user:
 * - Total workouts (all time & this week)
 * - Total volume lifted (all time & this week)
 * - Total personal records achieved
 * - Active workout streak
 * - Recent workout sessions
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getAnalyticsSummary = async (userId) => {
  const startOfWeek = getStartOfWeek();

  // 1. Total completed workouts all-time
  const totalWorkoutsAllTime = await prisma.workoutSession.count({
    where: {
      userId,
      status: 'COMPLETED',
    },
  });

  // 2. Completed workouts this week
  const totalWorkoutsThisWeek = await prisma.workoutSession.count({
    where: {
      userId,
      status: 'COMPLETED',
      startTime: {
        gte: startOfWeek,
      },
    },
  });

  // 3. Volume aggregations
  const volumeAllTimeAgg = await prisma.workoutSession.aggregate({
    where: {
      userId,
      status: 'COMPLETED',
    },
    _sum: {
      totalVolumeKg: true,
    },
  });

  const volumeThisWeekAgg = await prisma.workoutSession.aggregate({
    where: {
      userId,
      status: 'COMPLETED',
      startTime: {
        gte: startOfWeek,
      },
    },
    _sum: {
      totalVolumeKg: true,
    },
  });

  // 4. Personal records count
  const totalPRs = await prisma.personalRecord.count({
    where: {
      userId,
    },
  });

  // 5. Recent 5 workouts
  const recentWorkouts = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 5,
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      totalVolumeKg: true,
      routine: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          setLogs: true,
        },
      },
    },
  });

  // 6. Calculate workout streak (consecutive days with completed workouts)
  const pastSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    select: {
      startTime: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 60,
  });

  let currentStreakDays = 0;
  if (pastSessions.length > 0) {
    const workoutDaysSet = new Set(
      pastSessions.map((s) => new Date(s.startTime).toISOString().slice(0, 10))
    );

    const checkDate = new Date();
    // Check if user worked out today or yesterday (to keep streak alive)
    const todayStr = checkDate.toISOString().slice(0, 10);
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().slice(0, 10);

    let streakDate = new Date();
    if (workoutDaysSet.has(todayStr)) {
      streakDate = new Date();
    } else if (workoutDaysSet.has(yesterdayStr)) {
      streakDate.setDate(streakDate.getDate() - 1);
    } else {
      streakDate = null;
    }

    if (streakDate) {
      while (workoutDaysSet.has(streakDate.toISOString().slice(0, 10))) {
        currentStreakDays++;
        streakDate.setDate(streakDate.getDate() - 1);
      }
    }
  }

  const totalVolumeThisWeek = Math.round((volumeThisWeekAgg._sum.totalVolumeKg || 0) * 100) / 100;
  const totalVolumeAllTime = Math.round((volumeAllTimeAgg._sum.totalVolumeKg || 0) * 100) / 100;

  return {
    totalWorkouts: totalWorkoutsAllTime,
    workoutsThisWeek: totalWorkoutsThisWeek,
    totalVolumeKg: totalVolumeAllTime,
    volumeThisWeekKg: totalVolumeThisWeek,
    totalPRs,
    currentStreakDays,
    weekStartDate: startOfWeek.toISOString(),
    recentWorkouts,
  };
};

module.exports = {
  getStartOfWeek,
  getAnalyticsSummary,
};
