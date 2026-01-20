import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { DarkModeProvider } from './contexts/DarkModeContext';
import App from './App';
import './index.css';

/**
 * Application Entry Point
 * 
 * Wraps the app with:
 * - Redux Provider for state management
 * - BrowserRouter for routing
 * - DarkModeProvider for dark mode
 */

// Add error boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Something went wrong</h1>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>Reload</button>
                </div>
            );
        }

        return this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <Provider store={store}>
                <DarkModeProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </DarkModeProvider>
            </Provider>
        </ErrorBoundary>
    </React.StrictMode>
);
