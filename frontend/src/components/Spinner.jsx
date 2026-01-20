import React from 'react';

/**
 * Spinner Component
 * Loading indicator for async operations
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - fullScreen: boolean (default: false) - Center in viewport
 */
const Spinner = ({ size = 'md', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div
            className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin`}
            role="status"
            aria-label="Loading"
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Spinner;
