const https = require('https');

class IPFSService {
  constructor() {
    // Default IPFS gateway using path format
    this.gateway = 'gateway.pinata.cloud';
    console.log('✅ IPFS service initialized');
    console.log(`📋 IPFS Gateway: ${this.gateway}`);
  }

  async getFile(cid) {
    try {
      if (!cid) {
        throw new Error('CID parameter is required');
      }

      // Use path format: https://{gateway}/ipfs/{cid}
      const url = `https://${this.gateway}/ipfs/${cid}`;
      console.log(`🔍 Fetching IPFS file: ${url}`);

      const response = await this.fetchFromUrl(url);
      return response;
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
