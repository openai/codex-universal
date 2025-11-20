import { createContext, useContext, useMemo, useState } from 'react';
import { authenticate } from '../services/api';
import { Role, User } from '../models/types';

interface AuthContextValue {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string) {
    const authenticated = await authenticate(email);
    setUser(authenticated ?? null);
    return Boolean(authenticated);
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      hasRole: (role: Role) => user?.role === role,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
