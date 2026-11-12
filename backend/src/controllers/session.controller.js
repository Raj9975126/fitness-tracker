const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/error');
const {
    findRoutineWithExercisesById,
    createWorkoutSession,
    getSessionsByUserId,
    getSessionById,
    updateWorkoutSession,
    findExistingExerciseIds,
    getSetLogsBySessionId,
    batchSaveSetLogs,
    findSetLogInSession,
    updateSingleSetLog,
    deleteSingleSetLog,
} = require('../repository/session.repository');

const getParamString = (value) => (Array.isArray(value) ? value[0] : value);

const ensureSessionExists = async (req, sessionId) => {
    if (!sessionId) {
        throw new AppError('Session ID is required', 400);
    }

    const session = await getSessionById(sessionId);
    if (!session) {
        throw new AppError('Workout session not found', 404);
    }

    const callerUserId = req.user?.id || req.headers['x-user-id'];
    if (callerUserId && String(session.userId) !== String(callerUserId)) {
        throw new AppError('You are not authorized to access this workout session', 403);
    }

    return session;
};

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

const getSessionSets = asyncHandler(async (req, res) => {
    const sessionId = getParamString(req.params.id);
    const session = await ensureSessionExists(req, sessionId);
    const setLogs = await getSetLogsBySessionId(sessionId);

    return res.status(200).json({
        success: true,
        message: 'Session sets fetched successfully',
        data: {
            sessionId,
            totalVolumeKg: session.totalVolumeKg,
            setLogs,
        },
    });
});

const saveSessionSets = asyncHandler(async (req, res) => {
    const sessionId = getParamString(req.params.id);
    const session = await ensureSessionExists(req, sessionId);

    if (session.status === 'CANCELLED') {
        throw new AppError('Cannot log sets for a cancelled workout session', 400);
    }

    const { sets, replace } = req.body;
    const exerciseIds = sets.map((item) => item.exerciseId).filter(Boolean);

    if (exerciseIds.length > 0) {
        const existingIds = await findExistingExerciseIds(exerciseIds);
        const existingSet = new Set(existingIds);
        const missingIds = [...new Set(exerciseIds.filter((id) => !existingSet.has(id)))];

        if (missingIds.length > 0) {
            throw new AppError(`Invalid exerciseId(s): ${missingIds.join(', ')}`, 400);
        }
    }

    const result = await batchSaveSetLogs(sessionId, sets, { replace });

    return res.status(req.method === 'POST' ? 201 : 200).json({
        success: true,
        message: 'Session sets saved successfully',
        data: result,
    });
});

const updateSessionSet = asyncHandler(async (req, res) => {
    const sessionId = getParamString(req.params.id);
    const setId = getParamString(req.params.setId);

    const session = await ensureSessionExists(req, sessionId);
    if (session.status === 'CANCELLED') {
        throw new AppError('Cannot update sets for a cancelled workout session', 400);
    }

    if (!setId) {
        throw new AppError('Set ID is required', 400);
    }

    const existingSet = await findSetLogInSession(sessionId, setId);
    if (!existingSet) {
        throw new AppError('SetLog not found in this workout session', 404);
    }

    const result = await updateSingleSetLog(sessionId, setId, req.body);

    return res.status(200).json({
        success: true,
        message: 'Set updated successfully',
        data: result,
    });
});

const deleteSessionSet = asyncHandler(async (req, res) => {
    const sessionId = getParamString(req.params.id);
    const setId = getParamString(req.params.setId);

    const session = await ensureSessionExists(req, sessionId);
    if (session.status === 'CANCELLED') {
        throw new AppError('Cannot delete sets from a cancelled workout session', 400);
    }

    if (!setId) {
        throw new AppError('Set ID is required', 400);
    }

    const existingSet = await findSetLogInSession(sessionId, setId);
    if (!existingSet) {
        throw new AppError('SetLog not found in this workout session', 404);
    }

    const result = await deleteSingleSetLog(sessionId, setId);

    return res.status(200).json({
        success: true,
        message: 'Set deleted successfully',
        data: result,
    });
});

module.exports = {
    startSession,
    getMySessions,
    getSession,
    updateSessionDetails,
    getSessionSets,
    saveSessionSets,
    updateSessionSet,
    deleteSessionSet,
};

