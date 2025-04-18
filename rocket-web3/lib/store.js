import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Wallet state
  address: null,
  balance: "0.0",
  network: null,
  isConnected: false,

  // Wallet actions
  connectWallet: (address, balance, network) =>
    set({
      address,
      balance,
      network,
      isConnected: true,
    }),

  disconnectWallet: () =>
    set({
      address: null,
      balance: "0.0",
      network: null,
      isConnected: false,
    }),

  // UI state
  isWalletModalOpen: false,
  isBetCreationModalOpen: false,

  // UI actions
  toggleWalletModal: () =>
    set((state) => ({ isWalletModalOpen: !state.isWalletModalOpen })),
  toggleBetCreationModal: () =>
    set((state) => ({ isBetCreationModalOpen: !state.isBetCreationModalOpen })),
}));
