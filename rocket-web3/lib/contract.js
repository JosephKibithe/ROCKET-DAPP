import { ethers } from "ethers";
import { contractAddress } from "./wagmi";
import { logContractEvent, syncPredictionToSupabase } from "./eventLogger";

// Import ABI from artifacts (this will be generated after contract compilation)
// For now, let's use a placeholder and we'll update it once we compile the contract
const PredictionMarketABI = [
  // This is a simplified ABI - we'll replace it with the actual compiled ABI
  "function createPrediction(string memory _question, string[] memory _options, uint256 _resolutionTime) external",
  "function placeStake(uint256 _predictionId, uint256 _optionIndex) external payable",
  "function resolvePrediction(uint256 _predictionId, uint256 _winningOptionIndex) external",
  "function claimReward(uint256 _predictionId) external",
  "function getPredictionOptions(uint256 _predictionId) external view returns (tuple(string name, uint256 totalStaked)[] memory)",
  "function getUserStake(uint256 _predictionId, uint256 _optionIndex, address _user) external view returns (uint256)",
  "event PredictionCreated(uint256 indexed predictionId, string question, address creator, uint256 resolutionTime)",
  "event StakePlaced(uint256 indexed predictionId, uint256 optionIndex, address user, uint256 amount)",
  "event PredictionResolved(uint256 indexed predictionId, uint256 winningOptionIndex)",
  "event RewardClaimed(uint256 indexed predictionId, address user, uint256 amount)",
];

/**
 * Deploy the PredictionMarket contract
 * @param {ethers.Signer} signer - The signer to deploy the contract
 * @returns {Promise<ethers.Contract>} - The deployed contract
 */
export async function deployPredictionMarket(signer) {
  // Get the compiled contract factory
  // In a real implementation, we would import the ABI and bytecode from the compiled contract
  // For now, we'll use ethers.js to compile the contract on the fly
  const PredictionMarketFactory = new ethers.ContractFactory(
    PredictionMarketABI,
    // This would be the bytecode, but we're simplifying for now
    "0x",
    signer
  );

  try {
    // Deploy the contract
    const contract = await PredictionMarketFactory.deploy();

    // Wait for deployment to complete
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    // Log the contract address
    console.log("PredictionMarket contract deployed to:", address);

    // Log deployment event
    await logContractEvent("ContractDeployed", {
      contractAddress: address,
      deployer: await signer.getAddress(),
      timestamp: Math.floor(Date.now() / 1000),
    });

    return contract;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
}

/**
 * Get an instance of the PredictionMarket contract
 * @param {ethers.Signer | ethers.Provider} signerOrProvider - A signer or provider to connect to the contract
 * @param {string} address - The contract address (optional, uses the one from .env if not provided)
 * @returns {ethers.Contract} - The contract instance
 */
export function getPredictionMarketContract(
  signerOrProvider,
  address = contractAddress
) {
  if (!address) {
    throw new Error(
      "Contract address is not defined. Please check your environment variables."
    );
  }

  return new ethers.Contract(address, PredictionMarketABI, signerOrProvider);
}

/**
 * Create a new prediction market
 * @param {ethers.Signer} signer - The signer to create the prediction
 * @param {string} question - The question for the prediction
 * @param {string[]} options - The options for the prediction
 * @param {number} resolutionTime - The resolution time timestamp
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export async function createPrediction(
  signer,
  question,
  options,
  resolutionTime
) {
  const contract = getPredictionMarketContract(signer);

  try {
    const tx = await contract.createPrediction(
      question,
      options,
      resolutionTime
    );
    const receipt = await tx.wait();

    // Find the PredictionCreated event in the receipt
    const event = receipt.logs
      .filter(
        (log) =>
          log.topics[0] ===
          ethers.id("PredictionCreated(uint256,string,address,uint256)")
      )
      .map((log) => contract.interface.parseLog(log))[0];

    if (event) {
      const predictionId = event.args[0];
      const creator = event.args[2];
      const resTime = event.args[3];

      // Log the event to Supabase
      await logContractEvent("PredictionCreated", {
        predictionId: predictionId.toString(),
        question,
        creator,
        resolutionTime: resTime.toString(),
        options,
        transactionHash: receipt.hash,
      });

      // Sync prediction to Supabase
      await syncPredictionToSupabase(predictionId.toString(), {
        question,
        creator,
        options: JSON.stringify(options),
        resolution_time: new Date(Number(resTime) * 1000).toISOString(),
        status: "active",
        transaction_hash: receipt.hash,
        created_at: new Date().toISOString(),
      });
    }

    // Return the prediction ID and other information
    return {
      predictionId: event.args[0],
      question: event.args[1],
      creator: event.args[2],
      resolutionTime: event.args[3],
      receipt,
    };
  } catch (error) {
    console.error("Error creating prediction:", error);
    throw error;
  }
}

/**
 * Place a stake on a prediction
 * @param {ethers.Signer} signer - The signer to place the stake
 * @param {number} predictionId - The ID of the prediction
 * @param {number} optionIndex - The index of the option to stake on
 * @param {ethers.BigNumber} amount - The amount to stake
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export async function placeStake(signer, predictionId, optionIndex, amount) {
  const contract = getPredictionMarketContract(signer);

  try {
    const tx = await contract.placeStake(predictionId, optionIndex, {
      value: amount,
    });
    const receipt = await tx.wait();

    // Find the StakePlaced event in the receipt
    const event = receipt.logs
      .filter(
        (log) =>
          log.topics[0] ===
          ethers.id("StakePlaced(uint256,uint256,address,uint256)")
      )
      .map((log) => contract.interface.parseLog(log))[0];

    if (event) {
      // Log the event to Supabase
      await logContractEvent("StakePlaced", {
        predictionId: predictionId.toString(),
        optionIndex: optionIndex.toString(),
        user: await signer.getAddress(),
        amount: amount.toString(),
        transactionHash: receipt.hash,
      });
    }

    return receipt;
  } catch (error) {
    console.error("Error placing stake:", error);
    throw error;
  }
}

/**
 * Resolve a prediction
 * @param {ethers.Signer} signer - The signer to resolve the prediction (must be the creator)
 * @param {number} predictionId - The ID of the prediction
 * @param {number} winningOptionIndex - The index of the winning option
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export async function resolvePrediction(
  signer,
  predictionId,
  winningOptionIndex
) {
  const contract = getPredictionMarketContract(signer);

  try {
    const tx = await contract.resolvePrediction(
      predictionId,
      winningOptionIndex
    );
    const receipt = await tx.wait();

    // Find the PredictionResolved event in the receipt
    const event = receipt.logs
      .filter(
        (log) =>
          log.topics[0] === ethers.id("PredictionResolved(uint256,uint256)")
      )
      .map((log) => contract.interface.parseLog(log))[0];

    if (event) {
      // Log the event to Supabase
      await logContractEvent("PredictionResolved", {
        predictionId: predictionId.toString(),
        winningOptionIndex: winningOptionIndex.toString(),
        resolver: await signer.getAddress(),
        transactionHash: receipt.hash,
      });

      // Sync prediction status to Supabase
      await syncPredictionToSupabase(predictionId.toString(), {
        winning_option_index: winningOptionIndex.toString(),
        status: "resolved",
        resolved_at: new Date().toISOString(),
        transaction_hash: receipt.hash,
      });
    }

    return receipt;
  } catch (error) {
    console.error("Error resolving prediction:", error);
    throw error;
  }
}

/**
 * Claim rewards for a prediction
 * @param {ethers.Signer} signer - The signer to claim the reward
 * @param {number} predictionId - The ID of the prediction
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export async function claimReward(signer, predictionId) {
  const contract = getPredictionMarketContract(signer);

  try {
    const tx = await contract.claimReward(predictionId);
    const receipt = await tx.wait();

    // Find the RewardClaimed event in the receipt
    const event = receipt.logs
      .filter(
        (log) =>
          log.topics[0] === ethers.id("RewardClaimed(uint256,address,uint256)")
      )
      .map((log) => contract.interface.parseLog(log))[0];

    if (event) {
      const amount = event.args[2];

      // Log the event to Supabase
      await logContractEvent("RewardClaimed", {
        predictionId: predictionId.toString(),
        user: await signer.getAddress(),
        amount: amount.toString(),
        transactionHash: receipt.hash,
      });
    }

    return receipt;
  } catch (error) {
    console.error("Error claiming reward:", error);
    throw error;
  }
}

/**
 * Get the options for a prediction
 * @param {ethers.Provider} provider - A provider to read from the contract
 * @param {number} predictionId - The ID of the prediction
 * @returns {Promise<Array<{name: string, totalStaked: ethers.BigNumber}>>} - The prediction options
 */
export async function getPredictionOptions(provider, predictionId) {
  const contract = getPredictionMarketContract(provider);

  try {
    return await contract.getPredictionOptions(predictionId);
  } catch (error) {
    console.error("Error getting prediction options:", error);
    throw error;
  }
}

/**
 * Get a user's stake on a prediction option
 * @param {ethers.Provider} provider - A provider to read from the contract
 * @param {number} predictionId - The ID of the prediction
 * @param {number} optionIndex - The index of the option
 * @param {string} userAddress - The address of the user
 * @returns {Promise<ethers.BigNumber>} - The user's stake
 */
export async function getUserStake(
  provider,
  predictionId,
  optionIndex,
  userAddress
) {
  const contract = getPredictionMarketContract(provider);

  try {
    return await contract.getUserStake(predictionId, optionIndex, userAddress);
  } catch (error) {
    console.error("Error getting user stake:", error);
    throw error;
  }
}

// Setup event listeners for the contract
export function setupEventListeners(provider, address = contractAddress) {
  if (!provider || !address) {
    console.warn(
      "Provider or contract address not provided, event listeners not set up"
    );
    return { unsubscribe: () => {} };
  }

  const { setupContractEventListeners } = require("./eventLogger");
  return setupContractEventListeners(provider, address);
}

export default {
  deployPredictionMarket,
  getPredictionMarketContract,
  createPrediction,
  placeStake,
  resolvePrediction,
  claimReward,
  getPredictionOptions,
  getUserStake,
  setupEventListeners,
};
