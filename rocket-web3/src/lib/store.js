import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Main app store using Zustand for state management
 * Manages global UI state like modals, authentication, and filters
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      isAuthModalOpen: false,
      isBetCreationModalOpen: false,
      activeBetId: null,
      isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
      sidebarCollapsed:
        typeof window !== "undefined" ? window.innerWidth < 1024 : false,

      // User Authentication State
      user: null,
      wallet: {
        address: null,
        balance: null,
        isConnected: false,
        network: null,
      },

      // Filter Parameters
      filterParams: {
        category: "all",
        status: "active",
        sortBy: "newest",
        search: "",
        timeRange: {
          startDate: null,
          endDate: null,
        },
      },

      // Recent viewed bets (for history)
      recentBets: [],

      // UI Actions
      toggleAuthModal: () =>
        set((state) => ({ isAuthModalOpen: !state.isAuthModalOpen })),
      toggleBetCreationModal: () =>
        set((state) => ({
          isBetCreationModalOpen: !state.isBetCreationModalOpen,
        })),
      setActiveBetId: (id) => set({ activeBetId: id }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobile: (isMobile) => set({ isMobile }),

      // Auth Actions
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Wallet Actions
      setWallet: (wallet) =>
        set((state) => ({
          wallet: { ...state.wallet, ...wallet },
        })),
      connectWallet: (address, balance, network) =>
        set({
          wallet: {
            address,
            balance,
            network,
            isConnected: true,
          },
        }),
      disconnectWallet: () =>
        set({
          wallet: {
            address: null,
            balance: null,
            network: null,
            isConnected: false,
          },
        }),

      // Filter Actions
      setFilterCategory: (category) =>
        set((state) => ({
          filterParams: { ...state.filterParams, category },
        })),
      setFilterStatus: (status) =>
        set((state) => ({
          filterParams: { ...state.filterParams, status },
        })),
      setFilterSortBy: (sortBy) =>
        set((state) => ({
          filterParams: { ...state.filterParams, sortBy },
        })),
      setFilterSearch: (search) =>
        set((state) => ({
          filterParams: { ...state.filterParams, search },
        })),
      setFilterTimeRange: (startDate, endDate) =>
        set((state) => ({
          filterParams: {
            ...state.filterParams,
            timeRange: { startDate, endDate },
          },
        })),
      resetFilters: () =>
        set({
          filterParams: {
            category: "all",
            status: "active",
            sortBy: "newest",
            search: "",
            timeRange: {
              startDate: null,
              endDate: null,
            },
          },
        }),

      // Recent bets tracking
      addRecentBet: (bet) =>
        set((state) => {
          // Don't add duplicates, move to the front if already exists
          const filteredBets = state.recentBets.filter((b) => b.id !== bet.id);
          return {
            recentBets: [bet, ...filteredBets].slice(0, 10), // Keep only the 10 most recent
          };
        }),
      clearRecentBets: () => set({ recentBets: [] }),
    }),
    {
      name: "rocket-app-store",
      partialize: (state) => ({
        user: state.user,
        wallet: state.wallet,
        filterParams: state.filterParams,
        recentBets: state.recentBets,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

/**
 * Store specifically for prediction data
 * Manages active predictions, user stakes, and related data
 */
export const usePredictionStore = create(
  persist(
    (set, get) => ({
      // Prediction Data
      predictions: [],
      userPredictions: [],
      isLoading: false,
      error: null,

      // Actions
      setPredictions: (predictions) => set({ predictions }),
      setUserPredictions: (userPredictions) => set({ userPredictions }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Data operations
      addPrediction: (prediction) =>
        set((state) => ({
          predictions: [prediction, ...state.predictions],
        })),
      updatePrediction: (id, updatedData) =>
        set((state) => ({
          predictions: state.predictions.map((p) =>
            p.id === id ? { ...p, ...updatedData } : p
          ),
        })),
      removePrediction: (id) =>
        set((state) => ({
          predictions: state.predictions.filter((p) => p.id !== id),
        })),

      // User prediction interactions
      addUserPrediction: (prediction) =>
        set((state) => ({
          userPredictions: [prediction, ...state.userPredictions],
        })),

      // Fetch predictions
      fetchPredictions: async () => {
        try {
          set({ isLoading: true, error: null });

          // In a real implementation, this would call your API
          // For now, we'll simulate a delay and return mock data
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock data - replace with actual API call
          const mockPredictions = [
            {
              id: "1",
              title: "Will ETH reach $5k by EOY?",
              category: "crypto",
              status: "active",
            },
            {
              id: "2",
              title: "Will Bitcoin break $100K in 2023?",
              category: "crypto",
              status: "active",
            },
            // Add more mock predictions as needed
          ];

          set({
            predictions: mockPredictions,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching predictions:", error);
          set({
            error: "Failed to load predictions",
            isLoading: false,
          });
        }
      },

      // Fetch user predictions
      fetchUserPredictions: async (userId) => {
        try {
          set({ isLoading: true, error: null });

          // In a real implementation, this would call your API
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock data - replace with actual API call
          const mockUserPredictions = [
            {
              id: "1",
              title: "Will ETH reach $5k by EOY?",
              stake: 50,
              option: "Yes",
            },
            {
              id: "3",
              title: "Will PulseChain break 1000 TPS?",
              stake: 25,
              option: "No",
            },
          ];

          set({
            userPredictions: mockUserPredictions,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching user predictions:", error);
          set({
            error: "Failed to load your predictions",
            isLoading: false,
          });
        }
      },

      // Clear all data (useful for logout)
      clearAll: () =>
        set({
          predictions: [],
          userPredictions: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "rocket-prediction-store",
      partialize: (state) => ({
        userPredictions: state.userPredictions,
      }),
    }
  )
);
