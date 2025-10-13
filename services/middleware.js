/**
 * Middleware Service
 * Acts as a bridge between blockchain/IPFS and client
 * Fetches, transforms, and organizes data for clean client responses
 */
const fs = require('fs');
const path = require('path');
const { generateCTField, generateLDField, hexToDateString } = require('../utils/timestamp');
const { serializeData } = require('../utils/parsers');
const { endianFlipHex } = require('../utils/bytes');

class MiddlewareService {
  constructor() {
    this.defaults = {};
    this.deviceData = {};
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
    return this.deviceData[fieldName] || this.defaults[fieldName] || '';
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
      let deviceAddress = "0x"+t.toLowerCase();
      
      // Step 1: Validate request parameters
      if (t === 'checkme') {
        if (!s || !d) {
          return {
            success: false,
            error: 'Missing required parameters "s" and "d" for checkme request',
            statusCode: 400
          };
        } else {
          deviceAddress = (await ethereumService.getDeviceBySn(s)).toLowerCase();
        }
      }
      
      // Step 2: Fetch blockchain data
      // TODO: Make this a single call using the multicall contract
      console.log('🔗 Fetching blockchain data...');
      const deviceState = await ethereumService.getDeviceState(deviceAddress);
      const deviceMetadata = await ethereumService.getDeviceMetadata(deviceAddress);


      // Step 3: Extract CID and fetch IPFS content
      if (deviceMetadata && deviceMetadata.includes('/')) {
        const cid = deviceMetadata.split('/')[2];
        console.log(`🔍 Fetching IPFS content for CID: ${cid}`);
        
        const ipfsContentString = await ipfsService.getFile(cid);
        this.deviceData = JSON.parse(ipfsContentString);
      }
      
      // Step 4: Transform data for client
      const transformedData = await this.transformDataForClient(deviceState, deviceAddress, cryptoService, authKeyService, params);
      
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
  async transformDataForClient(deviceState, deviceAddress, cryptoService, authKeyService, params) {

    const keys = authKeyService.getKeys(deviceAddress);
    let authenticator;
    // Start with V=1 at position 0
    const data = [["V", "1"]];
    
    
    // Determine TT value based on 't' parameter and deviceState

    if (params.t === 'checkme') {
      data.push(["TT", "S"]);
      data.push(["IT", this.getFieldValue("IT")]);
      // Add specific fields from IPFS content in order, with defaults as fallback
      data.push(["BT", this.getFieldValue("BT")]);
      data.push(["BW", this.getFieldValue("BW")]);
      data.push(["SN", deviceAddress.toUpperCase().slice(2)]);
      data.push(["CT", generateCTField()]);
      data.push(["LD", generateLDField(this.getFieldValue("ticketlifetime"))]);
      data.push(["TW", this.getFieldValue("TW")]); 
      data.push(["MaxUC", this.getFieldValue("MaxUC")]);

      authenticator = "HMAC-SHA256 " + endianFlipHex( await cryptoService.hmacSha256Hex(serializeData(data), endianFlipHex(keys["AK"])));
      data.push(["Authenticator", authenticator]);

      data.push(["AKT", "S"]);
      data.push(["AK", keys["AK"]]);
      data.push(["UK", keys["UK"]]);

    } else {

      switch (deviceState) {
        case "0": // Free
          data.push(["TT", 'F']);
          data.push(["IT", this.getFieldValue("IT")]);
          // Add specific fields from IPFS content in order, with defaults as fallback
          data.push(["SN", deviceAddress.toUpperCase().slice(2)]);
          data.push(["CT", generateCTField()]);

          authenticator = "HMAC-SHA256 " + endianFlipHex( await cryptoService.hmacSha256Hex(serializeData(data), endianFlipHex(keys["AK"])));
          data.push(["Authenticator", authenticator]);
          break;

        case "1": // Normal
          data.push(["TT", 'N']);
          data.push(["BT", this.getFieldValue("BT")]);
          data.push(["BW", this.getFieldValue("BW")]);
          data.push(["SN", deviceAddress.toUpperCase().slice(2)]);
          data.push(["CT", generateCTField()]);
          data.push(["LD", generateLDField(this.getFieldValue("ticketlifetime"))]);
          data.push(["TW", this.getFieldValue("TW")]); 
          data.push(["MaxUC", this.getFieldValue("MaxUC")]);
          authenticator = "HMAC-SHA256 " + endianFlipHex( await cryptoService.hmacSha256Hex(serializeData(data), endianFlipHex(keys["AK"])));
          data.push(["Authenticator", authenticator]);
          break;

        case "2": // Blocked
          data.push(["TT", 'B']);
          data.push(["BT", this.getFieldValue("BT")]);
          data.push(["SN", deviceAddress.toUpperCase().slice(2)]);
          data.push(["CT", generateCTField()]);
          authenticator = "HMAC-SHA256 " + endianFlipHex( await cryptoService.hmacSha256Hex(serializeData(data), endianFlipHex(keys["AK"])));
          data.push(["Authenticator", authenticator]);

          break;
        default:
          ttValue = "Unknown";
          break;
      }
    }

    return serializeData(data);
  }

  async processUnlockRequest(authKeyService, cryptoService, params) {
    const { cid, ct, uc } = params;
    // Step 1: Validate request parameters
    if (!cid || !ct || !uc) {
      return {
        success: false,
        error: 'Missing required parameters "cid", "ct", and "uc" for unlock request',
        statusCode: 400
      };
    }

    console.log("Processing unlock request with params: ", params);
    const unlockKey = authKeyService.getKeys("0x"+cid.toLowerCase())["UK"];
    return {
      success: true,
      data: await authKeyService.generateUnlockCode(unlockKey, ct, uc, cid, cryptoService)
    };
  }
}

module.exports = MiddlewareService;
