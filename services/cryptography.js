const crypto = require("crypto");
const { hexToBytes } = require("../utils/bytes");

class CryptographyService {
    constructor(keyHex) {
      // Use provided keyHex or fallback to a default key
      this.keyHex = keyHex || "4E8ADD61E02DCD2FDAD9457D9738E370";
      this.keyHex = flipHexBytes(this.keyHex);
    }

    /**
     * Generate HMAC-SHA256 hex string
     * @param {string} ticket - The ticket to hash
     * @returns {string} - The HMAC-SHA256 hex string
     */
    hmacSha256Hex(ticket) {
      const key = Buffer.from(this.keyHex, "hex");

      return crypto.createHmac("sha256", key)
              .update(ticket, "utf8")
              .digest("hex");
    }
}

module.exports = CryptographyService;