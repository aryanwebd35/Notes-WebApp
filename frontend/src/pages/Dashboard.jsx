import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotes, setFilter } from '../redux/slices/notesSlice';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';

/**
 * Dashboard - Main Notes Application
 * 
 * Layout: 3-column desktop-first design
 * | Sidebar (250px) | Notes List (350px) | Editor (flex) |
 * 
 * Responsive: Collapses to single column on mobile
 */
const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { filter, searchQuery } = useSelector((state) => state.notes);
    const { user } = useSelector((state) => state.auth);

    // Only show gentle reminder for unverified users, don't force redirect
    useEffect(() => {
        if (user && !user.isVerified && user.authProvider === 'credentials') {
            console.warn('User not verified. Consider verifying email at /verify-email');
        }
    }, [user]);

    // Fetch notes on mount and when search changes
    // We fetch 'all' notes (archived and active) so sidebar counts are correct
    useEffect(() => {
        dispatch(fetchNotes({ archived: 'all', search: searchQuery }));
    }, [dispatch, searchQuery]); // Removed filter dependency to prevent refetching on filter change

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Notes List */}
            <NotesList />

            {/* Note Editor */}
            <NoteEditor />
        </div>
    );
};

export default Dashboard;
