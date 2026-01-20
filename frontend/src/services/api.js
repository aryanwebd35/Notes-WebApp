import axios from 'axios';

/**
 * Axios Instance Configuration
 * 
 * Base configuration for all API requests
 * - Sets base URL from environment variable
 * - Adds default headers
 * - Includes auth token in requests
 * - Handles token refresh on 401 errors
 */

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with auto-refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        // Skip refresh for login requests
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
            if (isRefreshing) {
                // Wait for refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
                    { refreshToken }
                );

                const { token } = data;
                localStorage.setItem('token', token);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                processQueue(null, token);
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
