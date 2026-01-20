import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { FiBold, FiItalic, FiCode, FiList, FiImage, FiPaperclip, FiShare2, FiBell, FiClock, FiUnderline, FiMail } from 'react-icons/fi';
import { updateNote, updateNoteOptimistic, uploadAttachment } from '../redux/slices/notesSlice';
import AIToolbar from './AIToolbar';
import ShareModal from './ShareModal';
import ReminderModal from './ReminderModal';
import VersionHistoryPanel from './VersionHistoryPanel';

/**
 * NoteEditor Component
 * Rich text editor using TipTap
 * Features: Auto-save, formatting toolbar, image upload
 */
const NoteEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentNote } = useSelector((state) => state.notes);
    const [title, setTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            // Image, // Disabled to remove images from text area as requested
            Underline,
            Placeholder.configure({
                placeholder: 'Start writing your note...',
            }),
        ],
        content: currentNote?.content || '',
        onUpdate: ({ editor }) => {
            // Auto-save on content change
            handleAutoSave(editor.getHTML());
        },
    });

    // Update editor when note changes
    useEffect(() => {
        if (currentNote) {
            setTitle(currentNote.title || '');
            editor?.commands.setContent(currentNote.content || '');
        }
    }, [currentNote?._id]);

    // Auto-save function with debounce
    useEffect(() => {
        if (!currentNote) return;

        const timeoutId = setTimeout(() => {
            if (title !== currentNote.title) {
                handleSave();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title]);

    const handleAutoSave = (content) => {
        if (!currentNote || content === currentNote.content) return;

        setSaveStatus('saving');

        // Optimistic update
        dispatch(updateNoteOptimistic({
            id: currentNote._id,
            updates: { content }
        }));

        // Debounced save
        setTimeout(async () => {
            await dispatch(updateNote({
                id: currentNote._id,
                updates: { content }
            }));
            setSaveStatus('saved');
        }, 1500);
    };

    const handleSave = async () => {
        if (!currentNote) return;

        setSaveStatus('saving');
        await dispatch(updateNote({
            id: currentNote._id,
            updates: { title, content: editor?.getHTML() || '' }
        }));
        setSaveStatus('saved');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !currentNote) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        try {
            const result = await dispatch(uploadAttachment({
                noteId: currentNote._id,
                file
            })).unwrap();

            // Insert image into editor - DISABLED per user request (only show as attachment)
            // editor?.chain().focus().setImage({ src: result.attachment.url }).run();
        } catch (error) {
            alert('Failed to upload image');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !currentNote) return;

        try {
            await dispatch(uploadAttachment({
                noteId: currentNote._id,
                file
            })).unwrap();
            alert('File uploaded successfully');
        } catch (error) {
            alert('Failed to upload file');
        }
    };

    if (!currentNote) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCode size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No note selected</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a note from the list or create a new one
                    </p>
                </div>
                <button
                    onClick={() => navigate('/contact')}
                    className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 border border-primary-800 rounded-lg transition-all shadow-md"
                >
                    <FiMail size={18} />
                    <span>Contact Me</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    placeholder="Note title..."
                    className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 mb-2"
                />
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {saveStatus === 'saving' ? 'Saving...' : 'All changes saved'}
                    </div>
                    <div className="flex items-center gap-2">
                        <AIToolbar note={currentNote} onUpdate={() => window.location.reload()} />
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                            title="Share"
                        >
                            <FiShare2 size={18} />
                        </button>
                        <button
                            onClick={() => setShowReminderModal(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                            title="Set Reminder"
                        >
                            <FiBell size={18} />
                        </button>
                        <button
                            onClick={() => setShowVersionHistory(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                            title="Version History"
                        >
                            <FiClock size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 border border-primary-800 rounded-lg transition-all shadow-md ml-2"
                            title="Contact Me"
                        >
                            <FiMail size={18} />
                            <span className="hidden sm:inline">Contact Me</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            {editor && (
                <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        title="Bold"
                    >
                        <FiBold size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        title="Italic"
                    >
                        <FiItalic size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        title="Underline"
                    >
                        <FiUnderline size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        title="Code"
                    >
                        <FiCode size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
                            }`}
                        title="Bullet List"
                    >
                        <FiList size={18} />
                    </button>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

                    <label className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-300" title="Upload Image">
                        <FiImage size={18} />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>

                    <label className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-300" title="Upload File">
                        <FiPaperclip size={18} />
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-6">
                <EditorContent
                    editor={editor}
                    className="prose dark:prose-invert max-w-none focus:outline-none"
                />

                {/* Attachments */}
                {currentNote.attachments && currentNote.attachments.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Attachments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentNote.attachments.map((attachment) => (
                                <a
                                    key={attachment._id}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-primary-500 dark:hover:border-primary-400 transition-all hover:shadow-lg"
                                >
                                    {attachment.type === 'image' ? (
                                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={attachment.url}
                                                alt={attachment.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-gray-400">Image not found</span></div>';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                            {attachment.name?.endsWith('.pdf') ? (
                                                <div className="text-center">
                                                    <svg className="w-16 h-16 mx-auto text-red-500 dark:text-red-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                                                        <text x="10" y="14" fontSize="6" textAnchor="middle" fill="currentColor" fontWeight="bold">PDF</text>
                                                    </svg>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">PDF Document</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <FiPaperclip size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Document</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-3 bg-white dark:bg-gray-900">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                                            {attachment.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(attachment.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ShareModal
                note={currentNote}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
            <ReminderModal
                note={currentNote}
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                onUpdate={() => window.location.reload()}
            />
            <VersionHistoryPanel
                note={currentNote}
                isOpen={showVersionHistory}
                onClose={() => setShowVersionHistory(false)}
                onRestore={() => window.location.reload()}
            />
        </div>
    );
};

export default NoteEditor;
