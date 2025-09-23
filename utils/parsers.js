// Utility functions for parsing various data formats

/**
 * Parse IPFS content string into JSON object
 * @param {string} ipfsContentString - Raw string content from IPFS
 * @returns {Object} - Parsed JSON object or error object
 */
function parseIPFSContent(ipfsContentString) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(ipfsContentString);
    return parsed;
  } catch (error) {
    console.error('Error parsing IPFS content as JSON:', error);
    // If JSON parsing fails, return the raw string wrapped in an object
    return { 
      raw: ipfsContentString,
      parseError: 'Failed to parse as JSON'
    };
  }
}

/**
 * Parse metadata string with newline-separated key=value pairs
 * @param {string} metadataString - String with key=value pairs separated by newlines
 * @returns {Object} - Parsed metadata object
 */
function parseMetadataString(metadataString) {
  try {
    // Split by newlines and parse each field
    const lines = metadataString.split('\n');
    const metadata = {};
    
    for (const line of lines) {
      if (line.trim() && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        metadata[key.trim()] = value;
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return { 
      raw: metadataString,
      parseError: 'Failed to parse metadata string'
    };
  }
}

module.exports = {
  parseIPFSContent,
  parseMetadataString
};
