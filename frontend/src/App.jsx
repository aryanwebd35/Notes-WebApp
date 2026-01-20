import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import GoogleCallback from './pages/GoogleCallback';
import EmailVerification from './pages/EmailVerification';
import ContactUs from './pages/ContactUs';
import PrivateRoute from './components/PrivateRoute';

/**
 * Main App Component
 * Handles routing and navigation
 */
function App() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="App min-h-screen bg-gray-50">
            <Routes>
                {/* Root Route */}
                <Route
                    path="/"
                    element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/verify-email"
                    element={
                        <PrivateRoute>
                            <EmailVerification />
                        </PrivateRoute>
                    }
                />

                {/* 404 - Redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
