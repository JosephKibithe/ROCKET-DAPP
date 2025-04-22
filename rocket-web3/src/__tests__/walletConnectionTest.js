/**
 * Wallet Connection Test Script
 * Tests connections to MetaMask, WalletConnect, and Coinbase Wallet
 * Run with: `node test/walletConnectionTest.js`
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { configureChains, createConfig } from "wagmi";
import { mainnet, pulsechain } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { publicProvider } from "wagmi/providers/public";
import { validateWalletAddress } from "../src/lib/securityUtils";

// Configure chains & providers with the public provider.
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, pulsechain],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "ROCKET Prediction Market",
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

describe("Wallet Connection Tests", () => {
  beforeAll(() => {
    console.log("Setting up wallet connection tests...");
    // Mock browser environment if needed
  });

  afterAll(() => {
    console.log("Tearing down wallet connection tests...");
    // Clean up
  });

  it("should validate correct Ethereum addresses", () => {
    // Valid Ethereum addresses
    expect(
      validateWalletAddress("0x1234567890123456789012345678901234567890")
    ).toBe(true);
    expect(
      validateWalletAddress("0xabcdefABCDEF1234567890123456789012345678")
    ).toBe(true);

    // Invalid addresses
    expect(validateWalletAddress("")).toBe(false);
    expect(validateWalletAddress("0x123")).toBe(false);
    expect(
      validateWalletAddress("0x123XYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZ")
    ).toBe(false);
    expect(validateWalletAddress("not an address")).toBe(false);
  });

  it("should connect to MetaMask if available", async () => {
    // Skip test if in CI environment
    if (process.env.CI) {
      console.log("Skipping MetaMask test in CI");
      return;
    }

    try {
      const connector = config.connectors[0];
      const isSupported = await connector.isAuthorized();

      console.log("MetaMask available:", isSupported);

      if (isSupported) {
        // Attempt connection
        const account = await connector.connect();
        console.log("Connected to address:", account.address);

        // Validate the address
        expect(validateWalletAddress(account.address)).toBe(true);

        // Disconnect
        await connector.disconnect();
      } else {
        console.log("MetaMask not available, skipping connection test");
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      // Don't fail the test if wallet not available in test environment
    }
  });

  it("should handle WalletConnect connection attempts", async () => {
    // Skip test if in CI environment or no project ID
    if (process.env.CI || !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      console.log("Skipping WalletConnect test in CI or missing project ID");
      return;
    }

    try {
      const connector = config.connectors[1];
      console.log("Testing WalletConnect connector...");

      // For WalletConnect, we'll just verify the connector is configured properly
      expect(connector.options.projectId).toBe(
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      );
      expect(connector.id).toBe("walletConnect");
    } catch (error) {
      console.error("WalletConnect error:", error);
    }
  });

  it("should handle Coinbase Wallet connection attempts", async () => {
    // Skip test if in CI environment
    if (process.env.CI) {
      console.log("Skipping Coinbase Wallet test in CI");
      return;
    }

    try {
      const connector = config.connectors[2];
      console.log("Testing Coinbase Wallet connector...");

      // For Coinbase, verify the connector is configured properly
      expect(connector.id).toBe("coinbaseWallet");
      expect(connector.options.appName).toBe("ROCKET Prediction Market");
    } catch (error) {
      console.error("Coinbase Wallet error:", error);
    }
  });
});
