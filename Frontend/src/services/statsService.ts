import api from './api';

export interface DashboardStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
}

export const statsService = {
  // Get dashboard statistics (Admin only)
  getDashboardStats: (): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/events/stats').then(response => response.data);
  }
};
