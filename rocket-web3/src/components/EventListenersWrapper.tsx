"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EventListenersComponent = dynamic(
  () => import("../lib/initEventListeners"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function EventListenersWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Add global unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;

      // Specifically handle WalletConnect network errors
      if (
        reason instanceof Error &&
        reason.message.includes("NetworkError") &&
        (reason.stack?.includes("@walletconnect/modal-core") ||
          reason.stack?.includes("@walletconnect/modal-ui"))
      ) {
        console.warn("WalletConnect network error:", reason);
        setError(
          new Error(
            "Unable to connect to WalletConnect. Please check your internet connection and try again."
          )
        );
        event.preventDefault();
        return;
      }

      console.warn("Unhandled promise rejection:", reason);

      // Properly format the error message with enhanced error details
      let errorMessage = "An unexpected error occurred";
      if (reason instanceof Error) {
        errorMessage = reason.message;
      } else if (typeof reason === "string") {
        errorMessage = reason;
      } else if (reason && typeof reason === "object") {
        errorMessage = reason.message || JSON.stringify(reason);
      }

      setError(new Error(errorMessage));
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  if (error) {
    console.error("Error in EventListenersWrapper:", error);
    // Return a minimal error UI instead of null
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-md max-w-md mx-auto mt-4">
        <p>Something went wrong: {error.message}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={(error) => setError(error)}>
      <EventListenersComponent />
    </ErrorBoundary>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn("Event listeners error:", error, info);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
