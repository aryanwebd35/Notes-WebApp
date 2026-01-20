import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { cleanupTempFile } from '../middlewares/uploadMiddleware.js';

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
    const query = {
        userId: req.user._id,
    };

    // Handle archived filter
    if (archived === 'true') {
        query.isArchived = true;
    } else if (archived === 'false' || archived === undefined) {
        query.isArchived = false;
    }
    // If archived === 'all', don't add isArchived to query (fetch both)

    // Filter by tag
    if (tag) {
        query.tags = tag;
    }

    // Search in title and content
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }

    // Fetch notes (pinned first, then by date)
    const notes = await Note.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .lean();

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
    const { title, content, tags, isPinned, isArchived } = req.body;

    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags !== undefined ? tags : note.tags;
    note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
    note.isArchived = isArchived !== undefined ? isArchived : note.isArchived;

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
        // Determine file type
        const isImage = req.file.mimetype.startsWith('image/');

        // Local Storage Strategy (No Cloudinary keys needed)
        const filename = req.file.filename;
        // File is already saved in uploads/temp by middleware, but we'll use it from there
        // Or move it to a permanent folder. For now, let's keep it simple.
        // Since middleware saves to uploads/temp, we can just use that or move it.
        // Let's assume we want to serve it.

        // Construct local URL
        // req.protocol + '://' + req.get('host') results in http://localhost:5000
        const protocol = req.protocol;
        const host = req.get('host');
        // Encode filename to handle spaces and special characters
        const fileUrl = `${protocol}://${host}/uploads/temp/${encodeURIComponent(filename)}`;

        // Add attachment to note
        note.attachments.push({
            url: fileUrl,
            publicId: filename, // Use filename as ID for local
            type: isImage ? 'image' : 'document',
            name: req.file.originalname,
            size: req.file.size,
        });

        await note.save();

        // No cleanup needed since we are keeping the file
        // cleanupTempFile(req.file.path); 

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
    const resourceType = attachment.type === 'image' ? 'image' : 'raw';
    await deleteFromCloudinary(attachment.publicId, resourceType);

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
