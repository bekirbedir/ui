import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Checking stored credentials');
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      console.log('AuthProvider: Found stored user');
      setUser(JSON.parse(storedUser));
    } else {
      console.log('AuthProvider: No stored user found');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('AuthProvider: Login attempt');
    try {
      const response = await authService.login(credentials);
      console.log('AuthProvider: Login successful, saving token');
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      console.error('AuthProvider: Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logout');
    await authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};