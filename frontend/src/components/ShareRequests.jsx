import { useState, useEffect } from 'react';
import { FiUser, FiCheck, FiX, FiBell } from 'react-icons/fi';
import api from '../services/api';

const ShareRequests = ({ isOpen, onClose, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen]);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/api/notes/share/pending');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (noteId, status) => {
        try {
            await api.post(`/api/notes/${noteId}/share/respond`, { status });
            // Remove from list locally
            setRequests(prev => prev.filter(req => req._id !== noteId));
            // Trigger update in parent to refresh notes list if accepted
            if (status === 'accepted' && onUpdate) {
                onUpdate();
            }
        } catch (error) {
            alert('Failed to respond to request');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FiBell className="text-primary-600" /> Share Requests
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No pending share requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 line-clamp-1">{req.title}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <FiUser size={12} /> {req.owner} ({req.ownerEmail})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleRespond(req._id, 'accepted')}
                                            className="flex-1 bg-primary-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <FiCheck /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(req._id, 'rejected')}
                                            className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <FiX /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareRequests;
