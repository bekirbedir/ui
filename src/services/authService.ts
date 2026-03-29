import api from './api';
import type { LoginRequest, LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Login attempt:', credentials.username);
      
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Login response:', response.data);
      
      const token = response.data.token;
      const user = decodeToken(token);
      
      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data || 'Login failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('Logout attempt');
      const token = localStorage.getItem('token');
      
      if (token) {
        // Backend'e logout isteği at
        await api.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Logout successful on backend');
      }
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      // Backend hatası olsa bile frontend'de logout yap
    } finally {
      // Token'ları her durumda temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// JWT token'dan user bilgisini decode et
const decodeToken = (token: string): User => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    console.log('Decoded token payload:', payload);
    
    return {
      id: payload.userId || 1,
      username: payload.sub || payload.username,
      role: payload.role === 'ROLE_ADMIN' ? 'ADMIN' : 'AGENCY'
    };
  } catch (error) {
    console.error('Token decode error:', error);
    return {
      id: 1,
      username: 'user',
      role: 'AGENCY'
    };
  }
};