"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  X,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Coins,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import walletAuth from "@/lib/supabaseWalletAuth";
import { useAppStore } from "@/lib/store";

export default function WalletConnectModal({ isOpen, onClose }) {
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { connectWallet } = useAppStore();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { connectors, connectAsync, isPending, pendingConnector } = useConnect({
    onError: (error) => {
      console.error("Connection error:", error);
      setError(error.message || "Failed to connect wallet");
    },
    onSuccess: async (result) => {
      try {
        setIsRegistering(true);

        // Register the wallet with our backend
        if (result.account) {
          console.log("Registering wallet:", result.account);

          // Call our Supabase wallet auth
          const { user, error: authError } = await walletAuth.signInWithWallet({
            walletAddress: result.account,
            signature: "", // We're not requiring signatures for this simplified version
            username: `User_${result.account.substring(0, 6)}`,
          });

          if (authError) {
            console.error("Error registering wallet:", authError);
            setError(
              "Failed to register wallet with our database. Please try again."
            );
            disconnect();
            return;
          }

          console.log("Wallet registered successfully:", user);
        }
      } catch (err) {
        console.error("Error in onSuccess handler:", err);
        setError("An error occurred while completing wallet connection.");
        disconnect();
      } finally {
        setIsRegistering(false);
        onClose();
      }
    },
  });

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  // Handle connect attempt with error handling
  const handleConnect = async (connector) => {
    try {
      setError(null);
      console.log(
        "Attempting to connect with:",
        connector.id,
        "Ready status:",
        connector.ready
      );

      if (!connector.ready) {
        switch (connector.id) {
          case "metaMask":
            setError(
              "MetaMask is not installed or not detected. Please install MetaMask and refresh the page."
            );
            break;
          case "coinbaseWallet":
            setError(
              "Coinbase Wallet is not installed. Please install Coinbase Wallet to continue."
            );
            break;
          default:
            setError(
              "Wallet is not ready. Please make sure it's properly installed."
            );
        }
        return;
      }

      console.log("Connecting to:", connector.id);
      await connectAsync({ connector });
    } catch (err) {
      // Error is handled by the onError callback
      console.error("Connection attempt failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-dark/95 border border-white/10 rounded-lg w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Wallet className="text-primary" size={20} />
                Connect Wallet
              </h3>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-400 flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <p className="text-white/70 mb-6">
                Connect your wallet to participate in predictions, stake tokens,
                and claim rewards.
              </p>

              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={!connector.ready || isPending || isRegistering}
                    className={`
                      w-full flex justify-between items-center p-3 rounded-lg
                      ${
                        connector.ready
                          ? "bg-dark/50 hover:bg-dark/70"
                          : "bg-dark/20 cursor-not-allowed opacity-60"
                      }
                      transition-colors border border-white/10
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {getWalletIcon(connector.id)}
                      <div className="text-left">
                        <div className="font-medium">
                          {getWalletName(connector.id)}
                        </div>
                        {!connector.ready && (
                          <div className="text-xs text-red-400">
                            Not installed
                          </div>
                        )}
                      </div>
                    </div>

                    {(isPending && pendingConnector?.id === connector.id) ||
                    (isRegistering && isConnected) ? (
                      <Loader2
                        className="animate-spin text-primary"
                        size={20}
                      />
                    ) : (
                      <ChevronRight size={18} className="text-white/40" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  By connecting your wallet, you agree to our Terms of Service
                  and Privacy Policy
                </p>
              </div>

              {/* Exit Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 p-3 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                <span>Exit</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helper functions for wallet names and icons
function getWalletName(id) {
  const names = {
    metaMask: "MetaMask",
    coinbaseWallet: "Coinbase Wallet",
    walletConnect: "WalletConnect",
    injected: "Browser Wallet",
  };
  return names[id] || id;
}

function getWalletIcon(id) {
  switch (id) {
    case "metaMask":
      return (
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
      );
    case "coinbaseWallet":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Coins size={16} className="text-white" />
        </div>
      );
    case "walletConnect":
      return (
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
      );
  }
}
