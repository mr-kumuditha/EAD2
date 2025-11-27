import { createContext } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types';

export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
