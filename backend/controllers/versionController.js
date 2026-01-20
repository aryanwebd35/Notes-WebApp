import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import NoteVersion from '../models/NoteVersion.js';

/**
 * Version History Controller
 * 
 * Manages note version history
 * - Auto-save versions on major edits
 * - Limit to 20 versions per note
 * - Restore previous versions
 * - View version timeline
 */

/**
 * @desc    Create version snapshot
 * @route   POST /api/notes/:id/versions
 * @access  Private
 */
const createVersion = asyncHandler(async (req, res) => {
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

    // Get current version count
    const versionCount = await NoteVersion.countDocuments({ noteId: note._id });

    // Create new version
    const version = await NoteVersion.create({
        noteId: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        versionNumber: versionCount + 1,
        createdBy: req.user._id,
    });

    res.status(201).json(version);
});

/**
 * @desc    Get version history
 * @route   GET /api/notes/:id/versions
 * @access  Private
 */
const getVersionHistory = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership or shared access
    const hasAccess =
        note.userId.toString() === req.user._id.toString() ||
        note.sharedWith.some((share) => share.userId.toString() === req.user._id.toString());

    if (!hasAccess) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const versions = await NoteVersion.find({ noteId: note._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('title versionNumber createdAt');

    res.json(versions);
});

/**
 * @desc    Get specific version
 * @route   GET /api/notes/:id/versions/:versionId
 * @access  Private
 */
const getVersion = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership or shared access
    const hasAccess =
        note.userId.toString() === req.user._id.toString() ||
        note.sharedWith.some((share) => share.userId.toString() === req.user._id.toString());

    if (!hasAccess) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const version = await NoteVersion.findOne({
        _id: req.params.versionId,
        noteId: note._id,
    });

    if (!version) {
        res.status(404);
        throw new Error('Version not found');
    }

    res.json(version);
});

/**
 * @desc    Restore version
 * @route   POST /api/notes/:id/versions/:versionId/restore
 * @access  Private
 */
const restoreVersion = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check ownership (only owner can restore)
    if (note.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only note owner can restore versions');
    }

    const version = await NoteVersion.findOne({
        _id: req.params.versionId,
        noteId: note._id,
    });

    if (!version) {
        res.status(404);
        throw new Error('Version not found');
    }

    // Save current state as version before restoring
    await NoteVersion.create({
        noteId: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        versionNumber: (await NoteVersion.countDocuments({ noteId: note._id })) + 1,
        createdBy: req.user._id,
    });

    // Restore version
    note.title = version.title;
    note.content = version.content;
    note.tags = version.tags;
    await note.save();

    res.json({
        message: 'Version restored successfully',
        note,
    });
});

export { createVersion, getVersionHistory, getVersion, restoreVersion };
