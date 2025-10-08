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
    async hmacSha256Hex(message, key) {
      console.log("Message: ", message);
      const encoder = new TextEncoder();
      const keyData = Buffer.from(key, "hex");
      const messageData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      console.log("Hash Hex: ", hashHex);
      return hashHex;
    }
}

module.exports = CryptographyService;