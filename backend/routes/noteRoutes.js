import express from 'express';
import {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    uploadAttachment,
    deleteAttachment,
} from '../controllers/noteController.js';
import {
    shareNote,
    generateShareLink,
    getSharedNote,
    removeShare,
    revokeShareLink,
    getSharedWithMe,
    getPendingShares,
    respondToShareRequest,
} from '../controllers/shareController.js';
import {
    createVersion,
    getVersionHistory,
    getVersion,
    restoreVersion,
} from '../controllers/versionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { shareLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

/**
 * Notes Routes
 * All routes are protected (require JWT authentication)
 */

// Base routes
router.route('/')
    .get(protect, getNotes)
    .post(protect, createNote);

// Shared notes
router.get('/shared-with-me', protect, getSharedWithMe);
router.get('/share/pending', protect, getPendingShares);
router.post('/:id/share/respond', protect, respondToShareRequest);
router.get('/shared/:token', getSharedNote); // Public route for share links

// Single note routes
router.route('/:id')
    .get(protect, getNoteById)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

// Attachment routes
router.post('/:id/upload', protect, uploadSingle, uploadAttachment);
router.delete('/:id/attachments/:attachmentId', protect, deleteAttachment);

// Sharing routes
router.post('/:id/share', protect, shareLimiter, shareNote);
router.post('/:id/share-link', protect, shareLimiter, generateShareLink);
router.delete('/:id/share/:userId', protect, removeShare);
router.delete('/:id/share-link', protect, revokeShareLink);

// Version history routes
router.post('/:id/versions', protect, createVersion);
router.get('/:id/versions', protect, getVersionHistory);
router.get('/:id/versions/:versionId', protect, getVersion);
router.post('/:id/versions/:versionId/restore', protect, restoreVersion);

export default router;
