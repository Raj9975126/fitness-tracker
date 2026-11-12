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

export const getSessionDetails = async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
};

export const getSessionSets = async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/sets`);
    return response.data;
};

export const saveSessionSets = async (sessionId, sets, replace = false) => {
    const response = await api.put(`/sessions/${sessionId}/sets`, {
        sets,
        replace,
    });
    return response.data;
};

