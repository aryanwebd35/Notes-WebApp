import asyncHandler from 'express-async-handler';
import { generateTitle, summarizeNote, suggestTags, improveWriting } from '../services/geminiService.js';

/**
 * AI Controller
 * 
 * Provides AI-powered features using Google Gemini
 * All endpoints are rate-limited to prevent abuse
 * All endpoints are rate-limited to prevent abuse
 * 
 * Security:
 * - JWT authentication required
 * - Rate limiting (10 requests/hour per user)
 * - Input validation
 * - Results not auto-saved (user confirmation required)
 */

/**
 * @desc    Generate title from content
 * @route   POST /api/ai/generate-title
 * @access  Private
 */
const generateNoteTitle = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
        res.status(400);
        throw new Error('Content must be at least 10 characters');
    }

    try {
        const title = await generateTitle(content);
        res.json({ title });
    } catch (error) {
        console.error('AI Title Generation Error:', error);
        res.status(500);
        throw new Error('Failed to generate title. Please try again.');
    }
});

/**
 * @desc    Summarize note
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeNoteContent = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 50) {
        res.status(400);
        throw new Error('Content must be at least 50 characters to summarize');
    }

    try {
        const summary = await summarizeNote(content);
        res.json({ summary });
    } catch (error) {
        console.error('AI Summarization Error:', error);
        res.status(500);
        throw new Error('Failed to summarize note. Please try again.');
    }
});

/**
 * @desc    Suggest tags
 * @route   POST /api/ai/suggest-tags
 * @access  Private
 */
const suggestNoteTags = asyncHandler(async (req, res) => {
    const { content, title } = req.body;

    if (!content && !title) {
        res.status(400);
        throw new Error('Provide either content or title');
    }

    try {
        const tags = await suggestTags(content || '', title || 'Untitled');
        res.json({ tags });
    } catch (error) {
        console.error('AI Tag Suggestion Error:', error);
        res.status(500);
        throw new Error('Failed to suggest tags. Please try again.');
    }
});

/**
 * @desc    Improve writing
 * @route   POST /api/ai/improve
 * @access  Private
 */
const improveNoteWriting = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 20) {
        res.status(400);
        throw new Error('Content must be at least 20 characters');
    }

    try {
        const improved = await improveWriting(content);
        res.json({ improved });
    } catch (error) {
        console.error('AI Writing Improvement Error:', error);
        res.status(500);
        throw new Error('Failed to improve writing. Please try again.');
    }
});

export {
    generateNoteTitle,
    summarizeNoteContent,
    suggestNoteTags,
    improveNoteWriting,
};
