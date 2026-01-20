import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * Auth Slice
 * Manages authentication state and operations
 * 
 * State:
 * - user: Current user object (null if not logged in)
 * - token: JWT token (null if not logged in)
 * - loading: Loading state for async operations
 * - error: Error message from failed operations
 */

// Get initial state from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

const tokenFromStorage = localStorage.getItem('token') || null;

const initialState = {
    user: userFromStorage,
    token: tokenFromStorage,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
};

/**
 * Async Thunk: Register User
 * POST /api/auth/register
 */
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/auth/register', userData);

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            return data;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Registration failed';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async Thunk: Login User
 * POST /api/auth/login
 */
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/auth/login', credentials);

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            return data;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async Thunk: Guest Login
 * POST /api/auth/guest-login
 */
export const guestLogin = createAsyncThunk(
    'auth/guestLogin',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/auth/guest-login');

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            return data;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Guest login failed';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async Thunk: Get Current User
 * GET /api/auth/me
 */
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/auth/me');
            return data;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Failed to fetch user';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async Thunk: Refresh Access Token
 * POST /api/auth/refresh-token
 */
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const { refreshToken } = auth;

        if (!refreshToken) {
            return rejectWithValue('No refresh token available');
        }

        try {
            const { data } = await api.post('/api/auth/refresh-token', { refreshToken });

            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            return data;
        } catch (error) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            const message =
                error.response?.data?.message || error.message || 'Failed to refresh token';
            return rejectWithValue(message);
        }
    }
);

/**
 * Auth Slice Definition
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Logout action
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Update user
        updateUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Guest Login
            .addCase(guestLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(guestLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(guestLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get Me
        builder
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = { ...state.user, ...action.payload };
            })
            .addCase(getMe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Refresh Token
        builder
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
            });
    },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
