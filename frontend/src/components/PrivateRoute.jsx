import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from './Spinner';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * 
 * Usage:
 * <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 * 
 * Behavior:
 * - If user is authenticated: Render children
 * - If loading: Show spinner
 * - If not authenticated: Redirect to login
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) {
        return <Spinner fullScreen />;
    }

    return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
