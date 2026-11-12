const prisma = require('../prisma');

/**
 * Calculates Estimated 1-Rep Max using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 * For 1 rep, 1RM equals the weight lifted.
 *
 * @param {number} weight
 * @param {number} reps
 * @returns {number}
 */
const calculate1RM = (weight, reps) => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const estimated = weight * (1 + reps / 30);
  return Math.round(estimated * 100) / 100;
};

/**
 * Detects and records any Personal Records (PRs) achieved by a completed set.
 * Checks for:
 * 1. MAX_WEIGHT: Heaviest weight lifted.
 * 2. MAX_VOLUME: Highest single-set volume (Weight * Reps).
 * 3. MAX_REPS: Highest repetitions performed.
 * 4. ESTIMATED_1RM: Highest calculated one-rep max.
 *
 * @param {object} params
 * @param {string} params.userId - User who performed the set
 * @param {string} params.exerciseId - Exercise performed
 * @param {string} [params.setLogId] - ID of the SetLog that achieved the PR
 * @param {number} params.weight - Weight lifted in kg/lbs
 * @param {number} params.reps - Reps performed
 * @param {object} [params.tx] - Optional Prisma transaction client
 * @returns {Promise<Array<object>>} - List of newly achieved PRs
 */
const detectAndSavePRs = async ({ userId, exerciseId, setLogId, weight, reps, tx }) => {
  const db = tx || prisma;

  if (!userId || !exerciseId) return [];
  if (weight <= 0 && reps <= 0) return [];

  // Metrics for this set
  const candidates = [
    {
      recordType: 'MAX_WEIGHT',
      value: weight,
      weight,
      reps,
    },
    {
      recordType: 'MAX_VOLUME',
      value: Math.round(weight * reps * 100) / 100,
      weight,
      reps,
    },
    {
      recordType: 'MAX_REPS',
      value: reps,
      weight,
      reps,
    },
    {
      recordType: 'ESTIMATED_1RM',
      value: calculate1RM(weight, reps),
      weight,
      reps,
    },
  ];

  // Fetch all existing PRs for this user and exercise
  const existingPRs = await db.personalRecord.findMany({
    where: {
      userId,
      exerciseId,
    },
  });

  const existingMap = new Map();
  for (const pr of existingPRs) {
    existingMap.set(pr.recordType, pr);
  }

  const newPRsAchieved = [];

  for (const candidate of candidates) {
    if (candidate.value <= 0) continue;

    const existing = existingMap.get(candidate.recordType);

    // Is it a new record? (beats previous value, or first time recorded)
    const isNewRecord = !existing || candidate.value > existing.value;

    if (isNewRecord) {
      const oldValue = existing ? existing.value : null;

      let savedRecord;
      if (existing) {
        // Update existing record with the new higher value
        savedRecord = await db.personalRecord.update({
          where: { id: existing.id },
          data: {
            value: candidate.value,
            weight: candidate.weight,
            reps: candidate.reps,
            setLogId: setLogId || null,
            achievedAt: new Date(),
          },
          include: {
            exercise: {
              select: { id: true, name: true, primaryMuscle: true },
            },
          },
        });
      } else {
        // Create new record
        savedRecord = await db.personalRecord.create({
          data: {
            userId,
            exerciseId,
            setLogId: setLogId || null,
            recordType: candidate.recordType,
            value: candidate.value,
            weight: candidate.weight,
            reps: candidate.reps,
            achievedAt: new Date(),
          },
          include: {
            exercise: {
              select: { id: true, name: true, primaryMuscle: true },
            },
          },
        });
      }

      newPRsAchieved.push({
        recordType: candidate.recordType,
        value: candidate.value,
        weight: candidate.weight,
        reps: candidate.reps,
        previousValue: oldValue,
        improvement: oldValue ? Math.round((candidate.value - oldValue) * 100) / 100 : candidate.value,
        exerciseId,
        exerciseName: savedRecord.exercise?.name,
        setLogId,
        achievedAt: savedRecord.achievedAt,
      });
    }
  }

  return newPRsAchieved;
};

/**
 * Processes a batch of logged sets for a workout session and returns all new PRs.
 *
 * @param {object} params
 * @param {string} params.userId - Owner of the workout
 * @param {Array<object>} params.sets - Array of logged sets { exerciseId, weight, reps, id, isCompleted }
 * @param {object} [params.tx] - Optional Prisma transaction client
 * @returns {Promise<Array<object>>} - Aggregated list of all PRs broken in this session
 */
const processSessionPRs = async ({ userId, sets, tx }) => {
  if (!userId || !Array.isArray(sets) || sets.length === 0) {
    return [];
  }

  const allDetectedPRs = [];

  for (const set of sets) {
    // Only completed sets can count as personal records
    if (set.isCompleted === false) continue;

    const prs = await detectAndSavePRs({
      userId,
      exerciseId: set.exerciseId,
      setLogId: set.id || set.setLogId,
      weight: Number(set.weight) || 0,
      reps: Number(set.reps) || 0,
      tx,
    });

    if (prs.length > 0) {
      allDetectedPRs.push(...prs);
    }
  }

  return allDetectedPRs;
};

module.exports = {
  calculate1RM,
  detectAndSavePRs,
  processSessionPRs,
};
