/**
 * Timestamp utility functions
 * Handles timestamp generation and conversion for middleware
 */

// Cuco epoch: 40 years after UNIX epoch (January 1, 2010)
const CUCO_EPOCH = new Date('2010-01-01T00:00:00.000Z').getTime() / 1000;

/**
 * Generate CT field - current timestamp in hexadecimal format
 * Uses Cuco epoch (40 years after UNIX epoch)
 * @returns {string} - Current timestamp as hex string
 */
function generateCTField() {
  // Get current timestamp in seconds since Cuco epoch
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const customTimestamp = currentTimestamp - CUCO_EPOCH;
  
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
  const unixTimestamp = decimalTimestamp + CUCO_EPOCH;
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
 * Get the Cuco epoch timestamp
 * @returns {number} - Cuco epoch in seconds since UNIX epoch
 */
function getCucoEpoch() {
  return CUCO_EPOCH;
}

/**
 * Generate LD field - calculated timestamp for ticket lifetime
 * Formula: LD = Date.now() - CUCO_EPOCH + ticketlifetime
 * @param {number} ticketlifetime - Ticket lifetime in seconds
 * @returns {string} - LD field value as hex string
 */
function generateLDField(ticketlifetime) {
  // Convert Date.now() to seconds and calculate LD field
  const currentTimestampMs = Date.now();
  const currentTimestampSeconds = Math.floor(currentTimestampMs / 1000);
  // Log the values
  console.log("currentTimestampSeconds: ", currentTimestampSeconds);
  console.log("CUCO_EPOCH: ", CUCO_EPOCH);
  console.log("ticketlifetime: ", ticketlifetime);
  
  const LD = currentTimestampSeconds - CUCO_EPOCH + ticketlifetime;
  
  // Convert to hexadecimal
  const hexLD = LD.toString(16);

  //Log the LD field value
  console.log("LD field value: ", hexLD);
  
  return hexLD;
}

module.exports = {
  generateCTField,
  hexToDateString,
  decimalToHex,
  hexToDecimal,
  getCucoEpoch,
  generateLDField
};
