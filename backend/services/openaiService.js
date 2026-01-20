import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenAI Service
 * 
 * Provides AI-powered features for notes:
 * 1. Auto-generate titles from content
 * 2. Summarize long notes
 * 3. Suggest relevant tags
 * 4. Improve grammar and clarity
 * 
 * Cost Control Strategies:
 * - Use gpt-3.5-turbo (cheaper than gpt-4)
 * - Limit input tokens (truncate long content)
 * - Rate limit per user
 * - Cache common requests
 * - Only process on user confirmation
 * 
 * Prompt Design Principles:
 * - Clear, specific instructions
 * - Provide context and examples
 * - Request structured output (JSON)
 * - Set max tokens to control cost
 */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

/**
 * Generate title from note content
 * 
 * Prompt Strategy:
 * - Analyze first 500 characters
 * - Generate concise, descriptive title
 * - Max 10 words
 * 
 * @param {string} content - Note content (HTML or plain text)
 * @returns {Promise<string>} - Generated title
 */
export const generateTitle = async (content) => {
    // Strip HTML and limit length
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 500);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Generate a concise, descriptive title (max 10 words) for the following note content:

"${plainText}"

Title:`;

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that generates concise, descriptive titles for notes.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        max_tokens: 20,
        temperature: 0.7,
    });

    return response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
};

/**
 * Summarize note content
 * 
 * Prompt Strategy:
 * - Extract key points
 * - 3-5 bullet points
 * - Preserve important details
 * 
 * @param {string} content - Note content
 * @param {number} maxLength - Max summary length (default: 1000 chars)
 * @returns {Promise<string>} - Summary
 */
export const summarizeNote = async (content, maxLength = 1000) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Summarize the following note in 3-5 bullet points. Keep it concise and preserve key information:

"${plainText}"

Summary:`;

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that creates concise summaries of notes.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        max_tokens: 200,
        temperature: 0.5,
    });

    return response.choices[0].message.content.trim();
};

/**
 * Suggest tags for note
 * 
 * Prompt Strategy:
 * - Analyze content themes
 * - Return 3-5 relevant tags
 * - JSON format for easy parsing
 * 
 * @param {string} content - Note content
 * @param {string} title - Note title
 * @returns {Promise<string[]>} - Array of suggested tags
 */
export const suggestTags = async (content, title) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 1000);

    const prompt = `Based on the following note title and content, suggest 3-5 relevant tags (single words or short phrases):

Title: "${title}"
Content: "${plainText}"

Return ONLY a JSON array of tags, like: ["tag1", "tag2", "tag3"]`;

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that suggests relevant tags for notes. Always respond with valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        max_tokens: 50,
        temperature: 0.6,
    });

    try {
        const tags = JSON.parse(response.choices[0].message.content.trim());
        return Array.isArray(tags) ? tags.slice(0, 5) : [];
    } catch (error) {
        // Fallback: extract tags from response
        const text = response.choices[0].message.content;
        const matches = text.match(/"([^"]+)"/g);
        return matches ? matches.map(m => m.replace(/"/g, '')).slice(0, 5) : [];
    }
};

/**
 * Improve note grammar and clarity
 * 
 * Prompt Strategy:
 * - Fix grammar errors
 * - Improve sentence structure
 * - Maintain original meaning
 * - Preserve formatting
 * 
 * @param {string} content - Note content
 * @returns {Promise<string>} - Improved content
 */
export const improveWriting = async (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 1500);

    if (!plainText.trim()) {
        throw new Error('Content is empty');
    }

    const prompt = `Improve the grammar, clarity, and readability of the following text while preserving its original meaning:

"${plainText}"

Improved version:`;

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful writing assistant that improves grammar and clarity while preserving the original meaning.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        max_tokens: 500,
        temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
};

export default {
    generateTitle,
    summarizeNote,
    suggestTags,
    improveWriting,
};
