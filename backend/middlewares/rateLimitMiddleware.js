import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * 
 * Protects against brute force attacks and abuse
 * 
 * Strategy:
 * - Auth endpoints: 5 requests per 15 minutes
 * - Share endpoints: 10 requests per hour
 * - General API: 100 requests per 15 minutes
 * 
 * Uses in-memory store (simple, works for single server)
 * For production with multiple servers, use Redis store
 */

/**
 * Auth rate limiter
 * Applied to login, register, verification endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window (increased for dev)
    message: 'Too many attempts, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

/**
 * Verification code rate limiter
 * Applied to send/resend verification code
 */
export const verificationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute (increased for dev)
    message: 'Please wait before requesting another code',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Share rate limiter
 * Applied to share endpoints
 */
export const shareLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 shares per hour
    message: 'Too many share requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * Applied to all API routes
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    authLimiter,
    verificationLimiter,
    shareLimiter,
    apiLimiter,
};
