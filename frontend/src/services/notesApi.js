import api from './api';

/**
 * Notes API Service
 * All API calls for notes CRUD operations
 */

/**
 * Get all notes for current user
 * @param {object} params - Query parameters { archived, tag, search }
 * @returns {Promise<Array>} - Array of notes
 */
export const getNotes = async (params = {}) => {
    const { data } = await api.get('/api/notes', { params });
    return data;
};

/**
 * Get single note by ID
 * @param {string} id - Note ID
 * @returns {Promise<object>} - Note object
 */
export const getNoteById = async (id) => {
    const { data } = await api.get(`/api/notes/${id}`);
    return data;
};

/**
 * Create new note
 * @param {object} noteData - { title, content, tags, isPinned }
 * @returns {Promise<object>} - Created note
 */
export const createNote = async (noteData) => {
    const { data } = await api.post('/api/notes', noteData);
    return data;
};

/**
 * Update note
 * @param {string} id - Note ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated note
 */
export const updateNote = async (id, updates) => {
    const { data } = await api.put(`/api/notes/${id}`, updates);
    return data;
};

/**
 * Delete note
 * @param {string} id - Note ID
 * @returns {Promise<object>} - Success message
 */
export const deleteNote = async (id) => {
    const { data } = await api.delete(`/api/notes/${id}`);
    return data;
};

/**
 * Upload attachment to note
 * @param {string} noteId - Note ID
 * @param {File} file - File to upload
 * @returns {Promise<object>} - Upload result with attachment info
 */
export const uploadAttachment = async (noteId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post(`/api/notes/${noteId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

/**
 * Delete attachment from note
 * @param {string} noteId - Note ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<object>} - Success message
 */
export const deleteAttachment = async (noteId, attachmentId) => {
    const { data } = await api.delete(`/api/notes/${noteId}/attachments/${attachmentId}`);
    return data;
};
