/**
 * Test Client
 * A mock client for testing blockchain interactions
 */

import { mockContract } from "./contractMocks";

/**
 * Set up a test client for blockchain interactions
 * @param {string} userAddress - The user's wallet address
 * @returns {Object} The test client
 */
export function setupTestClient(userAddress) {
  return {
    userAddress,
    contract: mockContract,

    /**
     * Estimate gas for a contract deployment
     * @param {Object} params - Contract parameters
     * @returns {bigint} Estimated gas
     */
    estimateContractGas: async (params) => {
      return mockContract.estimateGas({
        ...params,
        from: userAddress,
      });
    },

    /**
     * Deploy a contract
     * @param {Object} params - Contract parameters
     * @returns {Object} Deployment result
     */
    deployContract: async (params) => {
      const result = await mockContract.deploy({
        ...params,
        from: userAddress,
      });

      // If deployment was successful, simulate saving metadata
      if (result) {
        return {
          success: true,
          contractAddress: result.address,
          transactionHash: result.hash,
          metadata: {
            question: params.question,
            options: params.options,
            creator: userAddress,
            createdAt: new Date().toISOString(),
          },
        };
      }

      return {
        success: false,
        error: "Deployment failed",
      };
    },

    /**
     * Call a contract method
     * @param {string} method - Method name
     * @param {Object} params - Method parameters
     * @returns {any} Call result
     */
    callContract: async (method, params) => {
      return mockContract.call(method, {
        ...params,
        from: userAddress,
      });
    },
  };
}
