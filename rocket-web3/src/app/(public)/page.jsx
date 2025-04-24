"use client"; // Add this since we're using useState

import Link from "next/link";
import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import walletAuth from "@/lib/supabaseWalletAuth";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Create a simple modal component for the sign-in options
function AuthModal({ isOpen, onClose }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectAsync, connectors } = useConnect({
    onError: (err) => {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      setIsLoading(false);
    },
    onSuccess: async (result) => {
      try {
        if (result.account) {
          console.log("Registering wallet from modal:", result.account);

          // Call our Supabase wallet auth
          const { user, error: authError } = await walletAuth.signInWithWallet({
            walletAddress: result.account,
            signature: "", // We're not requiring signatures for this simplified version
            username: `User_${result.account.substring(0, 6)}`,
          });

          if (authError) {
            setError("Failed to register wallet. Please try again.");
            disconnect();
            return;
          }

          console.log("Wallet registered successfully:", user);
          // Redirect to browse page after success
          router.push("/browse");
        }
      } catch (err) {
        console.error("Error in onSuccess handler:", err);
        setError("An error occurred during wallet connection");
        disconnect();
      } finally {
        setIsLoading(false);
        onClose();
      }
    },
  });

  if (!isOpen) return null;

  const handleConnectMetaMask = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const metamaskConnector = connectors.find((c) => c.id === "metaMask");
      if (!metamaskConnector) {
        setError("MetaMask connector not found");
        setIsLoading(false);
        return;
      }
      await connectAsync({ connector: metamaskConnector });
    } catch (err) {
      console.error("MetaMask connection error:", err);
      setIsLoading(false);
      // Error is handled by onError callback
    }
  };

  const handleConnectCoinbase = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const coinbaseConnector = connectors.find(
        (c) => c.id === "coinbaseWallet"
      );
      if (!coinbaseConnector) {
        setError("Coinbase Wallet connector not found");
        setIsLoading(false);
        return;
      }
      await connectAsync({ connector: coinbaseConnector });
    } catch (err) {
      console.error("Coinbase Wallet connection error:", err);
      setIsLoading(false);
      // Error is handled by onError callback
    }
  };

  const handleConnectWalletConnect = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const walletConnectConnector = connectors.find(
        (c) => c.id === "walletConnect"
      );
      if (!walletConnectConnector) {
        setError("WalletConnect connector not found");
        setIsLoading(false);
        return;
      }
      await connectAsync({ connector: walletConnectConnector });
    } catch (err) {
      console.error("WalletConnect connection error:", err);
      setIsLoading(false);
      // Error is handled by onError callback
    }
  };

  const handleAnonymous = () => {
    // For now, just redirect to browse
    router.push("/browse");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-dark border-2 border-primary/50 rounded-lg p-8 max-w-md w-full mx-4 animate-fadeIn">
        <h2 className="text-2xl font-heading text-center text-primary mb-6">
          Connect Wallet
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={handleConnectMetaMask}
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7.5 13C7.5 14.38 8.62 15.5 10 15.5C11.38 15.5 12.5 14.38 12.5 13H15C15 14.38 16.12 15.5 17.5 15.5C18.88 15.5 20 14.38 20 13H11H7.5Z" />
              </svg>
            </span>
            {isLoading ? "Connecting..." : "MetaMask"}
          </button>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={handleConnectCoinbase}
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
              </svg>
            </span>
            {isLoading ? "Connecting..." : "Coinbase Wallet"}
          </button>

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={handleConnectWalletConnect}
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6ZM16 16H8V15C8 13.9 9.79 13 12 13C14.21 13 16 13.9 16 15V16Z" />
              </svg>
            </span>
            {isLoading ? "Connecting..." : "WalletConnect"}
          </button>

          <button
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={handleAnonymous}
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </span>
            Continue as Guest
          </button>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Exit button */}
        <button
          className="w-full mt-6 text-center text-white/60 hover:text-white py-2"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleConnectClick = () => {
    if (isConnected) {
      // If already connected, go directly to browse
      router.push("/browse");
    } else {
      // Otherwise show the auth modal
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark bg-[url('/stars-bg.svg')] bg-repeat">
      <div className="text-center px-6">
        {/* Anime/cartoon-inspired title with animation */}
        <h1
          className="text-6xl md:text-8xl font-heading font-bold mb-4 
                     bg-gradient-to-r from-primary via-pink-400 to-secondary 
                     bg-clip-text text-transparent 
                     animate-pulse drop-shadow-[0_0_15px_rgba(255,45,117,0.5)]"
        >
          ROCKET
        </h1>

        <p className="text-xl md:text-2xl mb-10 text-white/70 font-heading">
          The next-gen prediction market on PulseChain
        </p>

        {/* Connect Wallet button that opens auth modal */}
        <button
          onClick={handleConnectClick}
          className="bg-primary hover:bg-primary/90 text-white 
                    px-12 py-4 rounded-full text-lg font-medium
                    transition-all transform hover:scale-105 hover:-rotate-1
                    shadow-[0_4px_20px_rgba(255,45,117,0.4)] 
                    hover:shadow-[0_8px_30px_rgba(255,45,117,0.6)]
                    animate-bounce-subtle"
        >
          {isConnected ? "Enter App" : "Connect Wallet"}
        </button>

        {/* Subtle CTA text */}
        <p className="mt-6 text-gray-400 text-sm">
          Browse predictions without connecting or connect your wallet to
          participate
        </p>
      </div>

      {/* Flying rocket animation in bottom corner */}
      <div className="fixed bottom-10 right-10 animate-float hidden md:block">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/20 rounded-full animate-pulse"></div>
          <svg viewBox="0 0 24 24" className="w-16 h-16 text-primary">
            <path
              fill="currentColor"
              d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53Z"
            />
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-white/40 text-sm">
        &copy; {new Date().getFullYear()} ROCKET. All rights reserved.
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Custom animation keyframes would be defined in globals.css */}
      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
