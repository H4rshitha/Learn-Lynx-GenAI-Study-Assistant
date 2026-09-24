import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Brain } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Learn-Lynx Caught Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-lg w-full bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl text-center relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-display text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                An unexpected component rendering issue occurred in Learn-Lynx. Your persistent study data remains safe in SQLite and ChromaDB.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reload Application
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/dashboard')}
                className="border-slate-700 hover:border-slate-500"
              >
                <Home className="w-4 h-4 mr-1.5" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
