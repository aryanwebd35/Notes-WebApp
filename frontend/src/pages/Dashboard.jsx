import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotes, setFilter } from '../redux/slices/notesSlice';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';

import ShareRequests from '../components/ShareRequests';

/**
 * Dashboard - Main Notes Application
 * 
 * Responsive Layout:
 * Mobile (<768px): Single column, toggle between list/editor
 * Tablet (768-1024px): 2-column (sidebar + list OR editor)
 * Desktop (>1024px): 3-column (sidebar + list + editor)
 */
const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { filter, searchQuery, currentNote } = useSelector((state) => state.notes);
    const { user } = useSelector((state) => state.auth);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isShareRequestsOpen, setIsShareRequestsOpen] = useState(false);
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'editor'
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Only show gentle reminder for unverified users, don't force redirect
    useEffect(() => {
        if (user && !user.isVerified && user.authProvider === 'credentials') {
            console.warn('User not verified. Consider verifying email at /verify-email');
        }
    }, [user]);

    // Fetch notes on mount and when search changes
    useEffect(() => {
        dispatch(fetchNotes({ archived: 'all', search: searchQuery }));
    }, [dispatch, searchQuery]);

    // Auto-switch to editor on mobile when note is selected
    useEffect(() => {
        if (currentNote && window.innerWidth < 768) {
            setMobileView('editor');
        }
    }, [currentNote]);

    const handleShareUpdate = () => {
        dispatch(fetchNotes({ archived: 'all', search: searchQuery }));
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-gray-950">
            {/* Sidebar - Hidden on mobile by default, slide-in overlay */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenShareRequests={() => setIsShareRequestsOpen(true)}
                refreshTrigger={refreshTrigger}
            />

            {/* Notes List - Full width on mobile, fixed width on tablet/desktop */}
            <div className={`${mobileView === 'list' ? 'block' : 'hidden'} md:block`}>
                <NotesList onMobileMenuToggle={() => setIsSidebarOpen(true)} />
            </div>

            {/* Note Editor - Full screen on mobile when active */}
            <div className={`${mobileView === 'editor' ? 'block' : 'hidden'} md:block flex-1`}>
                <NoteEditor onMobileBack={() => setMobileView('list')} />
            </div>

            {/* Share Requests Modal */}
            <ShareRequests
                isOpen={isShareRequestsOpen}
                onClose={() => setIsShareRequestsOpen(false)}
                onUpdate={handleShareUpdate}
            />
        </div>
    );
};

export default Dashboard;
