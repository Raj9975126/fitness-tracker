import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setTokenProvider, setUnauthorizedHandler, setUserIdProvider } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading] = useState(false);

    const signOut = useCallback(async () => {
        setUser(null);
        setToken(null);
    }, []);

    // Refs are updated during render, so the API client sees a new token immediately.
    // (Child screens' effects run before this provider's effects, so reading state
    // via a useEffect-registered closure would send the first request without a token.)
    const tokenRef = useRef(null);
    const userRef = useRef(null);
    tokenRef.current = token;
    userRef.current = user;

    useEffect(() => {
        setTokenProvider(() => tokenRef.current);
        setUserIdProvider(() => userRef.current?.id ?? null);
        setUnauthorizedHandler(() => {
            setUser(null);
            setToken(null);
        });
    }, []);

    // Both endpoints return { data: { user, token } }. Errors (e.g. wrong password)
    // are thrown as ApiError so the screen can show the message.
    const signIn = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password }, { skipAuth: true });
        setUser(res.data.user);
        setToken(res.data.token);
    }, []);

    const signUp = useCallback(async ({ name, email, password }) => {
        const res = await api.post('/auth/register', { name, email, password }, { skipAuth: true });
        setUser(res.data.user);
        setToken(res.data.token);
    }, []);

    const setSession = useCallback(({ user: nextUser, token: nextToken }) => {
        setUser(nextUser ?? null);
        setToken(nextToken ?? null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            isLoading,
            isAuthenticated: !!user,
            signIn,
            signUp,
            signOut,
            setSession,
        }),
        [user, token, isLoading, signIn, signUp, signOut, setSession]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
