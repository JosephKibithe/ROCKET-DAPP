import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Wallet state
  wallet: {
    address: null,
    balance: "0.0",
    network: null,
  },
  isConnected: false,

  // Wallet actions
  connectWallet: (address, balance, network) =>
    set({
      wallet: {
        address,
        balance,
        network,
      },
      isConnected: true,
    }),

  disconnectWallet: () =>
    set({
      wallet: {
        address: null,
        balance: "0.0",
        network: null,
      },
      isConnected: false,
    }),

  // Auth state
  user: null,
  isAuthenticated: false,

  // Auth actions
  signIn: (userData) =>
    set({
      user: userData,
      isAuthenticated: true,
    }),

  signOut: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  // UI state
  isWalletModalOpen: false,
  isBetCreationModalOpen: false,
  isSignInModalOpen: false,

  // UI actions
  toggleWalletModal: () =>
    set((state) => ({ isWalletModalOpen: !state.isWalletModalOpen })),
  toggleBetCreationModal: () =>
    set((state) => ({ isBetCreationModalOpen: !state.isBetCreationModalOpen })),
  toggleSignInModal: () =>
    set((state) => ({ isSignInModalOpen: !state.isSignInModalOpen })),
}));
