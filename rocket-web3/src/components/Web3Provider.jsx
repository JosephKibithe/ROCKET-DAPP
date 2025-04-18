"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useAccount, useConnect, useBalance, useChainId } from "wagmi";
import { useEffect } from "react";
import { useAppStore } from "../../lib/store";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create wagmi config directly in the component
const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
});

export default function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3StateSync />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Web3StateSync() {
  const { connectWallet, disconnectWallet } = useAppStore();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address ?? undefined,
  });
  const chainId = useChainId();
  const currentChain = config.chains.find((chain) => chain.id === chainId);

  useEffect(() => {
    if (isConnected && address) {
      connectWallet(
        address,
        balance ? balance.formatted : "0.0",
        currentChain ? currentChain.name : "Unknown"
      );
    } else {
      disconnectWallet();
    }
  }, [
    address,
    balance,
    currentChain,
    connectWallet,
    disconnectWallet,
    isConnected,
  ]);

  return null;
}
