import { api } from './api';

export const getUserRoutines = async (userId) => {
    const response = await api.get('/routines', {
        params: { userId },
    });
    return response.data || [];
};

export const getRecentSessions = async (userId, limit = 5) => {
    const response = await api.get('/sessions', {
        params: { userId, limit },
    });
    return response.data || [];
};

export const startWorkoutSession = async ({ userId, routineId, name, notes }) => {
    const response = await api.post('/sessions', {
        userId,
        ...(routineId ? { routineId } : {}),
        ...(name ? { name } : {}),
        ...(notes ? { notes } : {}),
    });
    return response.data;
};

