import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, guestLogin, clearError } from '../redux/slices/authSlice';
import { validateLoginForm } from '../utils/validation';
import Spinner from '../components/Spinner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Login Page
 * Handles user authentication
 * 
 * Features:
 * - Form validation
 * - Error handling
 * - Loading states
 * - Redirect after successful login
 */
const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);
    const { isDark, toggleDarkMode } = useDarkMode();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({});

    // Redirect if already logged in
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const returnUrl = location.state?.returnUrl || '/dashboard';
            navigate(returnUrl);
        }
    }, [user, navigate, location]);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear field error on change
        if (formErrors[e.target.name]) {
            setFormErrors({
                ...formErrors,
                [e.target.name]: '',
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateLoginForm(formData);
        if (!validation.isValid) {
            setFormErrors(validation.errors);
            return;
        }

        // Dispatch login action
        const result = await dispatch(login(formData));

        if (login.fulfilled.match(result)) {
            const returnUrl = location.state?.returnUrl || '/dashboard';
            navigate(returnUrl);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 sm:gap-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-white/50 dark:bg-black/50 hover:bg-white/80 dark:hover:bg-black/70 text-gray-700 dark:text-gray-300 transition-all backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <Link
                    to="/contact"
                    className="hidden sm:flex px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 border border-primary-800 rounded-lg transition-all shadow-md items-center gap-2"
                >
                    <span>Contact Me</span>
                </Link>
            </div>
            <div className="max-w-md w-full">{/* Header */}
                <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to access your notes
                    </p>
                </div>

                {/* Login Form */}
                <div className="card dark:bg-gray-900 dark:border-gray-700 animate-fadeIn">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Global Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                                placeholder="aryan@gmail.com"
                                disabled={loading}
                            />
                            {formErrors.email && (
                                <p className="error-text">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`input-field ${formErrors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            {formErrors.password && (
                                <p className="error-text">{formErrors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <a
                        href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                    </a>

                    {/* Guest Login Button */}
                    <button
                        type="button"
                        onClick={() => dispatch(guestLogin())}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 mt-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue as Guest</span>
                    </button>

                    {/* Sign Up Link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
            </div>
        </div>
    );
};

export default Login;
