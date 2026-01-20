import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect Middleware
 * Verifies JWT token and attaches user to request object
 * 
 * Flow:
 * 1. Check if Authorization header exists and starts with 'Bearer'
 * 2. Extract token from header
 * 3. Verify token using JWT_SECRET
 * 4. Find user by decoded ID
 * 5. Attach user to req.user (excluding password)
 * 
 * Usage: Add to routes that require authentication
 * Example: router.get('/protected', protect, controller)
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next(); // Proceed to next middleware/controller
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // No token provided
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
