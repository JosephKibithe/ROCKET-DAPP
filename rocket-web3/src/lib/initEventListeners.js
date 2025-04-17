"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { setupEventListeners } from "../../lib/contract";
import { contractAddress } from "../../lib/wagmi";

export function InitEventListeners() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

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
          setInitialized(true);
          return unsubscribe;
        } else {
          unsubscribe?.();
        }
      } catch (error) {
        console.warn("Failed to setup event listeners:", error);
      }
    };

    initializeEventListeners().catch((error) => {
      console.warn("Error in event listener initialization:", error);
    });

    return () => {
      isSubscribed = false;
    };
  }, [publicClient, isConnected, initialized]);

  return null;
}

export default InitEventListeners;
