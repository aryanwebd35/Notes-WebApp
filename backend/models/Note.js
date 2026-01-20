import mongoose from 'mongoose';

/**
 * Note Schema
 * Defines the structure for note documents in MongoDB
 * 
 * Fields:
 * - title: Note title
 * - content: Note content (text only in Phase-1)
 * - userId: Reference to User who created the note
 * - isPinned: Pin status for quick access
 * - isArchived: Archive status for notes
 * - tags: Categorization for notes
 * - attachments: Files attached to the note
 * - createdAt/updatedAt: Auto-generated timestamps
 * 
 * Phase-2 additions:
 * - tags, attachments, archiving
 */
const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            default: '',
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (tags) {
                    return tags.length <= 10; // Max 10 tags per note
                },
                message: 'Cannot have more than 10 tags'
            }
        },
        attachments: [{
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String, // Cloudinary public ID for deletion
                required: true,
            },
            type: {
                type: String,
                enum: ['image', 'document'],
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            size: {
                type: Number, // File size in bytes
            }
        }],
        reminderAt: {
            type: Date,
            default: null,
        },
        reminderStatus: {
            type: String,
            enum: ['pending', 'sent', 'none'],
            default: 'none',
        },
        sharedWith: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            permission: {
                type: String,
                enum: ['view', 'edit'],
                default: 'view',
            },
            sharedAt: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['pending', 'accepted'],
                default: 'pending',
            }
        }],
        shareToken: {
            type: String,
            unique: true,
            sparse: true, // Allow null, but unique if present
        },
        shareTokenExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

/**
 * Indexes for Performance
 * 
 * 1. userId + createdAt (descending): Fast retrieval of user's notes sorted by date
 * 2. userId + isPinned: Quick filtering of pinned notes
 * 3. userId + isArchived: Separate archived notes
 * 4. tags: Enable tag-based filtering
 * 
 * Compound index on userId + createdAt is most important for dashboard queries
 */
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1 });
noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ tags: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
