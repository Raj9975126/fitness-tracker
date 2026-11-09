import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// Placeholder auth state. Swap signIn/signOut for real API calls + secure token storage.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading] = useState(false);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn: async (email) => setUser({ email }),
      signUp: async ({ email, name }) => setUser({ email, name }),
      signOut: async () => setUser(null),
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
