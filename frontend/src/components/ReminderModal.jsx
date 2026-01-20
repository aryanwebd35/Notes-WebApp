import { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiBell } from 'react-icons/fi';
import api from '../services/api';

/**
 * Reminder Modal Component
 * 
 * Allows users to set/edit/remove reminders for notes
 * Features:
 * - Date and time picker
 * - Quick presets (1 hour, tomorrow, next week)
 * - Remove reminder option
 */
const ReminderModal = ({ note, isOpen, onClose, onUpdate }) => {
    const [reminderDate, setReminderDate] = useState(
        note?.reminderAt ? new Date(note.reminderAt).toISOString().slice(0, 16) : ''
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSetReminder = async (e) => {
        e.preventDefault();

        if (!reminderDate) {
            setError('Please select a date and time');
            return;
        }

        const selectedDate = new Date(reminderDate);
        if (selectedDate <= new Date()) {
            setError('Reminder must be in the future');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/api/notes/${note._id}`, {
                reminderAt: selectedDate.toISOString(),
                reminderStatus: 'pending',
            });

            onUpdate?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set reminder');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveReminder = async () => {
        setLoading(true);
        try {
            await api.put(`/api/notes/${note._id}`, {
                reminderAt: null,
                reminderStatus: 'none',
            });

            onUpdate?.();
            onClose();
        } catch (err) {
            setError('Failed to remove reminder');
        } finally {
            setLoading(false);
        }
    };

    const setQuickReminder = (hours) => {
        const date = new Date();
        date.setHours(date.getHours() + hours);
        setReminderDate(date.toISOString().slice(0, 16));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FiBell className="text-primary-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Set Reminder</h2>
                            <p className="text-sm text-gray-500">{note?.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSetReminder} className="p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Quick Presets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Set
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setQuickReminder(1)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                1 Hour
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickReminder(24)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Tomorrow
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickReminder(168)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Next Week
                            </button>
                        </div>
                    </div>

                    {/* Date Time Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Date & Time
                        </label>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="datetime-local"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    </div>

                    {/* Current Reminder */}
                    {note?.reminderAt && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <FiClock className="inline mr-1" />
                                Current reminder: {new Date(note.reminderAt).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Setting...' : 'Set Reminder'}
                        </button>
                        {note?.reminderAt && (
                            <button
                                type="button"
                                onClick={handleRemoveReminder}
                                disabled={loading}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderModal;
