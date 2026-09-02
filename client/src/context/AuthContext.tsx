import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  authService,
  BackendUser,
  LoginPayload,
  StudentRegisterPayload,
  RecruiterRegisterPayload,
  normalizeUserRole,
} from '../services/auth.service';
import type { NavUser, UserRole } from '../types';

export interface AuthContextType {
  user: NavUser | null;
  rawUser: BackendUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<NavUser>;
  registerStudent: (payload: StudentRegisterPayload) => Promise<NavUser>;
  registerRecruiter: (payload: RecruiterRegisterPayload) => Promise<NavUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToNavUser(user: BackendUser): NavUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeUserRole(user.role),
    rawRole: user.role,
    status: user.status,
    profileImage: user.profileImage,
    phone: user.phone,
    location: user.location,
    studentProfile: user.studentProfile,
    recruiterProfile: user.recruiterProfile,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NavUser | null>(null);
  const [rawUser, setRawUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('sb_token');
    setUser(null);
    setRawUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const backendUser = await authService.getCurrentUser();
      setRawUser(backendUser);
      setUser(mapBackendUserToNavUser(backendUser));
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  // Initial authentication check on application mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const backendUser = await authService.getCurrentUser();
        if (isMounted) {
          setRawUser(backendUser);
          setUser(mapBackendUserToNavUser(backendUser));
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen to unauthorized events from API interceptor
    const handleUnauthorized = () => {
      clearAuth();
    };
    window.addEventListener('sb_unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('sb_unauthorized', handleUnauthorized);
    };
  }, [clearAuth]);

  const login = async (credentials: LoginPayload): Promise<NavUser> => {
    const data = await authService.login(credentials);
    if (data.token) {
      localStorage.setItem('sb_token', data.token);
    }
    const navUser = mapBackendUserToNavUser(data.user);
    setRawUser(data.user);
    setUser(navUser);
    return navUser;
  };

  const registerStudent = async (payload: StudentRegisterPayload): Promise<NavUser> => {
    const data = await authService.registerStudent(payload);
    if (data.token) {
      localStorage.setItem('sb_token', data.token);
    }
    const navUser = mapBackendUserToNavUser(data.user);
    setRawUser(data.user);
    setUser(navUser);
    return navUser;
  };

  const registerRecruiter = async (payload: RecruiterRegisterPayload): Promise<NavUser> => {
    const data = await authService.registerRecruiter(payload);
    if (data.token) {
      localStorage.setItem('sb_token', data.token);
    }
    const navUser = mapBackendUserToNavUser(data.user);
    setRawUser(data.user);
    setUser(navUser);
    return navUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    rawUser,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    registerStudent,
    registerRecruiter,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
