import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }

    // Hook for Sentry / LogRocket — set onError prop to integrate
    if (typeof this.props.onError === "function") {
      this.props.onError(error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The workspace hit an unexpected UI error. Your document data is preserved on the server.
            </p>
            <Button type="button" className="mt-5" onClick={this.reset}>
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
