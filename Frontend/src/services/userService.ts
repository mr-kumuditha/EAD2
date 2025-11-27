import api from './api';
import type { User } from '../types';

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
}

export const userService = {
  // Get all users (Admin only)
  getAllUsers: (): Promise<User[]> => {
    return api.get<User[]>('/auth/users').then(response => response.data);
  },

  // Get user count (Admin only)
  getUserCount: (): Promise<number> => {
    return api.get<number>('/auth/users/count').then(response => response.data);
  },

  // Update user (Admin only)
  updateUser: (id: number, userData: UpdateUserRequest): Promise<User> => {
    return api.put<User>(`/auth/users/${id}`, userData).then(response => response.data);
  },

  // Delete user (Admin only)
  deleteUser: (id: number): Promise<void> => {
    return api.delete(`/auth/users/${id}`).then(response => response.data);
  }
};
