import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';

/**
 * Security Middleware Configuration
 * 
 * This file contains all security-related middleware for production deployment.
 * Each middleware serves a specific security purpose.
 */

/**
 * 1. Helmet - Sets various HTTP headers for security
 * 
 * Why: Protects against common web vulnerabilities
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - Information disclosure
 * 
 * Headers set:
 * - Content-Security-Policy
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Strict-Transport-Security
 * - X-Download-Options
 * - X-Permitted-Cross-Domain-Policies
 */
export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow Cloudinary images
});

/**
 * 2. MongoDB Sanitization
 * 
 * Why: Prevents NoSQL injection attacks
 * - Removes $ and . characters from user input
 * - Prevents malicious query operators
 * 
 * Example attack prevented:
 * { "email": { "$gt": "" } } // Would return all users
 */
export const mongoSanitizeMiddleware = mongoSanitize();

/**
 * 3. XSS Protection
 * 
 * Why: Prevents Cross-Site Scripting attacks
 * - Sanitizes user input
 * - Removes malicious HTML/JavaScript
 * 
 * Example attack prevented:
 * <script>alert('XSS')</script>
 */
export const xssMiddleware = xss();

/**
 * 4. HTTP Parameter Pollution Protection
 * 
 * Why: Prevents parameter pollution attacks
 * - Protects against duplicate parameters
 * - Ensures predictable query parsing
 * 
 * Example attack prevented:
 * ?id=1&id=2 // Could cause unexpected behavior
 */
export const hppMiddleware = hpp();

/**
 * 5. Response Compression
 * 
 * Why: Improves performance
 * - Reduces response size
 * - Faster data transfer
 * - Lower bandwidth costs
 * 
 * Compresses:
 * - JSON responses
 * - HTML
 * - CSS/JS (if served)
 */
export const compressionMiddleware = compression();

/**
 * 6. CORS Configuration
 * 
 * Why: Controls which domains can access the API
 * - Prevents unauthorized cross-origin requests
 * - Protects against CSRF attacks
 * 
 * Production: Only allow specific frontend domain
 * Development: Allow localhost
 */
export const getCorsOptions = () => {
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL] // Only production frontend
        : ['http://localhost:5173', 'http://localhost:3000']; // Dev frontends

    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            // Allow any localhost origin in development
            if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies
        optionsSuccessStatus: 200,
    };
};

/**
 * Security Checklist Summary:
 * 
 * ✅ HTTP Headers (Helmet)
 * ✅ NoSQL Injection Prevention (Mongo Sanitize)
 * ✅ XSS Protection (XSS Clean)
 * ✅ Parameter Pollution (HPP)
 * ✅ Response Compression
 * ✅ CORS Configuration
 * ✅ Rate Limiting (in rateLimitMiddleware.js)
 * ✅ JWT Authentication (in authMiddleware.js)
 * ✅ Input Validation (in validators/)
 * 
 * Additional Security Measures:
 * - Environment variables for secrets
 * - Password hashing (bcrypt)
 * - Refresh token rotation
 * - Email verification
 * - File upload validation
 * - API rate limiting
 */

export default {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    xssMiddleware,
    hppMiddleware,
    compressionMiddleware,
    getCorsOptions,
};
