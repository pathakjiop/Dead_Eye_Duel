import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cantina Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center z-50 bg-stone-950/95 text-desert-sand">
          <span className="text-4xl mb-3">🌵💀</span>
          <h2 className="text-2xl font-rye text-amber-400 mb-2">
            WHOA, PARTNER!
          </h2>
          <p className="text-xs font-mono text-desert-sand/80 max-w-xs mb-4">
            Something stirred up dust in the cantina:
          </p>
          <div className="bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono p-3 rounded mb-4 max-w-sm text-left overflow-auto max-h-32">
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-rye text-sm rounded shadow-lg"
          >
            RETURN TO CANTINA
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

