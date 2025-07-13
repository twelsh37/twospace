"use client";
// frontend/components/ui/ErrorBoundary.tsx
// ErrorBoundary component for catching rendering errors in React components
// Provides a user-friendly fallback UI and logs errors for debugging
// Created as part of error handling improvements for production resilience

import React from "react";

// Define the props for the ErrorBoundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional custom fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMayError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    // For now, just log to the console
    // In production, consider sending to Sentry or similar
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default fallback UI
      return (
        <div className="p-4 m-4 bg-red-100 border border-red-400 rounded text-red-800 text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-2">
            An unexpected error occurred. Please try again or contact support.
          </p>
          {/* Show error details in development only */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="whitespace-pre-wrap text-left mt-2">
              <summary className="cursor-pointer">Error details</summary>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          )}
        </div>
      );
    }
    // Render children if no error
    return this.props.children;
  }
}

// Reasoning: This component is reusable, well-documented, and provides a clear fallback UI for production. It logs errors for debugging and can be extended for error reporting services.
