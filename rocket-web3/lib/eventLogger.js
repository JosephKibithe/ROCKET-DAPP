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
      console.error("Error logging contract event:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error logging contract event:", error);
    throw error;
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
    console.error("Provider or contract address not provided");
    return { unsubscribe: () => {} };
  }

  const contract = getPredictionMarketContract(provider, contractAddress);

  // Keep track of listeners to remove them later
  const listeners = [];

  // Listen for PredictionCreated events
  const predictionCreatedListener = (
    predictionId,
    question,
    creator,
    resolutionTime,
    event
  ) => {
    const eventData = {
      predictionId: predictionId.toString(),
      question,
      creator,
      resolutionTime: resolutionTime.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    };

    logContractEvent("PredictionCreated", eventData);
    syncPredictionToSupabase(predictionId.toString(), {
      question,
      creator,
      resolution_time: new Date(resolutionTime * 1000).toISOString(),
      status: "active",
      transaction_hash: event.transactionHash,
    });
  };

  // Listen for StakePlaced events
  const stakeListener = (predictionId, optionIndex, user, amount, event) => {
    const eventData = {
      predictionId: predictionId.toString(),
      optionIndex: optionIndex.toString(),
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    };

    logContractEvent("StakePlaced", eventData);
  };

  // Listen for PredictionResolved events
  const resolutionListener = (predictionId, winningOptionIndex, event) => {
    const eventData = {
      predictionId: predictionId.toString(),
      winningOptionIndex: winningOptionIndex.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    };

    logContractEvent("PredictionResolved", eventData);
    syncPredictionToSupabase(predictionId.toString(), {
      winning_option_index: winningOptionIndex.toString(),
      status: "resolved",
      resolved_at: new Date().toISOString(),
      transaction_hash: event.transactionHash,
    });
  };

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

  // Add listeners to contract
  contract.on("PredictionCreated", predictionCreatedListener);
  listeners.push(["PredictionCreated", predictionCreatedListener]);

  contract.on("StakePlaced", stakeListener);
  listeners.push(["StakePlaced", stakeListener]);

  contract.on("PredictionResolved", resolutionListener);
  listeners.push(["PredictionResolved", resolutionListener]);

  contract.on("RewardClaimed", rewardListener);
  listeners.push(["RewardClaimed", rewardListener]);

  // Return unsubscribe function
  return {
    unsubscribe: () => {
      listeners.forEach(([event, listener]) => {
        contract.off(event, listener);
      });
      console.log("Unsubscribed from contract events");
    },
  };
}

export default {
  logContractEvent,
  syncPredictionToSupabase,
  setupContractEventListeners,
};
