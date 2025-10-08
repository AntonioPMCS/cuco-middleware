const crypto = require("crypto");
const { endianFlipHex } = require("../utils/bytes");

class CryptographyService {
    constructor() {

    }

    /**
     * Generate HMAC-SHA256 hex string
     * @param {string} ticket - The ticket to hash
     * @returns {string} - The HMAC-SHA256 hex string
     */
    hmacSha256Hex(ticket, keyString) {
      // Print the ticket to the console
      console.log("Ticket: ", ticket);
      const flippedKey = endianFlipHex(keyString);
      console.log("Flipped Key: ", flippedKey);
      const keyBytes = Buffer.from(flippedKey, "hex"); //Converts string to a buffer of bytes
      

      return crypto.createHmac("sha256", keyBytes)
              .update(ticket, "utf8")
              .digest("hex");
    }
}

module.exports = CryptographyService;