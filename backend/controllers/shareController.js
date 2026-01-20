import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Note from '../models/Note.js';
import User from '../models/User.js';

/**
 * Generate unique share token
 * @returns {string} - Random token
 */
const generateShareToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * @desc    Share note with user
 * @route   POST /api/notes/:id/share
 * @access  Private
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "permission": "view" | "edit"
 * }
 */
const shareNote = asyncHandler(async (req, res) => {
    const { email, permission = 'view' } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide user email');
    }

    if (!['view', 'edit'].includes(permission)) {
        res.status(400);
        throw new Error('Invalid permission. Use "view" or "edit"');
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to share this note');
    }

    // Find user to share with
    const userToShare = await User.findOne({ email });

    if (!userToShare) {
        res.status(404);
        throw new Error('User not found with this email');
    }

    // Can't share with yourself
    if (userToShare._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot share note with yourself');
    }

    // Check if already shared
    const alreadyShared = note.sharedWith.find(
        (share) => share.userId.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
        // Update permission if different
        if (alreadyShared.permission !== permission) {
            alreadyShared.permission = permission;
            await note.save();
            return res.json({
                message: 'Permission updated',
                sharedWith: note.sharedWith,
            });
        }
        res.status(400);
        throw new Error('Note already shared with this user');
    }

    // Add to sharedWith
    note.sharedWith.push({
        userId: userToShare._id,
        permission,
    });

    await note.save();

    res.json({
        message: 'Note shared successfully',
        sharedWith: note.sharedWith,
    });
});

/**
 * @desc    Generate shareable link
 * @route   POST /api/notes/:id/share-link
 * @access  Private
 * 
 * Request Body:
 * {
 *   "permission": "view" | "edit",
 *   "expiresIn": 24 (hours, optional)
 * }
 */
const generateShareLink = asyncHandler(async (req, res) => {
    const { permission = 'view', expiresIn } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to share this note');
    }

    // Generate token
    const token = generateShareToken();

    // Set expiry if provided
    let expiry = null;
    if (expiresIn) {
        expiry = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
    }

    note.shareToken = token;
    note.shareTokenExpiry = expiry;
    await note.save();

    const shareUrl = `${process.env.CLIENT_URL}/shared/${token}`;

    res.json({
        message: 'Share link generated',
        shareUrl,
        expiresAt: expiry,
        permission,
    });
});

/**
 * @desc    Access shared note via link
 * @route   GET /api/notes/shared/:token
 * @access  Public
 */
const getSharedNote = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const note = await Note.findOne({ shareToken: token }).populate('userId', 'name email');

    if (!note) {
        res.status(404);
        throw new Error('Shared note not found');
    }

    // Check if expired
    if (note.shareTokenExpiry && new Date() > note.shareTokenExpiry) {
        res.status(410);
        throw new Error('Share link has expired');
    }

    res.json({
        note: {
            _id: note._id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            attachments: note.attachments,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            owner: note.userId.name,
        },
        permission: 'view', // Link shares are always view-only
    });
});

/**
 * @desc    Remove share access
 * @route   DELETE /api/notes/:id/share/:userId
 * @access  Private
 */
const removeShare = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Remove from sharedWith
    note.sharedWith = note.sharedWith.filter(
        (share) => share.userId.toString() !== req.params.userId
    );

    await note.save();

    res.json({ message: 'Share access removed' });
});

/**
 * @desc    Revoke share link
 * @route   DELETE /api/notes/:id/share-link
 * @access  Private
 */
const revokeShareLink = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    note.shareToken = undefined;
    note.shareTokenExpiry = undefined;
    await note.save();

    res.json({ message: 'Share link revoked' });
});

/**
 * @desc    Get notes shared with me
 * @route   GET /api/notes/shared-with-me
 * @access  Private
 */
const getSharedWithMe = asyncHandler(async (req, res) => {
    const notes = await Note.find({
        'sharedWith.userId': req.user._id,
    })
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 });

    // Add permission info
    const notesWithPermission = notes.map((note) => {
        const share = note.sharedWith.find(
            (s) => s.userId.toString() === req.user._id.toString()
        );

        return {
            ...note.toObject(),
            myPermission: share.permission,
            owner: note.userId.name,
        };
    });

    res.json(notesWithPermission);
});

export {
    shareNote,
    generateShareLink,
    getSharedNote,
    removeShare,
    revokeShareLink,
    getSharedWithMe,
};
