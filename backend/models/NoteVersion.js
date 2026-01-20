import mongoose from 'mongoose';

/**
 * NoteVersion Schema
 * 
 * Stores historical versions of notes for version control
 * 
 * Features:
 * - Automatic versioning on major edits
 * - Limited to last 20 versions per note
 * - Stores complete snapshot of note content
 * - Tracks when version was created
 * 
 * Use Cases:
 * - Restore previous versions
 * - View edit history
 * - Compare changes
 * - Undo accidental deletions
 */
const noteVersionSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        versionNumber: {
            type: Number,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient version queries
noteVersionSchema.index({ noteId: 1, createdAt: -1 });

// Limit versions per note to 20 (keep most recent)
noteVersionSchema.pre('save', async function (next) {
    const versionCount = await this.constructor.countDocuments({ noteId: this.noteId });

    if (versionCount >= 20) {
        // Delete oldest version
        await this.constructor.findOneAndDelete(
            { noteId: this.noteId },
            { sort: { createdAt: 1 } }
        );
    }

    next();
});

const NoteVersion = mongoose.model('NoteVersion', noteVersionSchema);

export default NoteVersion;
