const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');

const validateCreateRoutine = asyncHandler(async (req, _res, next) => {
    const { userId, name, description, isPublic, exercises } = req.body;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new AppError('userId is required', 400);
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new AppError('Routine name is required and must be a string', 400);
    }

    if (name.trim().length > 100) {
        throw new AppError('Routine name must not exceed 100 characters', 400);
    }

    if (description !== undefined && typeof description !== 'string') {
        throw new AppError('Description must be a string', 400);
    }

    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
        throw new AppError('isPublic must be a boolean', 400);
    }

    if (exercises !== undefined) {
        if (!Array.isArray(exercises)) {
            throw new AppError('Exercises must be an array of exercise objects', 400);
        }

        for (let i = 0; i < exercises.length; i++) {
            const item = exercises[i];
            if (!item.exerciseId || typeof item.exerciseId !== 'string') {
                throw new AppError(`Exercise at index ${i} must contain a valid exerciseId`, 400);
            }
            if (item.targetSets !== undefined && (typeof item.targetSets !== 'number' || item.targetSets <= 0)) {
                throw new AppError(`targetSets at index ${i} must be a positive integer`, 400);
            }
            if (item.restSeconds !== undefined && (typeof item.restSeconds !== 'number' || item.restSeconds < 0)) {
                throw new AppError(`restSeconds at index ${i} must be a non-negative integer`, 400);
            }
        }
    }

    req.body = {
        userId: userId.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
        exercises: exercises || [],
    };

    return next();
});

const validateUpdateRoutine = asyncHandler(async (req, _res, next) => {
    const { name, description, isPublic } = req.body;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new AppError('Routine name must be a non-empty string', 400);
        }
        if (name.trim().length > 100) {
            throw new AppError('Routine name must not exceed 100 characters', 400);
        }
        req.body.name = name.trim();
    }

    if (description !== undefined) {
        req.body.description = typeof description === 'string' ? description.trim() : null;
    }

    if (isPublic !== undefined) {
        if (typeof isPublic !== 'boolean') {
            throw new AppError('isPublic must be a boolean', 400);
        }
    }

    return next();
});

const validateAddExercise = asyncHandler(async (req, _res, next) => {
    const { exerciseId, orderIndex, targetSets, targetReps, restSeconds, notes } = req.body;

    if (!exerciseId || typeof exerciseId !== 'string' || exerciseId.trim() === '') {
        throw new AppError('exerciseId is required and must be a valid string', 400);
    }

    if (orderIndex !== undefined && (typeof orderIndex !== 'number' || orderIndex < 0)) {
        throw new AppError('orderIndex must be a non-negative integer', 400);
    }

    if (targetSets !== undefined && (typeof targetSets !== 'number' || targetSets <= 0)) {
        throw new AppError('targetSets must be a positive integer', 400);
    }

    if (targetReps !== undefined && typeof targetReps !== 'string') {
        throw new AppError("targetReps must be a string (e.g. '8-12')", 400);
    }

    if (restSeconds !== undefined && (typeof restSeconds !== 'number' || restSeconds < 0)) {
        throw new AppError('restSeconds must be a non-negative integer', 400);
    }

    if (notes !== undefined && typeof notes !== 'string') {
        throw new AppError('notes must be a string', 400);
    }

    req.body = {
        exerciseId: exerciseId.trim(),
        orderIndex: orderIndex !== undefined ? Math.floor(orderIndex) : undefined,
        targetSets: targetSets !== undefined ? Math.floor(targetSets) : 3,
        targetReps: targetReps ? targetReps.trim() : '8-12',
        restSeconds: restSeconds !== undefined ? Math.floor(restSeconds) : 90,
        notes: notes ? notes.trim() : null,
    };

    return next();
});

const validateUpdateRoutineExercise = asyncHandler(async (req, _res, next) => {
    const { orderIndex, targetSets, targetReps, restSeconds, notes } = req.body;

    if (orderIndex !== undefined && (typeof orderIndex !== 'number' || orderIndex < 0)) {
        throw new AppError('orderIndex must be a non-negative integer', 400);
    }

    if (targetSets !== undefined && (typeof targetSets !== 'number' || targetSets <= 0)) {
        throw new AppError('targetSets must be a positive integer', 400);
    }

    if (targetReps !== undefined && typeof targetReps !== 'string') {
        throw new AppError('targetReps must be a string', 400);
    }

    if (restSeconds !== undefined && (typeof restSeconds !== 'number' || restSeconds < 0)) {
        throw new AppError('restSeconds must be a non-negative integer', 400);
    }

    if (notes !== undefined && typeof notes !== 'string') {
        throw new AppError('notes must be a string', 400);
    }

    return next();
});

module.exports = {
    validateCreateRoutine,
    validateUpdateRoutine,
    validateAddExercise,
    validateUpdateRoutineExercise,
};

