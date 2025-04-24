import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { getPredictionMarketContract } from "./contract";

// Create a Supabase client for logging events
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for server-side operations
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// Check if we're in development mode
const isDevelopmentMode = !supabase || process.env.NODE_ENV === "development";

/**
 * Log a contract event to Supabase
 * @param {string} eventName - The name of the event
 * @param {Object} eventData - The event data to log
 * @returns {Promise<Object>} - The logged event
 */
export async function logContractEvent(eventName, eventData) {
  if (isDevelopmentMode) {
    console.log(`[DEV] Logging contract event: ${eventName}`, eventData);
    return { id: "mock-event-id", ...eventData };
  }

  try {
    const { data, error } = await supabase
      .from("contract_events")
      .insert({
        event_name: eventName,
        event_data: eventData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log contract event: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error logging contract event:", error);
    // Throw a properly formatted error
    throw new Error(
      `Failed to log contract event: ${error.message || "Unknown error"}`
    );
  }
}

/**
 * Sync a prediction from contract to Supabase
 * @param {number} predictionId - The ID of the prediction
 * @param {Object} eventData - Additional data from the event
 * @returns {Promise<Object>} - The synced prediction
 */
export async function syncPredictionToSupabase(predictionId, eventData = {}) {
  if (isDevelopmentMode) {
    console.log(
      `[DEV] Syncing prediction to Supabase: ${predictionId}`,
      eventData
    );
    return { id: predictionId, ...eventData };
  }

  try {
    // Update or insert prediction in Supabase
    const { data, error } = await supabase
      .from("predictions")
      .upsert({
        id: predictionId,
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error syncing prediction to Supabase:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error syncing prediction to Supabase:", error);
    throw error;
  }
}

/**
 * Set up listeners for contract events
 * @param {ethers.Provider} provider - Provider to use for contract events
 * @param {string} contractAddress - Address of the contract to listen to
 * @returns {Object} - Object with unsubscribe method
 */
export function setupContractEventListeners(provider, contractAddress) {
  if (!provider || !contractAddress) {
    throw new Error(
      "Provider and contract address are required for event listeners"
    );
  }

  const contract = getPredictionMarketContract(provider, contractAddress);
  const listeners = [];

  // Wrap event handlers in try-catch blocks
  const safeEventHandler = (handler) => {
    return async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error("Error handling contract event:", error);
        // Let the error propagate so it can be caught by the error boundary
        throw new Error(
          `Contract event handler failed: ${error.message || "Unknown error"}`
        );
      }
    };
  };

  // Event handlers
  const predictionCreatedHandler = safeEventHandler(
    async (predictionId, question, creator, resolutionTime, event) => {
      await logContractEvent("PredictionCreated", {
        predictionId: predictionId.toString(),
        question,
        creator,
        resolutionTime: resolutionTime.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      });
    }
  );

  const stakeHandler = safeEventHandler(
    async (predictionId, optionIndex, user, amount, event) => {
      await logContractEvent("StakePlaced", {
        predictionId: predictionId.toString(),
        optionIndex: optionIndex.toString(),
        user,
        amount: amount.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      });
    }
  );

  const resolutionHandler = safeEventHandler(
    async (predictionId, winningOptionIndex, event) => {
      await logContractEvent("PredictionResolved", {
        predictionId: predictionId.toString(),
        winningOptionIndex: winningOptionIndex.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      });
    }
  );

  // Listen for RewardClaimed events
  const rewardListener = (predictionId, user, amount, event) => {
    const eventData = {
      predictionId: predictionId.toString(),
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    };

    logContractEvent("RewardClaimed", eventData);
  };

  // Set up event listeners with error handling
  try {
    contract.on("PredictionCreated", predictionCreatedHandler);
    listeners.push(["PredictionCreated", predictionCreatedHandler]);

    contract.on("StakePlaced", stakeHandler);
    listeners.push(["StakePlaced", stakeHandler]);

    contract.on("PredictionResolved", resolutionHandler);
    listeners.push(["PredictionResolved", resolutionHandler]);

    contract.on("RewardClaimed", rewardListener);
    listeners.push(["RewardClaimed", rewardListener]);

    return {
      unsubscribe: () => {
        listeners.forEach(([event, listener]) => {
          try {
            contract.off(event, listener);
          } catch (error) {
            console.warn(`Error removing listener for ${event}:`, error);
          }
        });
        console.log("Successfully unsubscribed from contract events");
      },
    };
  } catch (error) {
    console.error("Error setting up contract event listeners:", error);
    throw new Error(
      `Failed to setup contract event listeners: ${
        error.message || "Unknown error"
      }`
    );
  }
}

export default {
  logContractEvent,
  syncPredictionToSupabase,
  setupContractEventListeners,
};
