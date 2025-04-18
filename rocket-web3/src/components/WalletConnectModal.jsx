"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  X,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect } from "wagmi";

export default function WalletConnectModal({ isOpen, onClose }) {
  const [error, setError] = useState(null);
  const { connectors, connectAsync, isPending, pendingConnector } = useConnect({
    onError: (error) => {
      console.error("Connection error:", error);
      setError(error.message || "Failed to connect wallet");
    },
    onSuccess: () => {
      onClose();
    },
  });

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  // Handle connect attempt
  const handleConnect = async (connector) => {
    try {
      setError(null);
      await connectAsync({ connector });
    } catch (err) {
      // Error is handled by the onError callback
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
            {/* Header */}
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

            {/* Modal content */}
            <div className="p-6">
              {/* Error message if present */}
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

              {/* Wallet list */}
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={!connector.ready || isPending}
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

                    {isPending && pendingConnector?.id === connector.id ? (
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

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  By connecting your wallet, you agree to our Terms of Service
                  and Privacy Policy
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helper functions to provide a better UX with recognizable wallet names and icons
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
  // Here you would ideally use proper SVG icons for each wallet
  // For simplicity we're using Lucide icons
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
