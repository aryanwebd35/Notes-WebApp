import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Gemini AI Service
 * 
 * Provides AI-powered features using Google's Gemini model
 * 
 * Advantages over OpenAI:
 * - Free tier available
 * - Faster response times
 * - Better multilingual support
 * - Lower cost
 * 
 * Cost Control Strategies:
 * - Use gemini-pro (free tier available)
 * - Limit input tokens (truncate long content)
 * - Rate limit per user (10 requests/hour)
 * - Cache common requests
 * - Only process on user confirmation
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

/**
 * Generate title from note content
 * @param {string} content - Note content
 * @returns {Promise<string>} - Generated title
 */
export const generateTitle = async (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 500);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Generate a concise, descriptive title (maximum 10 words) for the following note content. Return ONLY the title, nothing else:

"${plainText}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^["']|["']$/g, '');
};

/**
 * Summarize note content
 * @param {string} content - Note content
 * @returns {Promise<string>} - Summary
 */
export const summarizeNote = async (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Summarize the following note in 3-5 concise bullet points. Preserve key information:

"${plainText}"

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
};

/**
 * Suggest tags for note
 * @param {string} content - Note content
 * @param {string} title - Note title
 * @returns {Promise<string[]>} - Array of suggested tags
 */
export const suggestTags = async (content, title) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 1000);

    const prompt = `Based on the following note, suggest 3-5 relevant tags (single words or short phrases). Return ONLY a comma-separated list of tags:

Title: "${title}"
Content: "${plainText}"

Tags:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse comma-separated tags
    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    return tags.slice(0, 5);
};

/**
 * Improve note grammar and clarity
 * @param {string} content - Note content
 * @returns {Promise<string>} - Improved content
 */
export const improveWriting = async (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 1500);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Improve the grammar, clarity, and readability of the following text while preserving its original meaning. Return ONLY the improved text:

"${plainText}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
};

export default {
    generateTitle,
    summarizeNote,
    suggestTags,
    improveWriting,
};
