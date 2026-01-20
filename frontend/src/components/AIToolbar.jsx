import { useState } from 'react';
import { FiZap, FiFileText, FiTag, FiEdit3, FiX, FiCheck } from 'react-icons/fi';
import api from '../services/api';

/**
 * AI Toolbar Component
 * 
 * Provides AI-powered features in the note editor
 * Features:
 * - Generate title
 * - Summarize note
 * - Suggest tags
 * - Improve writing
 */
const AIToolbar = ({ note, onUpdate }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [previewType, setPreviewType] = useState('');

    const handleAIAction = async (action) => {
        setLoading(true);
        setPreview(null);

        try {
            let result;
            switch (action) {
                case 'title':
                    result = await api.post('/api/ai/generate-title', { content: note.content });
                    setPreview(result.data.title);
                    setPreviewType('title');
                    break;
                case 'summarize':
                    result = await api.post('/api/ai/summarize', { content: note.content });
                    setPreview(result.data.summary);
                    setPreviewType('summary');
                    break;
                case 'tags':
                    result = await api.post('/api/ai/suggest-tags', { content: note.content, title: note.title });
                    setPreview(result.data.tags);
                    setPreviewType('tags');
                    break;
                case 'improve':
                    result = await api.post('/api/ai/improve', { content: note.content });
                    setPreview(result.data.improved);
                    setPreviewType('improved');
                    break;
            }
            setShowMenu(false);
        } catch (error) {
            alert(error.response?.data?.message || 'AI request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        try {
            const updates = {};
            if (previewType === 'title') updates.title = preview;
            if (previewType === 'tags') updates.tags = preview;
            if (previewType === 'improved') updates.content = preview;

            await api.put(`/api/notes/${note._id}`, updates);
            onUpdate?.();
            setPreview(null);
        } catch (error) {
            alert('Failed to apply changes');
        }
    };

    return (
        <div className="relative">
            {/* AI Button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
                disabled={loading}
            >
                <FiZap size={16} />
                <span className="text-sm font-medium">AI</span>
            </button>

            {/* AI Menu */}
            {showMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
                    <button
                        onClick={() => handleAIAction('title')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        <FiFileText size={16} />
                        Generate Title
                    </button>
                    <button
                        onClick={() => handleAIAction('summarize')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        <FiFileText size={16} />
                        Summarize
                    </button>
                    <button
                        onClick={() => handleAIAction('tags')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        <FiTag size={16} />
                        Suggest Tags
                    </button>
                    <button
                        onClick={() => handleAIAction('improve')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        <FiEdit3 size={16} />
                        Improve Writing
                    </button>
                </div>
            )}

            {/* Preview Modal */}
            {preview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold">AI Suggestion</h3>
                            <button onClick={() => setPreview(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {previewType === 'tags' ? (
                                <div className="flex flex-wrap gap-2">
                                    {preview.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : previewType === 'summary' ? (
                                <div className="prose max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm">{preview}</pre>
                                </div>
                            ) : (
                                <p className="text-gray-900">{preview}</p>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-2">
                            <button onClick={handleApply} className="flex-1 btn-primary">
                                <FiCheck className="inline mr-2" />
                                Apply
                            </button>
                            <button onClick={() => setPreview(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600">
                    Processing...
                </div>
            )}
        </div>
    );
};

export default AIToolbar;
