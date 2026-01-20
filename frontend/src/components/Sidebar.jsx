import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFile, FiArchive, FiLogOut, FiStar, FiMoon, FiSun } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import { setFilter, createNote, clearCurrentNote } from '../redux/slices/notesSlice';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * Sidebar Component
 * Left navigation panel with filters and actions
 */
const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { filter, notes } = useSelector((state) => state.notes);
    const { isDark, toggleDarkMode } = useDarkMode();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleCreateNote = async () => {
        await dispatch(createNote({
            title: 'Untitled Note',
            content: '',
            tags: [],
        }));
    };

    const activeNotes = notes.filter(n => !n.isArchived);
    const starredNotes = notes.filter(n => n.isPinned && !n.isArchived);
    const archivedNotes = notes.filter(n => n.isArchived);

    return (
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">📝</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notes</h1>
                    </div>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={isDark ? 'Light Mode' : 'Dark Mode'}
                    >
                        {isDark ? (
                            <FiSun className="text-yellow-500" size={18} />
                        ) : (
                            <FiMoon className="text-gray-600" size={18} />
                        )}
                    </button>
                </div>

                {/* Create Note Button */}
                <button
                    onClick={handleCreateNote}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    <FiPlus size={18} />
                    <span>New Note</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <button
                    onClick={() => dispatch(setFilter('all'))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${filter === 'all'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <FiFile size={18} />
                    <span className="flex-1 text-left font-medium">All Notes</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activeNotes.length}</span>
                </button>

                <button
                    onClick={() => dispatch(setFilter('starred'))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${filter === 'starred'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <FiStar size={18} />
                    <span className="flex-1 text-left font-medium">Starred</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{starredNotes.length}</span>
                </button>

                <button
                    onClick={() => dispatch(setFilter('archived'))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${filter === 'archived'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <FiArchive size={18} />
                    <span className="flex-1 text-left font-medium">Archived</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{archivedNotes.length}</span>
                </button>
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
