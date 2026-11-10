const prisma = require('../prisma');

const findRoutineWithExercisesById = async (routineId) => {
    return await prisma.workoutRoutine.findUnique({
        where: { id: routineId },
        include: {
            routineExercises: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    exercise: true,
                },
            },
        },
    });
};

const createWorkoutSession = async ({ userId, routineId, name, notes }) => {
    return await prisma.workoutSession.create({
        data: {
            userId,
            routineId: routineId || null,
            name,
            status: 'IN_PROGRESS',
            notes: notes || null,
        },
        include: {
            routine: {
                include: {
                    routineExercises: {
                        orderBy: { orderIndex: 'asc' },
                        include: {
                            exercise: true,
                        },
                    },
                },
            },
        },
    });
};

const getSessionsByUserId = async (userId, { status, limit } = {}) => {
    return await prisma.workoutSession.findMany({
        where: {
            userId,
            ...(status && { status }),
        },
        include: {
            routine: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            startTime: 'desc',
        },
        ...(limit && { take: limit }),
    });
};

const getSessionById = async (id) => {
    return await prisma.workoutSession.findUnique({
        where: { id },
        include: {
            routine: {
                include: {
                    routineExercises: {
                        orderBy: { orderIndex: 'asc' },
                        include: {
                            exercise: true,
                        },
                    },
                },
            },
        },
    });
};

const updateWorkoutSession = async (id, data) => {
    const shouldAutoSetEndTime =
        (data.status === 'COMPLETED' || data.status === 'CANCELLED') &&
        data.endTime === undefined;

    return await prisma.workoutSession.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.totalVolumeKg !== undefined && { totalVolumeKg: data.totalVolumeKg }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.endTime !== undefined
                ? { endTime: data.endTime ? new Date(data.endTime) : null }
                : shouldAutoSetEndTime
                    ? { endTime: new Date() }
                    : {}),
        },
        include: {
            routine: {
                include: {
                    routineExercises: {
                        orderBy: { orderIndex: 'asc' },
                        include: {
                            exercise: true,
                        },
                    },
                },
            },
        },
    });
};

module.exports = {
    findRoutineWithExercisesById,
    createWorkoutSession,
    getSessionsByUserId,
    getSessionById,
    updateWorkoutSession,
};

