/**
 * Contract Mocks
 * Mock functions for testing contract interactions without a real blockchain
 */

const mockFunctions = {
  estimateGas: null,
  deployContract: null,
  callContract: null,
};

const mockErrors = {
  estimateGas: null,
  deployContract: null,
  callContract: null,
};

/**
 * Mock a contract function with a return value
 * @param {string} functionName - The name of the function to mock
 * @param {any} returnValue - The value to return when the function is called
 * @param {Error} error - Optional error to throw
 */
export function mockContractFunction(functionName, returnValue, error = null) {
  if (!mockFunctions.hasOwnProperty(functionName)) {
    throw new Error(`Unknown function: ${functionName}`);
  }

  mockFunctions[functionName] = returnValue;
  mockErrors[functionName] = error;
}

/**
 * Mock a contract deployment
 * @param {string} address - The address of the deployed contract
 * @param {string} hash - The transaction hash
 */
export function mockDeployment(address, hash) {
  mockFunctions.deployContract = { address, hash };
}

/**
 * Clean up all mocks
 */
export function cleanUpMocks() {
  Object.keys(mockFunctions).forEach((key) => {
    mockFunctions[key] = null;
    mockErrors[key] = null;
  });
}

/**
 * Get a mock function result or throw the configured error
 * @param {string} functionName - The name of the function
 * @returns {any} The mocked return value
 */
export function getMockResult(functionName) {
  if (mockErrors[functionName]) {
    throw mockErrors[functionName];
  }

  return mockFunctions[functionName];
}

/**
 * Mock contract object for testing
 */
export const mockContract = {
  estimateGas: async (params) => {
    console.log("Mock estimateGas called with:", params);
    return getMockResult("estimateGas");
  },
  deploy: async (params) => {
    console.log("Mock deploy called with:", params);
    return getMockResult("deployContract");
  },
  call: async (method, params) => {
    console.log(`Mock call to ${method} with:`, params);
    return getMockResult("callContract");
  },
};
