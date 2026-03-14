import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const reasonStr = String(event.reason);
    // Ignore benign Vite HMR websocket errors caused by the platform disabling HMR
    if (reasonStr.includes('WebSocket closed without opened') || reasonStr.includes('failed to connect to websocket')) {
      return;
    }

    if (event.reason instanceof Error) {
      this.setState({ hasError: true, error: event.reason });
    } else {
      this.setState({ hasError: true, error: new Error(String(event.reason)) });
    }
  };

  public componentDidMount() {
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  public componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.operationType && parsedError.error) {
            isFirestoreError = true;
            errorMessage = 'There was a problem accessing the database. You may not have the necessary permissions.';
          }
        }
      } catch (e) {
        // Not a JSON error, use default message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full bg-black/40 backdrop-blur-2xl border border-red-500/20 rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ShieldAlert size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
            <p className="text-zinc-400 mb-6">
              {errorMessage}
            </p>
            {isFirestoreError && (
              <p className="text-sm text-zinc-500 mb-6">
                Please check your network connection or contact support if the issue persists.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors"
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
