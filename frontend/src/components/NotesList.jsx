import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiArchive, FiTrash2, FiPaperclip } from 'react-icons/fi';
import { setCurrentNote, updateNote, deleteNote } from '../redux/slices/notesSlice';
import { formatDistanceToNow } from '../utils/dateUtils';

/**
 * NotesList Component
 * Middle column showing list of notes
 */
const NotesList = () => {
    const dispatch = useDispatch();
    const { notes, currentNote, loading, filter } = useSelector((state) => state.notes);

    // Filter notes based on current filter
    let filteredNotes = notes;

    if (filter === 'archived') {
        filteredNotes = notes.filter(note => note.isArchived);
    } else if (filter === 'starred') {
        filteredNotes = notes.filter(note => note.isPinned && !note.isArchived);
    } else {
        // 'all' filter - show only active (non-archived) notes
        filteredNotes = notes.filter(note => !note.isArchived);
    }

    const handleSelectNote = (note) => {
        dispatch(setCurrentNote(note));
    };

    const handleTogglePin = async (e, note) => {
        e.stopPropagation();
        await dispatch(updateNote({
            id: note._id,
            updates: { isPinned: !note.isPinned }
        }));
    };

    const handleArchive = async (e, note) => {
        e.stopPropagation();
        await dispatch(updateNote({
            id: note._id,
            updates: { isArchived: !note.isArchived }
        }));
    };

    const handleDelete = async (e, note) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
            await dispatch(deleteNote(note._id));
        }
    };

    if (loading && filteredNotes.length === 0) {
        return (
            <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
                </h2>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FiStar size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {filter === 'starred' ? 'No starred notes' : 'No notes yet'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {filter === 'starred'
                                ? 'Star notes to see them here'
                                : 'Click "New Note" to create your first note'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredNotes.map((note) => (
                            <div
                                key={note._id}
                                onClick={() => handleSelectNote(note)}
                                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${currentNote?._id === note._id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                                    : ''
                                    }`}
                            >
                                {/* Title & Pin */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 flex-1">
                                        {note.title || 'Untitled'}
                                    </h3>
                                    <button
                                        onClick={(e) => handleTogglePin(e, note)}
                                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                    >
                                        <FiStar size={16} fill={note.isPinned ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                {/* Content Preview */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                                </p>

                                {/* Metadata */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{formatDistanceToNow(note.updatedAt)}</span>
                                    <div className="flex items-center gap-2">
                                        {note.attachments?.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <FiPaperclip size={12} />
                                                {note.attachments.length}
                                            </span>
                                        )}
                                        {note.tags?.length > 0 && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                {note.tags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={(e) => handleArchive(e, note)}
                                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                                    >
                                        <FiArchive size={14} />
                                        {note.isArchived ? 'Unarchive' : 'Archive'}
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, note)}
                                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                                    >
                                        <FiTrash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesList;
