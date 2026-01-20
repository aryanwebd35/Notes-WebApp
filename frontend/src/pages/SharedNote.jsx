import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiCopy, FiLogIn, FiDownload, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import DOMPurify from 'dompurify';

const SharedNote = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cloning, setCloning] = useState(false);

    useEffect(() => {
        const fetchSharedNote = async () => {
            try {
                const { data } = await api.get(`/api/notes/shared/${token}`);
                setNote(data.note);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load shared note');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedNote();
    }, [token]);

    const handleCloneNote = async () => {
        if (!user) {
            // Redirect to login with return url
            navigate('/login', { state: { returnUrl: `/shared/${token}` } });
            return;
        }

        if (!confirm('Save this note to your account?')) return;

        setCloning(true);
        try {
            // Create a new note with the shared content
            await api.post('/api/notes', {
                title: `${note.title} (Copy)`,
                content: note.content,
                tags: note.tags,
            });
            alert('Note saved to your account!');
            navigate('/dashboard');
        } catch (err) {
            alert('Failed to save note');
        } finally {
            setCloning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <FiAlertCircle className="text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Unavailable</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link to="/" className="btn-primary">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold uppercase tracking-wider">
                            View Only
                        </span>
                        <p className="text-sm text-gray-500 hidden sm:block">
                            Shared by <span className="font-medium text-gray-900">{note.owner}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!user ? (
                            <Link
                                to="/login"
                                state={{ returnUrl: `/shared/${token}` }}
                                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                <FiLogIn /> Login to Save
                            </Link>
                        ) : (
                            <button
                                onClick={handleCloneNote}
                                disabled={cloning}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {cloning ? 'Saving...' : (
                                    <>
                                        <FiDownload /> Save Copy
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[60vh]">
                    <div className="p-6 sm:p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">{note.title}</h1>

                        <div
                            className="prose prose-lg max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                        />

                        {/* Attachments */}
                        {note.attachments && note.attachments.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Attachments ({note.attachments.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {note.attachments.map((att) => (
                                        <a
                                            key={att._id}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {att.type === 'image' ? '📷' : '📄'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {att.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(att.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedNote;
