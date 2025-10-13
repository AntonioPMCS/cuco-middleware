const https = require('https');

class IPFSService {
  constructor() {
    // Load IPFS gateways from environment variable (comma-separated)
    // Falls back to default gateways if not set
    const defaultGateways = 'ipfs.io,dweb.link,cloudflare-ipfs.com';
    this.gateways = (process.env.IPFS_GATEWAYS || defaultGateways)
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);
    
    console.log('✅ IPFS service initialized');
    console.log(`📋 IPFS Gateways (${this.gateways.length}): ${this.gateways.join(', ')}`);
  }

  async getFile(cid) {
    try {
      if (!cid) {
        throw new Error('CID parameter is required');
      }

      // Try each gateway until one succeeds
      let lastError = null;
      for (const gateway of this.gateways) {
        try {
          const url = `https://${gateway}/ipfs/${cid}`;
          console.log(`🔍 Fetching IPFS file from ${gateway}: ${url}`);
          
          const response = await this.fetchFromUrl(url);
          console.log(`✅ Successfully fetched from ${gateway}`);
          return response;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch from ${gateway}: ${error.message}`);
          lastError = error;
          // Continue to next gateway
        }
      }

      // If all gateways failed, throw the last error
      throw new Error(`All IPFS gateways failed. Last error: ${lastError.message}`);
    } catch (error) {
      console.error('Error fetching IPFS file:', error);
      throw new Error(`Failed to fetch IPFS file: ${error.message}`);
    }
  }

  async fetchFromUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });

        response.on('error', (error) => {
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
}

module.exports = IPFSService;
