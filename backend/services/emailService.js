/**
 * Email Service - DISABLED
 * 
 * All email functionality has been disabled.
 * Functions return success without sending actual emails.
 */

// All email sending functions have been removed - email is disabled

/**
 * Main email sending function
 * Automatically chooses between Resend and SMTP
 * Prioritizes Resend if API key is available
 * 
 * @param {object} options - { to, subject, html }
 * @returns {Promise<object>} - Send result
 */
export const sendEmail = async (options) => {
  // Email functionality disabled - no email service configured
  console.log('📧 Email sending disabled (would have sent to:', options.to, ')');
  return { success: true, disabled: true };
};

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} name - User's name
 */
export const sendVerificationEmail = async (email, code, name) => {
  // Email verification disabled
  console.log('📧 Verification email disabled (would have sent to:', email, ')');
  return { success: true, disabled: true };
};

/**
 * Send reminder email
 * @param {string} email - Recipient email
 * @param {object} note - Note object with title and content
 */
export const sendReminderEmail = async (email, note) => {
  // Reminder emails disabled
  console.log('📧 Reminder email disabled (would have sent to:', email, ')');
  return { success: true, disabled: true };
};

export default { sendEmail, sendVerificationEmail, sendReminderEmail };
