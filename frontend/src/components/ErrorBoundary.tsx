import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-term-bg px-4 text-center">
          <p className="font-display text-xl uppercase tracking-wide text-term-danger">Something went wrong</p>
          <p className="max-w-md text-sm text-term-green/70">{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} className="terminal-button">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
