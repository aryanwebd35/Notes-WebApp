import { body, param, validationResult } from 'express-validator';

/**
 * Input Validation Middleware
 * 
 * Why: Prevents invalid data from reaching the database
 * - Data integrity
 * - Security (prevents injection)
 * - Better error messages
 */

/**
 * Validation Error Handler
 * Extracts validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

/**
 * Auth Validation Rules
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number'),

    validate,
];

export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    validate,
];

/**
 * Note Validation Rules
 */
export const createNoteValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),

    body('content')
        .optional()
        .isLength({ max: 50000 }).withMessage('Content too long'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),

    validate,
];

export const updateNoteValidation = [
    param('id')
        .isMongoId().withMessage('Invalid note ID'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),

    body('content')
        .optional()
        .isLength({ max: 50000 }).withMessage('Content too long'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),

    validate,
];

/**
 * Share Validation Rules
 */
export const shareNoteValidation = [
    param('id')
        .isMongoId().withMessage('Invalid note ID'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('permission')
        .optional()
        .isIn(['view', 'edit']).withMessage('Permission must be view or edit'),

    validate,
];

/**
 * AI Validation Rules
 */
export const aiContentValidation = [
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),

    validate,
];

export default {
    validate,
    registerValidation,
    loginValidation,
    createNoteValidation,
    updateNoteValidation,
    shareNoteValidation,
    aiContentValidation,
};
