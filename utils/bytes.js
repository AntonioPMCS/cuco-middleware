// * Utility functions for bytes

/**
 * Convert hex string to bytes
 * @param {string} hex - The hex string to convert
 * @returns {Uint8Array} - The bytes array
 */
function hexToBytes(hex) {
    if (hex.length % 2) hex = "0" + hex;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i*2, 2), 16);
    }
    return bytes;
}


/**
 * Convert bytes to hex string
 * @param {Uint8Array} bytes - The bytes array to convert
 * @returns {string} - The hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Flip the bytes of a hex string
 * @param {string} hex - The hex string to flip
 * @returns {string} - The flipped hex string
 */
function flipHexBytes(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error("Hex string must have even length");
      }
    return hex.match(/../g).reverse().join("");
}


module.exports = {
  hexToBytes,
  bytesToHex,
  flipHexBytes
};
  