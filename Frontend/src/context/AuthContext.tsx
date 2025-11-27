import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';
import { AuthContext } from './AuthContextState.ts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response: AuthResponse = await authService.login(credentials);
            if (response.success && response.userId) {
                const userData: User = {
                    userId: response.userId,
                    username: response.username!,
                    email: response.email!,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: response.role!
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error: unknown) {
            const message = isAxiosError(error)
                ? error.response?.data?.message ?? 'Login failed'
                : 'Login failed';
            return { success: false, message };
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response: AuthResponse = await authService.register(userData);
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error: unknown) {
            const message = isAxiosError(error)
                ? error.response?.data?.message ?? 'Registration failed'
                : 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};