import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import passport from './config/passport.js';
import { startReminderScheduler } from './services/reminderScheduler.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';


import {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    xssMiddleware,
    hppMiddleware,
    compressionMiddleware,
    getCorsOptions,
} from './middlewares/securityMiddleware.js';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables
dotenv.config();

/**
 * Environment Variables Validation
 * Ensures all required variables are set before starting
 */
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

// Warn about optional but recommended variables
if (!process.env.RESEND_API_KEY && !process.env.EMAIL_USER) {
    console.warn('⚠️  No email service configured. Email features will not work.');
}
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  No Gemini API key. AI features will not work.');
}

// Connect to MongoDB
await connectDB();

// Start reminder scheduler (only in production or if explicitly enabled)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULER === 'true') {
    startReminderScheduler();
}

// Initialize Express app
const app = express();

/**
 * Security Middleware (Applied First)
 * Order matters! Security middleware should be applied before routes
 */
app.use(helmetMiddleware); // HTTP security headers
app.use(mongoSanitizeMiddleware); // NoSQL injection prevention
app.use(xssMiddleware); // XSS attack prevention
app.use(hppMiddleware); // HTTP parameter pollution prevention
app.use(compressionMiddleware); // Response compression

// CORS - Strict origin control
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint (for deployment monitoring)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Notes App API',
        version: '1.0.0',
        docs: '/api/docs',
    });
});

// Serve uploads statically with CORS
// __dirname is defined at the top now
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// Error Handling Middleware (Must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Security: Helmet, CORS, Rate Limiting enabled\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export default app; // Export for testing
