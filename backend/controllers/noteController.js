import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { cleanupTempFile } from '../middlewares/uploadMiddleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;

    console.log('Create Note Request:', { title, content, tags, user: req.user._id });

    // Validation - only title is required
    if (!title) {
        res.status(400);
        throw new Error('Please provide a title');
    }

    // Create note
    const note = await Note.create({
        userId: req.user._id,
        title,
        content: content || '', // Allow empty content
        tags: tags || [],
    });

    res.status(201).json(note);
});

/**
 * @desc    Get all notes for logged-in user
 * @route   GET /api/notes
 * @access  Private
 * 
 * Query params:
 * - archived: true/false (default: false)
 * - tag: filter by tag
 * - search: search in title and content
 */
const getNotes = asyncHandler(async (req, res) => {
    const { archived, tag, search } = req.query;

    // Build query
    // Build query
    // Build query to find notes owned by user OR shared with user (accepted)
    const query = {
        $or: [
            { userId: req.user._id },
            {
                sharedWith: {
                    $elemMatch: {
                        userId: req.user._id,
                        status: 'accepted'
                    }
                }
            }
        ]
    };

    // Handle archived filter
    if (archived === 'true') {
        query.isArchived = true;
    } else if (archived === 'false' || archived === undefined) {
        query.isArchived = false;
    }
    // If archived === 'all', don't add isArchived check unless specifically handling mixed queries

    // Filter by tag
    if (tag) {
        query.tags = tag;
    }

    // Search in title and content
    if (search) {
        query.$and = [
            query.$or ? { $or: query.$or } : {}, // Preserve previous OR condition
            {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } },
                ]
            }
        ];
        delete query.$or; // Removed top-level OR to prevent conflict, handled inside $and
    }

    // Fetch notes (pinned first, then by date)
    let notes = await Note.find(query)
        .populate('userId', 'name email') // Populate owner info
        .sort({ isPinned: -1, createdAt: -1 })
        .lean();

    // Add permission info to shared notes
    notes = notes.map(note => {
        const isOwner = note.userId._id.toString() === req.user._id.toString();
        let permission = 'edit'; // Owner has full access

        if (!isOwner) {
            const share = note.sharedWith.find(s => s.userId.toString() === req.user._id.toString());
            permission = share ? share.permission : 'view';
        }

        return {
            ...note,
            isOwner,
            permission,
            owner: isOwner ? 'Me' : note.userId.name
        };
    });

    res.json(notes);
});

/**
 * @desc    Get single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this note');
    }

    res.json(note);
});

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this note');
    }

    // Update fields
    const { title, content, tags, isPinned, isArchived, reminderAt, reminderStatus } = req.body;

    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags !== undefined ? tags : note.tags;
    note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
    note.isArchived = isArchived !== undefined ? isArchived : note.isArchived;
    note.reminderAt = reminderAt !== undefined ? reminderAt : note.reminderAt;
    note.reminderStatus = reminderStatus !== undefined ? reminderStatus : note.reminderStatus;

    const updatedNote = await note.save();

    res.json(updatedNote);
});

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this note');
    }

    // Delete attachments from Cloudinary
    if (note.attachments && note.attachments.length > 0) {
        for (const attachment of note.attachments) {
            try {
                const resourceType = attachment.type === 'image' ? 'image' : 'raw';
                await deleteFromCloudinary(attachment.publicId, resourceType);
            } catch (error) {
                console.error('Error deleting attachment:', error);
            }
        }
    }

    await note.deleteOne();

    res.json({ message: 'Note deleted successfully' });
});

/**
 * @desc    Upload attachment to note
 * @route   POST /api/notes/:id/upload
 * @access  Private
 */
const uploadAttachment = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify this note');
    }

    // Check if file was uploaded
    if (!req.file) {
        console.error('Upload Error: No file received');
        res.status(400);
        throw new Error('Please upload a file');
    }

    console.log('File received:', req.file);

    try {
        // Upload to Cloudinary
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isImage ? 'image' : 'raw';

        const cloudinaryResult = await uploadToCloudinary(req.file.path, 'notes-app', resourceType);

        // Add attachment to note
        note.attachments.push({
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.publicId,
            type: isImage ? 'image' : 'document',
            name: req.file.originalname,
            size: req.file.size,
        });

        await note.save();

        // Clean up temp file after upload to Cloudinary
        cleanupTempFile(req.file.path);

        res.json({
            message: 'File uploaded successfully',
            attachment: note.attachments[note.attachments.length - 1],
        });
    } catch (error) {
        // Clean up temp file on error
        cleanupTempFile(req.file.path);
        throw error;
    }
});

/**
 * @desc    Delete attachment from note
 * @route   DELETE /api/notes/:id/attachments/:attachmentId
 * @access  Private
 */
const deleteAttachment = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify this note');
    }

    // Find attachment
    const attachment = note.attachments.id(req.params.attachmentId);

    if (!attachment) {
        res.status(404);
        throw new Error('Attachment not found');
    }

    // Delete from Cloudinary
    try {
        const resourceType = attachment.type === 'image' ? 'image' : 'raw';
        await deleteFromCloudinary(attachment.publicId, resourceType);
        console.log('✅ Deleted from Cloudinary:', attachment.publicId);
    } catch (error) {
        console.error('❌ Error deleting from Cloudinary:', error);
    }

    // Remove from note
    attachment.deleteOne();
    await note.save();

    res.json({ message: 'Attachment deleted successfully' });
});

export {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    uploadAttachment,
    deleteAttachment,
};
