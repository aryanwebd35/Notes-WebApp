import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cloudinary Configuration
 * 
 * Cloudinary is used for storing uploaded files (images, documents)
 * Benefits:
 * - CDN delivery for fast loading
 * - Automatic image optimization
 * - Transformations (resize, crop, format conversion)
 * - Free tier: 10GB storage, 25GB bandwidth/month
 */

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image' or 'raw' (for PDFs/docs)
 * @returns {Promise<object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = async (filePath, folder = 'notes-app', resourceType = 'auto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: resourceType,
            // For images: auto-optimize
            quality: 'auto',
            fetch_format: 'auto',
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('File upload failed');
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'raw'
 * @returns {Promise<object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error('File deletion failed');
    }
};

export default cloudinary;
