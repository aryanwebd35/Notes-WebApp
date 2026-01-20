import cron from 'node-cron';
import Note from '../models/Note.js';
import User from '../models/User.js';
import { sendReminderEmail } from './emailService.js';

/**
 * Reminder Scheduler Service
 * 
 * Uses node-cron to check for due reminders every minute
 * 
 * Architecture:
 * 1. Cron job runs every minute
 * 2. Query notes with reminderAt <= now and reminderStatus === 'pending'
 * 3. Send email to note owner
 * 4. Update reminderStatus to 'sent'
 * 
 * Why every minute?
 * - Sufficient precision for note reminders
 * - Low resource usage
 * - Simple implementation
 * 
 * Alternative approaches:
 * - Bull Queue: More complex, better for high-volume
 * - Agenda: MongoDB-based job scheduler
 * - AWS EventBridge: Cloud-based, scalable
 * 
 * For this app, cron is perfect balance of simplicity and functionality
 */

let isSchedulerRunning = false;

/**
 * Check and send due reminders
 */
const checkReminders = async () => {
    try {
        const now = new Date();

        // Find notes with due reminders
        const dueNotes = await Note.find({
            reminderAt: { $lte: now },
            reminderStatus: 'pending',
        }).populate('userId', 'email name');

        if (dueNotes.length === 0) {
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`Found ${dueNotes.length} due reminder(s)`);
        }

        // Process each reminder
        for (const note of dueNotes) {
            try {
                // Send email
                await sendReminderEmail(note.userId.email, {
                    title: note.title,
                    content: note.content,
                });

                // Update status
                note.reminderStatus = 'sent';
                await note.save();

                if (process.env.NODE_ENV !== 'production') {
                    console.log(`Reminder sent for note: ${note._id}`);
                }
            } catch (error) {
                console.error(`Failed to send reminder for note ${note._id}:`, error);
                // Don't throw - continue with other reminders
            }
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
};

/**
 * Start the reminder scheduler
 * Runs every minute: '* * * * *'
 * 
 * Cron format:
 * ┌────────────── second (optional, 0-59)
 * │ ┌──────────── minute (0-59)
 * │ │ ┌────────── hour (0-23)
 * │ │ │ ┌──────── day of month (1-31)
 * │ │ │ │ ┌────── month (1-12)
 * │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
 * │ │ │ │ │ │
 * * * * * * *
 */
export const startReminderScheduler = () => {
    if (isSchedulerRunning) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Reminder scheduler already running');
        }
        return;
    }

    // Run every minute
    cron.schedule('* * * * *', async () => {
        await checkReminders();
    });

    isSchedulerRunning = true;
    console.log('✅ Reminder scheduler started (runs every minute)');
};

/**
 * Stop the scheduler (for testing or shutdown)
 */
export const stopReminderScheduler = () => {
    isSchedulerRunning = false;
    console.log('Reminder scheduler stopped');
};

export default { startReminderScheduler, stopReminderScheduler };
