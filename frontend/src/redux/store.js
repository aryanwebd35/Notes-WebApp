import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notesReducer from './slices/notesSlice';

/**
 * Redux Store Configuration
 * 
 * Combines all reducers:
 * - auth: Authentication state
 * - notes: Notes state
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        notes: notesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
