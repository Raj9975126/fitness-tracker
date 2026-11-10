import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setTokenProvider, setUnauthorizedHandler, setUserIdProvider } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading] = useState(false);

    const signOut = useCallback(async () => {
        setUser(null);
        setToken(null);
    }, []);

    useEffect(() => {
        setTokenProvider(() => token);
        setUserIdProvider(() => user?.id ?? null);
        setUnauthorizedHandler(() => {
            setUser(null);
            setToken(null);
        });
    }, [token, user]);

    const signIn = useCallback(async (email) => {
        setUser({ id: 'demo-user-id', email });
    }, []);

    const signUp = useCallback(async ({ email, name }) => {
        setUser({ id: 'demo-user-id', email, name });
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
