import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Interface for wallet-based authentication with Supabase
 */
export const walletAuth = {
  /**
   * Sign in with a web3 wallet by verifying a signature
   * @param {object} params - Parameters
   * @param {string} params.walletAddress - Ethereum wallet address
   * @param {string} params.signature - Signature of the message
   * @param {string} params.username - Optional username
   * @returns {Promise<{user: object, error: object}>} User data or error
   */
  async signInWithWallet({ walletAddress, signature, username }) {
    try {
      console.log("Signing in with wallet:", walletAddress);

      // Call register_wallet_user function
      const { data, error } = await supabase.rpc("register_wallet_user", {
        p_wallet_address: walletAddress,
        p_username: username,
      });

      if (error) throw error;

      // Set a custom session in localStorage
      localStorage.setItem(
        "wallet_session",
        JSON.stringify({
          walletAddress,
          user: data.user,
          timestamp: new Date().toISOString(),
        })
      );

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error signing in with wallet:", error);
      return { user: null, error };
    }
  },

  /**
   * Sign out the current wallet
   * @returns {Promise<{error: object}>} Error if any
   */
  async signOut() {
    try {
      // Clear the custom session
      localStorage.removeItem("wallet_session");
      return { error: null };
    } catch (error) {
      console.error("Error signing out wallet:", error);
      return { error };
    }
  },

  /**
   * Get the current session
   * @returns {object|null} Current session or null if not signed in
   */
  getSession() {
    try {
      const session = localStorage.getItem("wallet_session");
      if (!session) return null;

      const parsedSession = JSON.parse(session);

      // Check if session is expired (24 hours)
      const timestamp = new Date(parsedSession.timestamp);
      const now = new Date();
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("wallet_session");
        return null;
      }

      return parsedSession;
    } catch (error) {
      console.error("Error getting wallet session:", error);
      return null;
    }
  },

  /**
   * Generate a message for the user to sign with their wallet
   * @param {string} walletAddress - User's wallet address
   * @returns {string} Message to sign
   */
  generateSignMessage(walletAddress) {
    const timestamp = new Date().toISOString();
    return `Sign this message to authenticate with ROCKET Prediction Market.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
  },

  /**
   * Request wallet signature for authentication
   * @param {object} provider - Ethers provider (from MetaMask)
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<{signature: string, error: object}>} Signature or error
   */
  async requestSignature(provider, walletAddress) {
    try {
      if (!provider) throw new Error("No wallet provider found");
      if (!walletAddress) throw new Error("No wallet address provided");

      const message = this.generateSignMessage(walletAddress);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      return { signature, error: null };
    } catch (error) {
      console.error("Error requesting signature:", error);
      return { signature: null, error };
    }
  },

  /**
   * Check if user is connected to wallet and authenticated
   * @returns {boolean} True if connected and authenticated
   */
  isConnected() {
    return !!this.getSession();
  },

  /**
   * Get the current user
   * @returns {object|null} User object or null if not authenticated
   */
  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  /**
   * Get the current wallet address
   * @returns {string|null} Wallet address or null if not authenticated
   */
  getWalletAddress() {
    const session = this.getSession();
    return session ? session.walletAddress : null;
  },
};

export default walletAuth;
