/**
 * Authentication Key Service
 * Simple file-based key-value store for device authentication keys
 * Stores device serial numbers and their corresponding authentication keys
 */

const fs = require('fs');
const path = require('path');

class AuthKeyService {
  constructor() {
    this.keysFile = path.join(__dirname, '..', 'storage', 'auth-keys.json');
    this.keys = {};
    this.loadKeys();
    console.log('✅ Authentication Key service initialized');
  }

  /**
   * Load authentication keys from file
   */
  loadKeys() {
    try {
      // Ensure storage directory exists
      const storageDir = path.dirname(this.keysFile);
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      // Load keys from file if it exists
      if (fs.existsSync(this.keysFile)) {
        const fileContent = fs.readFileSync(this.keysFile, 'utf8');
        this.keys = JSON.parse(fileContent);
        console.log(`📋 Loaded ${Object.keys(this.keys).length} authentication keys`);
      } else {
        console.log('📋 No authentication keys file found');
      }
    } catch (error) {
      console.error('❌ Error loading authentication keys:', error.message);
      this.keys = {};
    }
  }

  /**
   * Get authentication key for a device
   * @param {string} deviceSN - Device serial number
   * @returns {Object} - Object of keys ("AK" and "UK")
   */
  getKeys(deviceSN) {
    this.loadKeys();
    console.log("Keys: ", this.keys);
    return this.keys[deviceSN];
  }


  /**
   * List all devices with authentication keys
   * @returns {Object} - Object with device SNs as keys and auth keys as values
   */
  listAllKeys() {
    return { ...this.keys };
  }

  /**
   * Check if device has authentication key
   * @param {string} deviceSN - Device serial number
   * @returns {boolean} - True if device has auth key
   */
  hasAuthKey(deviceSN) {
    return this.keys.hasOwnProperty(deviceSN);
  }
}

module.exports = AuthKeyService;
