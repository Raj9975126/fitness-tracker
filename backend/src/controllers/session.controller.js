const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const {
    findRoutineWithExercisesById,
    createWorkoutSession,
    getSessionsByUserId,
    getSessionById,
    updateWorkoutSession,
} = require('../repository/session.repository');

const startSession = asyncHandler(async (req, res) => {
    const { userId, routineId, name, notes } = req.body;

    let sessionName = name || 'Freestyle Workout';

    if (routineId) {
        const routine = await findRoutineWithExercisesById(routineId);
        if (!routine) {
            throw new AppError('Workout routine not found', 404);
        }

        if (!routine.isPublic && String(routine.userId) !== String(userId)) {
            throw new AppError('You are not authorized to start a session from this routine', 403);
        }

        sessionName = name || routine.name;
    }

    const session = await createWorkoutSession({
        userId,
        routineId,
        name: sessionName,
        notes,
    });

    return res.status(201).json({
        success: true,
        message: 'Workout session started successfully',
        data: session,
    });
});

const getMySessions = asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new AppError('userId query parameter or x-user-id header is required', 400);
    }

    const status = req.query.status;
    const allowedStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status !== undefined && !allowedStatuses.includes(status)) {
        throw new AppError('status must be one of IN_PROGRESS, COMPLETED, or CANCELLED', 400);
    }

    const rawLimit = req.query.limit;
    let limit;
    if (rawLimit !== undefined) {
        limit = parseInt(rawLimit, 10);
        if (Number.isNaN(limit) || limit <= 0) {
            throw new AppError('limit must be a positive integer', 400);
        }
    }

    const sessions = await getSessionsByUserId(userId.trim(), { status, limit });

    return res.status(200).json({
        success: true,
        message: 'Workout sessions fetched successfully',
        data: sessions,
    });
});

const getSession = asyncHandler(async (req, res) => {
    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!sessionId) {
        throw new AppError('Session ID is required', 400);
    }

    const session = await getSessionById(sessionId);
    if (!session) {
        throw new AppError('Workout session not found', 404);
    }

    return res.status(200).json({
        success: true,
        message: 'Workout session fetched successfully',
        data: session,
    });
});

const updateSessionDetails = asyncHandler(async (req, res) => {
    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!sessionId) {
        throw new AppError('Session ID is required', 400);
    }

    const existingSession = await getSessionById(sessionId);
    if (!existingSession) {
        throw new AppError('Workout session not found', 404);
    }

    const updatedSession = await updateWorkoutSession(sessionId, req.body);

    return res.status(200).json({
        success: true,
        message: 'Workout session updated successfully',
        data: updatedSession,
    });
});

module.exports = {
    startSession,
    getMySessions,
    getSession,
    updateSessionDetails,
};

