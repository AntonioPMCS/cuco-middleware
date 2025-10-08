/**
 * Middleware Service
 * Acts as a bridge between blockchain/IPFS and client
 * Fetches, transforms, and organizes data for clean client responses
 */
const fs = require('fs');
const path = require('path');
const { generateCTField, generateLDField, hexToDateString } = require('../utils/timestamp');
const { serializeData } = require('../utils/parsers');

class MiddlewareService {
  constructor() {
    this.defaults = {};
    this.deviceDataMap = new Map();
    this.loadDefaults();
    console.log('✅ Middleware service initialized');
  }

  /**
   * Load default values from storage/defaults.json
   */
  loadDefaults() {
    try {
      const defaultsFile = path.join(__dirname, '..', 'storage', 'defaults.json');
      if (fs.existsSync(defaultsFile)) {
        const fileContent = fs.readFileSync(defaultsFile, 'utf8');
        this.defaults = JSON.parse(fileContent);
        console.log(`📋 Loaded ${Object.keys(this.defaults).length} default values`);
      } else {
        console.log('📋 No defaults file found');
      }
    } catch (error) {
      console.error('❌ Error loading defaults:', error.message);
      this.defaults = {};
    }
  }

  /**
   * Get field value with fallback to defaults
   * @param {string} fieldName - Field name (e.g., "BT", "BW", "SN")
   * @returns {string} - Field value or default
   */
  getFieldValue(fieldName) {
    // First try to get from IPFS content
    if (this.deviceDataMap && this.deviceDataMap.has(fieldName)) {
      return this.deviceDataMap.get(fieldName);
    }
    
    // Fallback to default value
    if (this.defaults[fieldName]) {
      return this.defaults[fieldName];
    }
    
    // If no default available, return empty string
    return '';
  }

  /**
   * Process complete middleware flow:
   * 1. Validate request parameters
   * 2. Fetch blockchain data
   * 3. Extract IPFS CID from metadata
   * 4. Fetch IPFS content
   * 5. Transform and organize data
   * 6. Return clean response
   */
  async processRequest(ethereumService, ipfsService, cryptoService, authKeyService, params) {
    try {
      const { s, d, t } = params;
      let sn = t;
      
      // Step 1: Validate request parameters
      if (t === 'checkme') {
        if (!s || !d) {
          return {
            success: false,
            error: 'Missing required parameters "s" and "d" for checkme request',
            statusCode: 400
          };
        } else {
          sn = s;
        }
      }
      
      // Step 2: Fetch blockchain data
      // TODO: Make this a single call using the multicall contract
      console.log('🔗 Fetching blockchain data...');
      const deviceAddress = await ethereumService.getDeviceBySn(sn);
      const deviceMetadata = await ethereumService.getDeviceMetadata(deviceAddress);
      const deviceState = await ethereumService.getDeviceState(deviceAddress);

      // Step 3: Extract CID and fetch IPFS content
      let ipfsContent = null;
      if (deviceMetadata && deviceMetadata.includes('/')) {
        console.log('❌ Device metadata is not a valid IPFS CID:', deviceMetadata);
        const cid = deviceMetadata.split('/')[2];
        console.log('❌ CID:', cid);
        console.log(`🔍 Fetching IPFS content for CID: ${cid}`);
        
        const ipfsContentString = await ipfsService.getFile(cid);
        ipfsContent = JSON.parse(ipfsContentString);
      }

      // Initialize deviceDataMap with IPFS content
      this.deviceDataMap = ipfsContent && ipfsContent.data ? new Map(ipfsContent.data) : new Map();
      
      // Step 4: Transform data for client
      const transformedData = this.transformDataForClient(deviceState, cryptoService, authKeyService, params, sn);
      
      return {
        success: true,
        data: transformedData
      };
      
    } catch (error) {
      console.error('Middleware processing error:', error);
      return {
        success: false,
        error: error.message,
        details: 'Failed to process blockchain and IPFS data'
      };
    }
  }

  /**
   * Transform IPFS content into clean client response
   * Adds middleware-specific fields and organizes data
   */
  transformDataForClient(deviceState, cryptoService, authKeyService, params, sn) {

    // Start with V=1 at position 0
    const data = [["V", "1"]];
    
    // Determine TT value based on 't' parameter and deviceState
    let ttValue;
    if (params.t === 'checkme') {
      ttValue = "S";
    } else {
      switch (deviceState) {
        case "0":
          ttValue = "F";
          break;
        case "1":
          ttValue = "N";
          break;
        case "2":
          ttValue = "B";
          break;
        default:
          ttValue = "Unknown";
          break;
      }
    }
    data.push(["TT", ttValue]);

    // Add specific fields from IPFS content in order, with defaults as fallback
    data.push(["BT", this.getFieldValue("BT")]);
    data.push(["BW", this.getFieldValue("BW")]);
    data.push(["SN", this.getFieldValue("SN")]);
    data.push(["CT", generateCTField()]);

    data.push(["LD", generateLDField(this.getFieldValue("ticketlifetime"))]);
    data.push(["TW", this.getFieldValue("TW")]); 
    data.push(["MaxUC", this.getFieldValue("MaxUC")]);

    // Add Authenticator field
    // Look up the key in auth-keys.json using the sn
    const key = authKeyService.getAuthKey(sn);
    const authenticator = cryptoService.hmacSha256Hex(serializeData(data), key);
    data.push(["Authenticator", authenticator]);

    return serializeData(data);
  }
}

module.exports = MiddlewareService;
