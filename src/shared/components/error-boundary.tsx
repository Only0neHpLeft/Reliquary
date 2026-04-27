import { Component, type ErrorInfo, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

// ─── Global Error Boundary ────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md text-center">
          <Sparkles className="mx-auto mb-6 h-10 w-10 text-foreground/20" />
          <h1 className="mb-3 text-xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-sm text-foreground/50">
            An unexpected error occurred. You can try again or reload the page.
          </p>
          {this.state.error && (
            <pre className="mb-6 max-h-24 overflow-auto rounded-lg bg-foreground/[0.03] p-3 text-left font-mono text-xs text-foreground/30">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="rounded-lg border border-foreground/10 px-5 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/[0.04]"
            >
              Try again
            </button>
            <button
              onClick={this.handleReload}
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ─── Route Error Fallback ─────────────────────────────────────────────────────

export function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <Sparkles className="mx-auto mb-4 h-8 w-8 text-foreground/15" />
      <h2 className="mb-2 text-lg font-bold text-foreground">Page failed to load</h2>
      <p className="mb-5 max-w-sm text-sm text-foreground/50">
        {error.message || "An error occurred while loading this page."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-foreground/10 px-4 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/[0.04]"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
