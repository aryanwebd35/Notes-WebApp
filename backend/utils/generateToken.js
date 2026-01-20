import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a signed JWT token with user ID as payload
 * 
 * @param {string} id - User's MongoDB _id
 * @returns {string} - Signed JWT token
 * 
 * Token contains:
 * - Payload: { id: user._id }
 * - Secret: From environment variable
 * - Expiration: Configured in .env (default 30 days)
 */
const generateToken = (id) => {
    return jwt.sign(
        { id }, // Payload
        process.env.JWT_SECRET, // Secret key
        {
            expiresIn: process.env.JWT_EXPIRE || '30d', // Expiration time
        }
    );
};

export default generateToken;
