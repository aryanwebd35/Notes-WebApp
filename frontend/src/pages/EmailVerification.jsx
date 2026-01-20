import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import OTPInput from 'react-otp-input';
import { FiMail, FiCheckCircle, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import api from '../services/api';

/**
 * Email Verification Page
 * 
 * Allows users to verify their email with 6-digit OTP
 * Features:
 * - OTP input with auto-focus
 * - Resend code with countdown
 * - Error handling
 * - Auto-redirect on success
 * - Max 3 attempts before logout
 * - Back to login button
 */
const EmailVerification = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 3;

    // Don't redirect if already verified - just show message
    const [alreadyVerified, setAlreadyVerified] = useState(false);

    useEffect(() => {
        if (user?.isVerified) {
            setAlreadyVerified(true);
        }
    }, [user]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && !loading) {
            handleVerify();
        }
    }, [otp]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter complete code');
            return;
        }

        if (attempts >= MAX_ATTEMPTS) {
            setError('Maximum attempts exceeded. Redirecting to login...');
            setTimeout(() => {
                dispatch(logout());
                navigate('/login');
            }, 2000);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/api/auth/verify-email', { code: otp });
            setSuccess(true);

            // Update user in Redux
            const { data } = await api.get('/api/auth/me');
            dispatch({ type: 'auth/updateUser', payload: data });

            // Redirect after 2 seconds
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            const remainingAttempts = MAX_ATTEMPTS - newAttempts;

            if (remainingAttempts > 0) {
                setError(`${err.response?.data?.message || 'Verification failed'}. ${remainingAttempts} attempt(s) remaining.`);
            } else {
                setError('Maximum attempts exceeded. Logging out...');
                setTimeout(() => {
                    dispatch(logout());
                    navigate('/login');
                }, 2000);
            }
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/api/auth/resend-verification');
            setResendCountdown(60); // 60 second countdown
            setOtp('');
            setAttempts(0); // Reset attempts on resend
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (alreadyVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Verified!</h2>
                    <p className="text-gray-600 mb-6">Your email is already verified.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary w-full"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={handleBackToLogin}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <FiArrowLeft size={20} />
                    <span className="text-sm font-medium">Back to Login</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail className="text-primary-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600 text-sm">
                        We've sent a 6-digit code to<br />
                        <span className="font-medium text-gray-900">{user?.email}</span>
                    </p>
                </div>

                {/* Attempts Warning */}
                {attempts > 0 && attempts < MAX_ATTEMPTS && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-yellow-800">
                            {MAX_ATTEMPTS - attempts} attempt(s) remaining
                        </p>
                    </div>
                )}

                {/* OTP Input */}
                <div className="mb-6">
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        renderSeparator={<span className="mx-2"></span>}
                        renderInput={(props) => (
                            <input
                                {...props}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={loading || attempts >= MAX_ATTEMPTS}
                            />
                        )}
                        shouldAutoFocus
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Resend Button */}
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={resendCountdown > 0 || loading}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                    </button>
                </div>

                {/* Info */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <FiAlertCircle size={14} />
                        <span>Code expires in 10 minutes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
