import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';

/**
 * Generate 6-digit verification code
 * @returns {string} - 6-digit code
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash verification code for storage
 * @param {string} code - Plain verification code
 * @returns {string} - Hashed code
 */
const hashCode = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * @desc    Send verification email
 * @route   POST /api/auth/send-verification
 * @access  Private (requires login)
 * 
 * Sends a 6-digit OTP to user's email
 * Code expires in 10 minutes
 */
const sendVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Email already verified');
    }

    // Google users are auto-verified
    if (user.authProvider === 'google') {
        user.isVerified = true;
        await user.save();
        return res.json({ message: 'Google accounts are auto-verified' });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

    // Set expiry (10 minutes from now)
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save to database
    user.verificationCode = hashedCode;
    user.verificationCodeExpiry = expiry;
    await user.save();

    // Send email
    try {
        await sendVerificationEmail(user.email, code, user.name);
        res.json({
            message: 'Verification code sent to your email',
            expiresIn: '10 minutes',
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500);
        throw new Error('Failed to send verification email');
    }
});

/**
 * @desc    Verify email with code
 * @route   POST /api/auth/verify-email
 * @access  Private
 * 
 * Request Body:
 * {
 *   "code": "123456"
 * }
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Please provide verification code');
    }

    // Get user with verification fields
    const user = await User.findById(req.user._id).select('+verificationCode +verificationCodeExpiry');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        return res.json({ message: 'Email already verified' });
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
        res.status(400);
        throw new Error('No verification code found. Please request a new one.');
    }

    // Check if code expired
    if (new Date() > user.verificationCodeExpiry) {
        res.status(400);
        throw new Error('Verification code expired. Please request a new one.');
    }

    // Hash provided code and compare
    const hashedCode = hashCode(code);

    if (hashedCode !== user.verificationCode) {
        res.status(400);
        throw new Error('Invalid verification code');
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    res.json({
        message: 'Email verified successfully',
        isVerified: true,
    });
});

/**
 * @desc    Resend verification code
 * @route   POST /api/auth/resend-verification
 * @access  Private
 * 
 * Rate limited to 1 request per minute
 */
const resendVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+verificationCodeExpiry');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Email already verified');
    }

    // Check if last code was sent less than 1 minute ago
    if (user.verificationCodeExpiry) {
        const lastSent = new Date(user.verificationCodeExpiry.getTime() - 10 * 60 * 1000);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        if (lastSent > oneMinuteAgo) {
            res.status(429);
            throw new Error('Please wait before requesting a new code');
        }
    }

    // Generate new code
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = hashedCode;
    user.verificationCodeExpiry = expiry;
    await user.save();

    // Send email
    try {
        await sendVerificationEmail(user.email, code, user.name);
        res.json({
            message: 'New verification code sent',
            expiresIn: '10 minutes',
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500);
        throw new Error('Failed to send verification email');
    }
});

export {
    sendVerification,
    verifyEmail,
    resendVerification,
    generateVerificationCode,
    hashCode
};
