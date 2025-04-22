/**
 * Bet Creation Flow Test
 * Tests the complete bet creation flow including:
 * - Gas estimation
 * - Contract deployment
 * - Metadata storage
 *
 * Run with: `npx vitest run test/betCreationTest.js`
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { parseEther } from "viem";
import {
  mockContractFunction,
  mockDeployment,
  cleanUpMocks,
} from "./mocks/contractMocks";
import { setupTestClient } from "./mocks/testClient";
import { detectSuspiciousTransaction } from "../src/lib/securityUtils";

// Test constants
const TEST_BET_QUESTION = "Will ETH reach $5000 by EOY 2023?";
const TEST_BET_OPTIONS = ["Yes", "No"];
const TEST_BET_RESOLUTION_TIME =
  Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
const TEST_STAKE_AMOUNT = 0.1; // ETH
const TEST_USER_ADDRESS = "0x1234567890123456789012345678901234567890";

// Mocked responses
const EXPECTED_GAS = 350000n;
const MOCK_CONTRACT_ADDRESS = "0xabcdef1234567890abcdef1234567890abcdef12";
const MOCK_TX_HASH =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

describe("Bet Creation Flow Tests", () => {
  let testClient;

  beforeAll(() => {
    console.log("Setting up bet creation flow tests...");
    testClient = setupTestClient(TEST_USER_ADDRESS);
  });

  beforeEach(() => {
    // Reset mocks between tests
    mockContractFunction("estimateGas", EXPECTED_GAS);
    mockContractFunction("deployContract", {
      hash: MOCK_TX_HASH,
      address: MOCK_CONTRACT_ADDRESS,
    });
  });

  afterAll(() => {
    console.log("Tearing down bet creation flow tests...");
    cleanUpMocks();
  });

  it("should estimate gas for contract deployment", async () => {
    try {
      // Call the gas estimation function
      const gasEstimate = await testClient.estimateContractGas({
        question: TEST_BET_QUESTION,
        options: TEST_BET_OPTIONS,
        resolutionTime: TEST_BET_RESOLUTION_TIME,
      });

      console.log("Gas estimate:", gasEstimate);

      // Verify gas estimate is within expected range
      expect(gasEstimate).toBe(EXPECTED_GAS);

      // Verify gas is not unreasonably high (protection against gas attacks)
      expect(gasEstimate).toBeLessThan(1000000n);
    } catch (error) {
      console.error("Gas estimation error:", error);
      throw error;
    }
  });

  it("should detect suspicious transactions", () => {
    // Normal transaction (0.1 ETH)
    const normalTx = {
      value: parseEther("0.1"),
      to: MOCK_CONTRACT_ADDRESS,
    };

    // Suspicious transaction (100 ETH)
    const suspiciousTx = {
      value: parseEther("100"),
      to: MOCK_CONTRACT_ADDRESS,
    };

    // Expected max value (1 ETH)
    const maxValue = parseEther("1");

    // Test the detection
    expect(detectSuspiciousTransaction(normalTx, maxValue)).toBe(false);
    expect(detectSuspiciousTransaction(suspiciousTx, maxValue)).toBe(true);
  });

  it("should deploy contract with correct parameters", async () => {
    try {
      // Deploy the contract
      const result = await testClient.deployContract({
        question: TEST_BET_QUESTION,
        options: TEST_BET_OPTIONS,
        resolutionTime: TEST_BET_RESOLUTION_TIME,
        stakeAmount: parseEther(TEST_STAKE_AMOUNT.toString()),
      });

      console.log("Deployment result:", result);

      // Verify contract was deployed
      expect(result.success).toBe(true);
      expect(result.contractAddress).toBe(MOCK_CONTRACT_ADDRESS);
      expect(result.transactionHash).toBe(MOCK_TX_HASH);

      // Verify metadata was stored
      expect(result.metadata.question).toBe(TEST_BET_QUESTION);
      expect(result.metadata.options).toEqual(TEST_BET_OPTIONS);
    } catch (error) {
      console.error("Contract deployment error:", error);
      throw error;
    }
  });

  it("should handle deployment failures gracefully", async () => {
    // Mock a deployment failure
    mockContractFunction(
      "deployContract",
      null,
      new Error("Insufficient funds")
    );

    try {
      await testClient.deployContract({
        question: TEST_BET_QUESTION,
        options: TEST_BET_OPTIONS,
        resolutionTime: TEST_BET_RESOLUTION_TIME,
        stakeAmount: parseEther(TEST_STAKE_AMOUNT.toString()),
      });

      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      console.log("Expected error caught:", error.message);
      expect(error.message).toContain("Insufficient funds");
    }
  });
});
