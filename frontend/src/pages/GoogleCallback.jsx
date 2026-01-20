import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import Spinner from '../components/Spinner';

/**
 * GoogleCallback Component
 * Handles Google OAuth redirect
 * 
 * Flow:
 * 1. Google redirects to /auth/google/callback?token=xxx
 * 2. Extract token from URL
 * 3. Store in localStorage
 * 4. Update Redux state
 * 5. Redirect to dashboard
 */
const GoogleCallback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            // Handle error
            navigate(`/login?error=${error}`);
            return;
        }

        if (token) {
            // Store token
            localStorage.setItem('token', token);

            // Fetch user data
            // The token is already in localStorage, so the API will use it
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(user => {
                    // Update Redux state
                    const userData = { ...user, token };
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Dispatch login success (manually)
                    dispatch(login.fulfilled(userData));

                    // Redirect to dashboard
                    navigate('/dashboard');
                })
                .catch(error => {
                    console.error('Failed to fetch user:', error);
                    navigate('/login?error=auth_failed');
                });
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Completing Google sign-in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
