"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  Award,
  ExternalLink,
  ArrowRight,
  LogOut,
  Copy,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useNetwork, useDisconnect } from "wagmi";
import { formatAddress, formatCurrency } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";
import WalletConnectModal from "./WalletConnectModal";

/**
 * WalletPanel component with tab-based layout for wallet information
 * @returns {JSX.Element} WalletPanel with tabs for wallet, history, and rewards
 */
export default function WalletPanel() {
  const [activeTab, setActiveTab] = useState("wallet");
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // wagmi hooks
  const { address, isConnecting, isConnected } = useAccount();
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address,
    enabled: Boolean(address),
    watch: true,
  });
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Global store for wallet state
  const { wallet, connectWallet, disconnectWallet } = useAppStore();

  // Sync wagmi state with our global store
  useEffect(() => {
    if (isConnected && address) {
      connectWallet(address, balanceData?.formatted, chain?.name);
    } else if (!isConnected) {
      disconnectWallet();
    }
  }, [
    isConnected,
    address,
    balanceData,
    chain,
    connectWallet,
    disconnectWallet,
  ]);

  // Mock data for history/transactions
  const transactions = [
    {
      id: 1,
      type: "Staked Prediction",
      amount: -50,
      title: "Will ETH reach $5k by EOY?",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "Claimed Reward",
      amount: 125,
      title: "PulseChain TPS > 1000 sustained?",
      time: "1 day ago",
    },
    {
      id: 3,
      type: "Created Prediction",
      amount: -10,
      title: "Will BTC reach $100k in 2024?",
      time: "3 days ago",
    },
  ];

  // Mock data for rewards
  const rewards = {
    total: 345.67,
    pending: [
      {
        id: 1,
        title: "Will SOL flip ETH market cap?",
        estimate: "75-120",
        resolves: "2 days",
      },
      {
        id: 2,
        title: "Will PLS reach $0.01 by June?",
        estimate: "30-45",
        resolves: "7 days",
      },
    ],
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open wallet connection modal
  const handleConnect = () => {
    setConnectError(null);
    setShowWalletModal(true);
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  // Handle balance refresh
  const handleRefreshBalance = () => {
    refetchBalance();
  };

  // Variants for tab animation
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // Open block explorer
  const openExplorer = () => {
    if (!address) return;

    const explorerUrl =
      chain?.blockExplorers?.default?.url || "https://etherscan.io";
    window.open(`${explorerUrl}/address/${address}`, "_blank");
  };

  return (
    <>
      <div className="bg-dark/30 p-6 rounded-lg border border-white/10">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "wallet"
                ? "text-primary border-b-2 border-primary"
                : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("wallet")}
          >
            <span className="flex items-center gap-2">
              <Wallet size={16} />
              Wallet
            </span>
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "history"
                ? "text-primary border-b-2 border-primary"
                : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <span className="flex items-center gap-2">
              <Clock size={16} />
              History
            </span>
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "rewards"
                ? "text-primary border-b-2 border-primary"
                : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("rewards")}
          >
            <span className="flex items-center gap-2">
              <Award size={16} />
              Rewards
            </span>
          </button>
        </div>

        {/* Tab Content with Animations */}
        <AnimatePresence mode="wait">
          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <motion.div
              key="wallet"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-white/60 mb-4">
                    Connect your wallet to participate in predictions
                  </p>
                  <button
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </button>

                  {connectError && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-400 flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <p>{connectError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-dark/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-white/60">Connected Wallet</p>
                      <p className="font-mono text-sm">
                        {formatAddress(address)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-white/60 hover:text-white p-1 rounded"
                        onClick={copyAddress}
                        title="Copy address"
                      >
                        {copied ? (
                          <span className="text-green-400 text-xs">
                            Copied!
                          </span>
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        className="text-white/60 hover:text-white p-1 rounded"
                        onClick={openExplorer}
                        title="View on explorer"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-2">Balance</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        {isBalanceLoading ? (
                          <span className="text-white/40">Loading...</span>
                        ) : (
                          <>
                            <span className="text-xl">
                              {formatCurrency(balanceData?.formatted, 4)}
                            </span>
                            <span className="text-secondary">
                              {balanceData?.symbol || "ETH"}
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        className="text-white/60 hover:text-white p-1 rounded"
                        onClick={handleRefreshBalance}
                        title="Refresh balance"
                        disabled={isBalanceLoading}
                      >
                        <RefreshCcw
                          size={16}
                          className={isBalanceLoading ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-2">Network</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          chain?.unsupported ? "bg-red-500" : "bg-green-500"
                        }`}
                      ></div>
                      <span>{chain?.name || "Unknown Network"}</span>
                      {chain?.unsupported && (
                        <span className="text-xs text-red-400">
                          (Unsupported)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
                      Send / Receive
                    </button>
                    <button
                      className="bg-dark/50 hover:bg-dark/70 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1"
                      onClick={handleDisconnect}
                    >
                      <LogOut size={16} />
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <p className="text-sm text-white/60 mb-4">Recent Transactions</p>

              {!isConnected ? (
                <div className="text-center py-6">
                  <p className="text-white/60 mb-4">
                    Connect your wallet to view transaction history
                  </p>
                  <button
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium"
                    onClick={() => setActiveTab("wallet")}
                  >
                    Go to Wallet
                  </button>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="border-b border-white/10 pb-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{tx.type}</span>
                        <span
                          className={
                            tx.amount > 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount} {balanceData?.symbol || "PLS"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{tx.title}</span>
                        <span>{tx.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  No transaction history yet
                </div>
              )}

              {isConnected && transactions.length > 0 && (
                <button className="flex items-center justify-center gap-1 text-primary hover:text-primary/80 mt-6 w-full">
                  View All <ArrowRight size={14} />
                </button>
              )}
            </motion.div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (
            <motion.div
              key="rewards"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {!isConnected ? (
                <div className="text-center py-6">
                  <p className="text-white/60 mb-4">
                    Connect your wallet to view rewards
                  </p>
                  <button
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium"
                    onClick={() => setActiveTab("wallet")}
                  >
                    Go to Wallet
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-lg mb-6">
                    <p className="text-sm text-white/80 mb-1">
                      Total Rewards Earned
                    </p>
                    <p className="text-2xl font-semibold">
                      {rewards.total} {balanceData?.symbol || "PLS"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-white/60">Pending Rewards</p>

                    {rewards.pending.length > 0 ? (
                      rewards.pending.map((reward) => (
                        <div
                          key={reward.id}
                          className="border-b border-white/10 pb-3"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{reward.title}</span>
                            <span className="text-secondary">
                              Est. {reward.estimate}{" "}
                              {balanceData?.symbol || "PLS"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/60">
                              Resolves in {reward.resolves}
                            </span>
                            <button className="px-3 py-1 bg-dark/50 hover:bg-dark text-white/80 rounded text-xs">
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-white/60">
                        No pending rewards
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onError={(error) => setConnectError(error)}
      />
    </>
  );
}
