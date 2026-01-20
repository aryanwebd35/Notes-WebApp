import express from 'express';
import {
    generateNoteTitle,
    summarizeNoteContent,
    suggestNoteTags,
    improveNoteWriting,
} from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * AI Rate Limiter
 * 10 requests per hour per user
 * Prevents API abuse and controls costs
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many AI requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AI Routes
 * All routes require authentication and are rate-limited
 */
router.post('/generate-title', protect, aiLimiter, generateNoteTitle);
router.post('/summarize', protect, aiLimiter, summarizeNoteContent);
router.post('/suggest-tags', protect, aiLimiter, suggestNoteTags);
router.post('/improve', protect, aiLimiter, improveNoteWriting);

export default router;
