import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Defines the structure for user documents in MongoDB
 * 
 * Fields:
 * - name: User's full name
 * - email: Unique email address (used for login)
 * - password: Hashed password (bcrypt)
 * - authProvider: Authentication method (credentials | google)
 * - isVerified: Email verification status (for Phase-2)
 * - createdAt: Auto-generated timestamp
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: function () {
                // Password required only for credentials auth
                return this.authProvider === 'credentials';
            },
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allow null values, but unique if present
        },
        authProvider: {
            type: String,
            enum: ['credentials', 'google'],
            default: 'credentials',
        },
        isVerified: {
            type: Boolean,
            default: false, // Email verification status
        },
        verificationCode: {
            type: String,
            select: false, // Don't return by default
        },
        verificationCodeExpiry: {
            type: Date,
            select: false,
        },
        refreshTokens: [{
            token: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
                expires: 604800, // 7 days in seconds
            }
        }],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save Middleware
 * Hashes the password before saving to database
 * Only runs if password is modified or new
 */
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Instance Method: matchPassword
 * Compares entered password with hashed password in database
 * @param {string} enteredPassword - Plain text password from login
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
