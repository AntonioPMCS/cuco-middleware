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
 * @param {string} hexStr - The hex string to flip
 * @returns {string} - The flipped hex string
 */
function endianFlipHex(hexStr) {
  //hexStr = hexStr.toLowerCase();
  if (hexStr.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }

  return hexStr.match(/../g).reverse().join("");
}

function padStr(str) {
  return str.toUpperCase().padStart(8, '0');
}

const extractFiveBytesHex = (hashHex) => {
  const bytes = Buffer.from(hashHex, 'hex');                 // 64 hex -> 32 bytes
  const offset = bytes.reduce((a, x) => a ^ x, 0) & 0x0f;    // XOR then mask 0x0f
  const extracted = Buffer.from(bytes.subarray(offset, offset + 5))
    .toString('hex')
    .toUpperCase();                                          // 5 bytes -> 10 hex chars
  return {offset, extracted}
};


module.exports = {
  hexToBytes,
  bytesToHex,
  endianFlipHex,
  padStr,
  extractFiveBytesHex
};
  