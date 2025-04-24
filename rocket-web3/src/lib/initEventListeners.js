"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { setupEventListeners } from "../../lib/contract";
import { contractAddress } from "../../lib/wagmi";

export function InitEventListeners() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeFunction;

    const initializeEventListeners = async () => {
      if (!isConnected || !publicClient || !contractAddress) {
        return;
      }

      if (initialized) {
        return;
      }

      try {
        const { unsubscribe } = await setupEventListeners(
          publicClient,
          contractAddress
        );
        if (isSubscribed) {
          unsubscribeFunction = unsubscribe;
          setInitialized(true);
        } else {
          unsubscribe?.();
        }
      } catch (error) {
        console.error("Failed to setup event listeners:", error);
        if (isSubscribed) {
          // Format error message properly
          const errorMessage =
            error?.message ||
            (typeof error === "string"
              ? error
              : "Failed to initialize event listeners");
          setError(new Error(errorMessage));
        }
      }
    };

    // Handle initialization with proper error catching
    const handleInitialization = async () => {
      try {
        await initializeEventListeners();
      } catch (error) {
        console.error("Error in event listener initialization:", error);
        if (isSubscribed) {
          const errorMessage =
            error?.message ||
            (typeof error === "string"
              ? error
              : "Failed to initialize event listeners");
          setError(new Error(errorMessage));
        }
      }
    };

    handleInitialization();

    return () => {
      isSubscribed = false;
      if (unsubscribeFunction) {
        try {
          unsubscribeFunction();
        } catch (error) {
          console.error("Error unsubscribing from events:", error);
        }
      }
    };
  }, [publicClient, isConnected, initialized]);

  if (error) {
    throw error; // This will be caught by the ErrorBoundary in EventListenersWrapper
  }

  return null;
}

export default InitEventListeners;
