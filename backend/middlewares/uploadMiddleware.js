import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Multer Upload Middleware
 * 
 * Handles file uploads for images and documents
 * Flow: Browser → Multer (temp storage) → Cloudinary → Database
 * 
 * File Types Allowed:
 * - Images: jpg, jpeg, png, gif, webp
 * - Documents: pdf, doc, docx, txt
 * 
 * Size Limits:
 * - Images: 5MB
 * - Documents: 10MB
 */

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/temp';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter - validate file types
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedDocTypes = /pdf|doc|docx|txt/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check if image
    if (mimetype.startsWith('image/') && allowedImageTypes.test(extname.slice(1))) {
        return cb(null, true);
    }

    // Check if document
    if (allowedDocTypes.test(extname.slice(1))) {
        return cb(null, true);
    }

    cb(new Error('Invalid file type. Only images (jpg, png, gif, webp) and documents (pdf, doc, docx, txt) are allowed.'));
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: fileFilter,
});

/**
 * Middleware for single file upload
 */
export const uploadSingle = upload.single('file');

/**
 * Middleware for multiple files upload (max 5)
 */
export const uploadMultiple = upload.array('files', 5);

/**
 * Clean up temp file after upload
 * @param {string} filePath - Path to temp file
 */
export const cleanupTempFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Temp file deleted: ${filePath}`);
        }
    } catch (error) {
        console.error('Error deleting temp file:', error);
    }
};

export default upload;
