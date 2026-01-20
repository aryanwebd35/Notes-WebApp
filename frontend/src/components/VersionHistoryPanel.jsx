import { useState, useEffect } from 'react';
import { FiClock, FiRotateCcw, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

/**
 * Version History Panel Component
 * 
 * Shows version timeline and allows restoring previous versions
 */
const VersionHistoryPanel = ({ note, isOpen, onClose, onRestore }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        if (isOpen && note) {
            fetchVersions();
        }
    }, [isOpen, note]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/notes/${note._id}/versions`);
            setVersions(data);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (versionId) => {
        if (!confirm('Restore this version? Current version will be saved.')) return;

        try {
            await api.post(`/api/notes/${note._id}/versions/${versionId}/restore`);
            onRestore?.();
            onClose();
        } catch (error) {
            alert('Failed to restore version');
        }
    };

    const viewVersion = async (versionId) => {
        try {
            const { data } = await api.get(`/api/notes/${note._id}/versions/${versionId}`);
            setSelectedVersion(data);
        } catch (error) {
            alert('Failed to load version');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FiClock size={24} className="text-primary-600 dark:text-primary-400" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Version History</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{note?.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Timeline */}
                    <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
                        {loading ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
                        ) : versions.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">No version history</p>
                        ) : (
                            <div className="space-y-2">
                                {versions.map((version) => (
                                    <div
                                        key={version._id}
                                        onClick={() => viewVersion(version._id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedVersion?._id === version._id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium ${selectedVersion?._id === version._id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                Version {version.versionNumber}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestore(version._id);
                                                }}
                                                className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                title="Restore"
                                            >
                                                <FiRotateCcw size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs ${selectedVersion?._id === version._id ? 'text-primary-600 dark:text-primary-400/80' : 'text-gray-500 dark:text-gray-500'}`}>
                                            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
                        {selectedVersion ? (
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{selectedVersion.title}</h3>
                                <div
                                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                                />
                                {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedVersion.tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm border border-gray-200 dark:border-gray-700">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                Select a version to preview
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
