import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Passport Google OAuth Strategy Configuration
 * 
 * Google OAuth is optional - only configured if credentials are provided
 */

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth configured');

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Profile contains user info from Google
                    // We pass it to the controller via req.user
                    return done(null, profile);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.log('⚠️  Google OAuth disabled (no credentials provided)');
}

// Serialize user for session (not used with JWT, but required by Passport)
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
