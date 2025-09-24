/**
 * Timestamp utility functions
 * Handles timestamp generation and conversion for middleware
 */

// Custom epoch: 40 years after UNIX epoch (January 1, 2010)
const CUSTOM_EPOCH = new Date('2010-01-01T00:00:00.000Z').getTime() / 1000;

/**
 * Generate CT field - current timestamp in hexadecimal format
 * Uses custom epoch (40 years after UNIX epoch)
 * @returns {string} - Current timestamp as hex string
 */
function generateCTField() {
  // Get current timestamp in seconds since custom epoch
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const customTimestamp = currentTimestamp - CUSTOM_EPOCH;
  
  // Convert to hexadecimal
  const hexTimestamp = customTimestamp.toString(16);
  
  return hexTimestamp;
}

/**
 * Convert hex timestamp to readable date string (for debugging/verification)
 * @param {string} hexTimestamp - Hexadecimal timestamp
 * @returns {string} - Human readable date string
 */
function hexToDateString(hexTimestamp) {
  const decimalTimestamp = parseInt(hexTimestamp, 16);
  const unixTimestamp = decimalTimestamp + CUSTOM_EPOCH;
  const date = new Date(unixTimestamp * 1000);
  return date.toISOString();
}

/**
 * Convert decimal timestamp to hex
 * @param {number} decimalTimestamp - Decimal timestamp
 * @returns {string} - Hexadecimal timestamp
 */
function decimalToHex(decimalTimestamp) {
  return decimalTimestamp.toString(16);
}

/**
 * Convert hex timestamp to decimal
 * @param {string} hexTimestamp - Hexadecimal timestamp
 * @returns {number} - Decimal timestamp
 */
function hexToDecimal(hexTimestamp) {
  return parseInt(hexTimestamp, 16);
}

/**
 * Get the custom epoch timestamp
 * @returns {number} - Custom epoch in seconds since UNIX epoch
 */
function getCustomEpoch() {
  return CUSTOM_EPOCH;
}

module.exports = {
  generateCTField,
  hexToDateString,
  decimalToHex,
  hexToDecimal,
  getCustomEpoch
};
