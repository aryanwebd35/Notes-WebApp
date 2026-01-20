import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Passport Google OAuth Strategy Configuration
 * 
 * This configures Passport to use Google OAuth 2.0
 * 
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. Redirected to Google consent screen
 * 3. User approves
 * 4. Google redirects to callback URL with authorization code
 * 5. Passport exchanges code for access token
 * 6. Passport calls verify callback with user profile
 * 7. We return user object to req.user
 */

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

// Serialize user for session (not used with JWT, but required by Passport)
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
