import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const EVENT_SERVICE_BASE = 'http://localhost:8082';

// Create axios instance for gateway
const api = axios.create({
    baseURL: API_BASE,
});

// Create axios instance for direct event service (for multipart requests)
const eventApi = axios.create({
    baseURL: EVENT_SERVICE_BASE,
});

// Request interceptor to add auth headers for gateway
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            config.headers['X-User-Id'] = user.userId.toString();
            config.headers['X-User-Role'] = user.role;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Request interceptor to add auth headers for direct event service
eventApi.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            config.headers['X-User-Id'] = user.userId.toString();
            config.headers['X-User-Role'] = user.role;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling on eventApi
eventApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Event API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
export { eventApi };
