import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('user');
    },

    isAdmin: (): boolean => {
        const user = authService.getCurrentUser();
        return user?.role === 'ADMIN';
    }
};
