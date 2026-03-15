import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore error JSON
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Security Protocol Violation: ${parsed.operationType.toUpperCase()} operation failed on ${parsed.path || 'unknown path'}.`;
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 p-8 rounded-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-500 uppercase tracking-tighter">System Breach Detected</h2>
              <p className="text-[11px] text-white/40 uppercase leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
