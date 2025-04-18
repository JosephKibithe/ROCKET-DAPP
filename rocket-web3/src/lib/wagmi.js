import { createConfig, configureChains } from "wagmi";
import { mainnet, pulsechain, hardhat } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, pulsechain, hardhat], // Include local hardhat for development
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "Your_Alchemy_Api_Key",
    }),
    publicProvider(),
  ]
);

// Set up connectors
const connectors = [
  new MetaMaskConnector({ chains }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: "ROCKET",
      headlessMode: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "Your_Project_Id",
    },
  }),
  new InjectedConnector({
    chains,
    options: {
      name: "Injected",
      shimDisconnect: true,
    },
  }),
];

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// PulseChain custom setup (if needed)
export const PulseChainConfig = {
  chainId: 369, // PulseChain mainnet
  name: "PulseChain",
  rpcUrls: {
    default: {
      http: ["https://rpc.pulsechain.com"],
      webSocket: ["wss://ws.pulsechain.com"],
    },
    public: {
      http: ["https://rpc.pulsechain.com"],
      webSocket: ["wss://ws.pulsechain.com"],
    },
  },
  blockExplorers: {
    default: { name: "PulseScan", url: "https://scan.pulsechain.com" },
  },
  nativeCurrency: {
    name: "Pulse",
    symbol: "PLS",
    decimals: 18,
  },
};

// Helper function to format addresses
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Helper function to format currency amounts
export const formatCurrency = (amount, decimals = 4) => {
  if (!amount) return "0";
  return parseFloat(amount).toFixed(decimals);
};

// RPC error handling
export const handleRpcError = (error) => {
  console.error("RPC Error:", error);

  // Common RPC errors and user-friendly messages
  if (error.message?.includes("insufficient funds")) {
    return "Insufficient funds for transaction.";
  }

  if (error.message?.includes("user rejected")) {
    return "Transaction rejected. Please try again.";
  }

  return "Transaction failed. Please try again later.";
};

// Chain switching
export const switchToPulseChain = async (connector) => {
  try {
    await connector.switchChain({ chainId: PulseChainConfig.chainId });
    return true;
  } catch (error) {
    console.error("Failed to switch to PulseChain:", error);

    // If chain not added, try to add it
    if (error.code === 4902) {
      try {
        await connector.addChain({ chain: PulseChainConfig });
        await connector.switchChain({ chainId: PulseChainConfig.chainId });
        return true;
      } catch (addError) {
        console.error("Failed to add PulseChain:", addError);
        return false;
      }
    }

    return false;
  }
};
