"use client";

/**
 * Security utilities for wallet connections and contract interactions
 * Includes validation, sanitization, and protection against common attacks
 */

/**
 * Validate wallet address to prevent malicious inputs
 * @param {string} address - Ethereum wallet address to validate
 * @returns {boolean} Whether the address is valid
 */
export function validateWalletAddress(address) {
  if (!address) return false;

  // Check if it's a valid Ethereum address format (0x followed by 40 hex chars)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) return false;

  // Additional checksum validation could be added here
  return true;
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return "";

  // Convert to string if not already
  const str = String(input);

  // Replace potentially dangerous characters
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\\/g, "&#92;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

/**
 * Rate limiting helper for API calls and contract interactions
 * @param {Function} fn - Function to rate limit
 * @param {number} limit - Number of calls allowed in the timeWindow
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Function} Rate limited function
 */
export function rateLimit(fn, limit = 5, timeWindow = 60000) {
  const calls = new Map();

  return function rateLimited(...args) {
    const now = Date.now();
    const caller = args[0]?.address || "anonymous";

    // Clean up old entries
    calls.forEach((timestamp, key) => {
      if (now - timestamp > timeWindow) {
        calls.delete(key);
      }
    });

    // Check if this caller has reached the limit
    const callerCalls = Array.from(calls.entries()).filter(([key]) =>
      key.startsWith(caller)
    ).length;

    if (callerCalls >= limit) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          (timeWindow - (now - calls.get(caller))) / 1000
        )} seconds.`
      );
    }

    // Add this call to the map
    calls.set(`${caller}:${now}`, now);

    // Call the original function
    return fn(...args);
  };
}

/**
 * Check for suspicious contract interactions
 * (e.g., transferring more funds than expected)
 * @param {Object} transaction - Transaction to validate
 * @param {number} expectedMaxValue - Maximum expected value
 * @returns {boolean} Whether the transaction is suspicious
 */
export function detectSuspiciousTransaction(transaction, expectedMaxValue) {
  if (!transaction || !transaction.value) return false;

  // Parse the transaction value
  const value =
    typeof transaction.value === "string"
      ? parseFloat(transaction.value)
      : transaction.value;

  // Check if the value exceeds the expected maximum
  if (value > expectedMaxValue) {
    console.warn("Suspicious transaction detected:", transaction);
    return true;
  }

  return false;
}
