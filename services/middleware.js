/**
 * Middleware Service
 * Acts as a bridge between blockchain/IPFS and client
 * Fetches, transforms, and organizes data for clean client responses
 */
const fs = require('fs');
const path = require('path');
const TicketFactory = require('../entities/TicketFactory');

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
      let deviceAddress;
      
      // Step 1: Validate request parameters
      switch (t) {
        case 'checkme':
          if (!s || !d) {
            return {
              success: false,
              error: 'Missing required parameters "s" and "d" for checkme request',
              statusCode: 400
            };
          }
          deviceAddress = (await ethereumService.getDeviceBySn(s));
          break;
        case undefined:
          return {
            success: false,
            error: 'Missing required parameter "t"',
            statusCode: 400
          };
        default:
          break;
      }
      const deviceKeys = authKeyService.getKeys(
        deviceAddress?.slice(10).toUpperCase() || t)
      deviceAddress = deviceKeys.Address;

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
      
      // Step 4: Create ticket using factory
      const ticket = TicketFactory.createTicket(deviceState, deviceKeys, this.deviceData, this.defaults, params);
      const transformedData = await ticket.serialize(cryptoService);
      
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
    const unlockKey = authKeyService.getKeys(cid.toUpperCase())["UK"];
    return {
      success: true,
      data: await authKeyService.generateUnlockCode(unlockKey, ct, uc, cid, cryptoService)
    };
  }
}

module.exports = MiddlewareService;
