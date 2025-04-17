"use client";

import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { setupEventListeners } from "../../lib/contract";
import { contractAddress } from "../../lib/wagmi";

/**
 * Component to initialize contract event listeners
 * @returns {React.ReactElement} - Empty component for setup
 */
export function InitEventListeners() {
  const provider = useProvider();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only set up listeners if we have a provider and contract address
    if (!provider || !contractAddress) {
      console.warn(
        "Provider or contract address not available, skipping event listener setup"
      );
      return;
    }

    if (initialized) {
      return;
    }

    console.log("Setting up contract event listeners...");
    const { unsubscribe } = setupEventListeners(provider, contractAddress);
    setInitialized(true);

    // Clean up listeners on unmount
    return () => {
      console.log("Cleaning up contract event listeners...");
      unsubscribe();
    };
  }, [provider, initialized]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook to initialize contract event listeners
 */
export function useInitEventListeners() {
  const provider = useProvider();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only set up listeners if we have a provider and contract address
    if (!provider || !contractAddress) {
      console.warn(
        "Provider or contract address not available, skipping event listener setup"
      );
      return;
    }

    if (initialized) {
      return;
    }

    console.log("Setting up contract event listeners...");
    const { unsubscribe } = setupEventListeners(provider, contractAddress);
    setInitialized(true);

    // Clean up listeners on unmount
    return () => {
      console.log("Cleaning up contract event listeners...");
      unsubscribe();
    };
  }, [provider, initialized]);
}

export default InitEventListeners;
