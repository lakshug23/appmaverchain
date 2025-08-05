import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a MetaMask connection error
    if (error.message && error.message.includes('MetaMask')) {
      return { 
        hasError: true, 
        error: 'MetaMask connection error. Please connect your wallet manually.' 
      };
    }
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900">
          <div className="text-center space-y-4 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white">Connection Error</h2>
            <p className="text-surface-300 mb-4">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 