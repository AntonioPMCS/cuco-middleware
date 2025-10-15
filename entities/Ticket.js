/**
 * Ticket Model
 * Represents a single ticket instance with its own state and behavior
 * Uses Template Method pattern for ticket generation
 */
const { endianFlipHex } = require('../utils/bytes');

// Cuco epoch: 40 years after UNIX epoch (January 1, 2010)
const CUCO_EPOCH = new Date('2010-01-01T00:00:00.000Z').getTime() / 1000;

class Ticket {
  constructor({ version = '1', serialNumber, deviceKeys, deviceData = {}, defaults = {} }) {
    this.fields = {
      V: version,
      SN: serialNumber,
      CT: this.generateCTField(),
    };
    this.deviceKeys = deviceKeys;
    this.deviceData = deviceData;
    this.defaults = defaults;
  }

  /**
   * Generate CT field - current timestamp in hexadecimal format
   * Uses Cuco epoch (40 years after UNIX epoch)
   * @returns {string} - Current timestamp as hex string
   */
  generateCTField() {
    // Get current timestamp in seconds since Cuco epoch
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const customTimestamp = currentTimestamp - CUCO_EPOCH;
    // Convert to hexadecimal
    const hexTimestamp = customTimestamp.toString(16).toUpperCase();
    return hexTimestamp;
  }

  /**
   * Generate LD field - calculated timestamp for ticket lifetime
   * Formula: LD = Date.now() - CUCO_EPOCH + ticketlifetime
   * @param {number} ticketlifetime - Ticket lifetime in seconds
   * @returns {string} - LD field value as hex string
   */
  generateLDField(ticketlifetime) {
    // Convert Date.now() to seconds and calculate LD field
    const currentTimestampMs = Date.now();
    const currentTimestampSeconds = Math.floor(currentTimestampMs / 1000);
    
    const LD = currentTimestampSeconds - CUCO_EPOCH + ticketlifetime;
    
    // Convert to hexadecimal
    const hexLD = LD.toString(16).toUpperCase();
    
    return hexLD;
  }

  /**
   * Add a field to the ticket
   * @param {string} key - Field key
   * @param {*} value - Field value
   */
  addField(key, value) {
    if (value !== undefined && value !== null) {
      this.fields[key] = value;
    }
  }

  /**
   * Serialize the ticket to string format with authenticator
   * @param {Object} cryptoService - Cryptographic service instance
   * @returns {Promise<string>} - Serialized ticket string
   */
  async serialize(cryptoService) {
    // Create data array in the same format as the old implementation
    const data = Object.entries(this.fields).map(([key, value]) => [key, value]);
    
    // Serialize using the same format as serializeData (with trailing newline)
    const ticketString = data
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';

    const secretKey = endianFlipHex(this.deviceKeys.AK);
    console.log("Secret Key: ", secretKey,"\n");
    const hash = endianFlipHex(await cryptoService.hmacSha256Hex(ticketString, secretKey));

    return `${ticketString}Authenticator=HMAC-SHA256 ${hash}`;
  }


  /**
   * Get a field value with fallback to defaults
   * @param {Object} deviceData - Device data from IPFS
   * @param {Object} defaults - Default values
   * @param {string} fieldName - Field name
   * @returns {string} - Field value or default
   */
  getFieldValue(fieldName) {
    return this.deviceData[fieldName] || this.defaults[fieldName] || '';
  }

  /**
   * Get a field value from the ticket
   * @param {string} fieldName - Field name
   * @returns {*} - Field value
   */
  getField(fieldName) {
    return this.fields[fieldName];
  }

  /**
   * Get all field names in the ticket
   * @returns {string[]} - Array of field names
   */
  getFieldNames() {
    return Object.keys(this.fields);
  }

  /**
   * Convert ticket to JSON representation
   * @returns {Object} - JSON representation of the ticket
   */
  toJSON() {
    return {
      fields: this.fields,
    };
  }
}

module.exports = Ticket;