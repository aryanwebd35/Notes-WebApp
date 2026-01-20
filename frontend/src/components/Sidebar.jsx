import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFile, FiArchive, FiLogOut, FiStar, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import api from '../services/api';
import { logout } from '../redux/slices/authSlice';
import { setFilter, createNote } from '../redux/slices/notesSlice';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * Sidebar Component
 * Left navigation panel with filters and actions
 */
const Sidebar = ({ isOpen = false, onClose = () => { }, onOpenShareRequests = () => { }, refreshTrigger = 0 }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { filter, notes } = useSelector((state) => state.notes);
    const { isDark, toggleDarkMode } = useDarkMode();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchPendingCount();
        // Poll every 30 seconds
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, [refreshTrigger]); // Re-fetch when trigger changes

    const fetchPendingCount = async () => {
        try {
            const { data } = await api.get('/api/notes/share/pending');
            setPendingCount(data.length);
        } catch (error) {
            console.error('Failed to fetch pending shares', error);
        }
    };

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
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-white/80 backdrop-blur-xl dark:bg-gray-900 
                border-r border-gray-200 dark:border-gray-700 
                flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
                                <img src="/pencil.png" alt="Logo" className="w-full h-full object-cover" />
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
                    <button
                        onClick={onOpenShareRequests}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <div className="relative">
                            <FiBell size={18} />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                        <span className="flex-1 text-left font-medium">Share Requests</span>
                        {pendingCount > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                {pendingCount} new
                            </span>
                        )}
                    </button>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {user?.isGuest ? (
                        <div className="flex flex-col gap-2">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">Guest Account</p>
                                <p className="text-[10px] text-yellow-700 dark:text-yellow-300">Data will be lost on logout.</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
                            >
                                <FiLogOut size={16} />
                                <span>Login / Sign Up</span>
                            </button>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
