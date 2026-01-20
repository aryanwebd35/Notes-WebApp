import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service Configuration
 * 
 * Supports two options:
 * 1. Gmail SMTP (for development/testing)
 * 2. Resend API (recommended for production)
 * 
 * Gmail Setup:
 * - Enable 2FA on Gmail account
 * - Generate App Password
 * - Use app password in EMAIL_PASSWORD
 * 
 * Resend Setup:
 * - Sign up at resend.com
 * - Get API key
 * - Set RESEND_API_KEY in .env
 */

// Create transporter based on configuration
const createTransporter = () => {
  // Check if using Resend
  if (process.env.RESEND_API_KEY) {
    // Resend uses their API, not SMTP
    // We'll use fetch for Resend
    return null;
  }

  // Use Nodemailer with SMTP (Gmail or other)
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

/**
 * Send email using Nodemailer (SMTP)
 * @param {object} options - { to, subject, html }
 * @returns {Promise<object>} - Send result
 */
const sendEmailSMTP = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Notes App <noreply@notesapp.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
};

/**
 * Send email using Resend API
 * @param {object} options - { to, subject, html }
 * @returns {Promise<object>} - Send result
 */
const sendEmailResend = async (options) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Notes App <onboarding@resend.dev>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', {
        status: response.status,
        error: data,
      });
      throw new Error(`Resend API Error: ${data.message || 'Failed to send email'}`);
    }

    console.log('✅ Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

/**
 * Main email sending function
 * Automatically chooses between Resend and SMTP
 * Prioritizes Resend if API key is available
 * 
 * @param {object} options - { to, subject, html }
 * @returns {Promise<object>} - Send result
 */
export const sendEmail = async (options) => {
  try {
    // Prioritize Resend
    if (process.env.RESEND_API_KEY) {
      return await sendEmailResend(options);
    } else if (transporter) {
      return await sendEmailSMTP(options);
    } else {
      throw new Error('No email service configured. Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASSWORD');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} name - User's name
 */
export const sendVerificationEmail = async (email, code, name) => {
  const subject = 'Verify Your Email - Notes App';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: white; border: 2px dashed #0ea5e9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0ea5e9; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Notes App</h1>
          <p>Email Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for signing up. Please use the verification code below to verify your email address:</p>
          <div class="code">${code}</div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 Notes App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};

/**
 * Send reminder email
 * @param {string} email - Recipient email
 * @param {object} note - Note object with title and content
 */
export const sendReminderEmail = async (email, note) => {
  const subject = `Reminder: ${note.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .note-content { background: white; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Reminder</h1>
        </div>
        <div class="content">
          <h2>${note.title}</h2>
          <div class="note-content">
            ${note.content.substring(0, 500)}${note.content.length > 500 ? '...' : ''}
          </div>
          <p><a href="${process.env.CLIENT_URL}/dashboard" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Note</a></p>
        </div>
        <div class="footer">
          <p>© 2026 Notes App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};

export default { sendEmail, sendVerificationEmail, sendReminderEmail };
