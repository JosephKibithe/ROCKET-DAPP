"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

// Log connection attempts and status
const logDebugInfo = (msg) => {
  console.log(`[Web3Provider] ${msg}`);
};

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create wagmi config with proper WalletConnect initialization
const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    metaMask({
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    }),
    walletConnect({
      projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
        "default-project-id",
      metadata: {
        name: "ROCKET Prediction Market",
        description: "Next-gen prediction market on PulseChain",
        url: "https://rocket-web3.vercel.app",
        icons: ["https://rocket-web3.vercel.app/logo.png"],
      },
    }),
    coinbaseWallet({
      appName: "ROCKET Prediction Market",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
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
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      logDebugInfo("Web3StateSync initialized");
      logDebugInfo(
        `Initial connection state: ${
          isConnected ? "Connected" : "Disconnected"
        }`
      );
      isFirstMount.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && address) {
      logDebugInfo(`Wallet connected: ${address}`);
      logDebugInfo(`Chain: ${currentChain ? currentChain.name : "Unknown"}`);
      logDebugInfo(`Balance: ${balance ? balance.formatted : "0.0"}`);

      connectWallet(
        address,
        balance ? balance.formatted : "0.0",
        currentChain ? currentChain.name : "Unknown"
      );
    } else if (!isConnected) {
      logDebugInfo("Wallet disconnected");
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
