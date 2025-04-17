import { createConfig, http } from "wagmi";
import { mainnet, sepolia, pulsechain } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

// PulseChain network configuration (placeholder values)
// Update these values to the correct ones for PulseChain
// Not enabling pulsechain until we have the correct RPC URL
// For development, we'll use sepolia as the default chain

// Get WalletConnect project ID from environment variables
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Configure supported chains
const chains = [sepolia, mainnet];

// Create wagmi config
export const config = createConfig({
  chains,
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    metaMask(),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: "ROCKET Prediction Market",
    }),
  ],
});

// Get contract address from environment variables
export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Helper function to format cryptocurrency amounts
export function formatAmount(amount, decimals = 18) {
  if (!amount) return "0";

  // Convert from wei to eth (or equivalent)
  const value = parseFloat(amount) / Math.pow(10, decimals);

  // Format the number with appropriate decimals
  if (value < 0.000001) {
    return "< 0.000001";
  } else if (value < 0.001) {
    return value.toFixed(6);
  } else if (value < 1) {
    return value.toFixed(4);
  } else {
    return value.toFixed(2);
  }
}

// Export the configuration
export default {
  config,
  chains,
  contractAddress,
  formatAmount,
};
