import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiShare2, FiX, FiCopy, FiCheck, FiMail, FiEye, FiEdit } from 'react-icons/fi';
import api from '../services/api';

/**
 * Share Modal Component
 * 
 * Allows sharing notes with other users or generating shareable links
 * Features:
 * - Share with user by email
 * - Permission selection (view/edit)
 * - Generate shareable link
 * - Copy link to clipboard
 * - Revoke access
 */
const ShareModal = ({ note, isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('view');
    const [shareLink, setShareLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleShareWithUser = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await api.post(`/api/notes/${note._id}/share`, { email, permission });
            setEmail('');
            setSuccessMessage(`Request sent to ${email}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`User "${email}" does not exist. Please ask them to create an account first.`);
            } else {
                setError(err.response?.data?.message || 'Failed to share note');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLink = async () => {
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post(`/api/notes/${note._id}/share-link`, {
                permission: 'view',
                expiresIn: 24, // 24 hours
            });
            setShareLink(data.shareUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevokeLink = async () => {
        if (!confirm('Revoke share link? Anyone with the link will lose access.')) return;

        setLoading(true);
        try {
            await api.delete(`/api/notes/${note._id}/share-link`);
            setShareLink('');
            alert('Share link revoked');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to revoke link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <FiShare2 className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Note</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{note.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                <FiCheck /> {successMessage}
                            </p>
                        </div>
                    )}

                    {/* Share with User */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share with User</h3>
                        <form onSubmit={handleShareWithUser} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Permission
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPermission('view')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${permission === 'view'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <FiEye size={18} />
                                        <span className="font-medium">View Only</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPermission('edit')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${permission === 'edit'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <FiEdit size={18} />
                                        <span className="font-medium">Can Edit</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sharing...' : 'Share Note'}
                            </button>
                        </form>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or</span>
                        </div>
                    </div>

                    {/* Share Link */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share Link</h3>

                        {!shareLink ? (
                            <button
                                onClick={handleGenerateLink}
                                disabled={loading}
                                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                            >
                                {loading ? 'Generating...' : 'Generate Share Link'}
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Share Link (expires in 24h)</p>
                                    <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{shareLink}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                    <button
                                        onClick={handleRevokeLink}
                                        className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shared With List */}
                    {note.sharedWith && note.sharedWith.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shared With</h3>
                            <div className="space-y-2">
                                {note.sharedWith.map((share) => (
                                    <div key={share._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{share.userId.email}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{share.permission}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Remove share access
                                                api.delete(`/api/notes/${note._id}/share/${share.userId._id}`)
                                                    .then(() => alert('Access removed'))
                                                    .catch(() => alert('Failed to remove access'));
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
