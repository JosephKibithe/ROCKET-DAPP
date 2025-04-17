"use client";

import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../../lib/wagmi";

/**
 * Web3Provider wraps the application with the necessary providers for Web3 functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider-wrapped components
 */
export default function Web3Provider({ children }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
