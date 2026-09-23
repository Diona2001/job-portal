import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Role, User } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    const authUser: User = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
      companyId: data.companyId,
      companyName: data.companyName,
      jobSeekerProfileId: data.jobSeekerProfileId,
      createdAt: new Date().toISOString(),
    };

    setToken(data.token);
    setUser(authUser);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
