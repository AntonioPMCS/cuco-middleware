/**
 * Middleware Service
 * Acts as a bridge between blockchain/IPFS and client
 * Fetches, transforms, and organizes data for clean client responses
 */
class MiddlewareService {
  constructor() {
    console.log('✅ Middleware service initialized');
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
  async processRequest(ethereumService, ipfsService, params) {
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
      console.log('🔗 Fetching blockchain data...');
      const deviceAddress = await ethereumService.getDeviceBySn(sn);
      const deviceMetadata = await ethereumService.getDeviceMetadata(deviceAddress);
      const deviceState = await ethereumService.getDeviceState(deviceAddress);

      // Step 3: Extract CID and fetch IPFS content
      let ipfsContent = null;
      if (deviceMetadata && deviceMetadata.includes('/')) {
        const cid = deviceMetadata.split('/')[1];
        console.log(`�� Fetching IPFS content for CID: ${cid}`);
        
        const ipfsContentString = await ipfsService.getFile(cid);
        ipfsContent = JSON.parse(ipfsContentString);
      }
      
      // Step 4: Transform data for client
      const transformedData = this.transformDataForClient(ipfsContent, deviceState, params);
      
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
  transformDataForClient(ipfsContent, deviceState, params) {
    if (!ipfsContent || !ipfsContent.data) {
      return {
        message: `Start ticket - s: ${params.s}, d: ${params.d}`,
        data: [["V", "1"]]
      };
    }

    // Start with V=1 at position 0
    const data = [["V", "1"]];
    
    // Check if t parameter is "checkme" and add TT field at position 1
    console.log(params.t)
    if (params.t === 'checkme') {
      data.push(["TT", "S"]);
      console.log("t is checkme")
    } else {
      console.log("t is not checkme")
      // Switch case for deviceState to determine TT value
      let ttValue;
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
      data.push(["TT", ttValue]);
    }
    
    // Add all IPFS data fields
    if (Array.isArray(ipfsContent.data)) {
      for (const tuple of ipfsContent.data) {
        if (Array.isArray(tuple) && tuple.length === 2) {
          data.push([String(tuple[0]), String(tuple[1])]);
        }
      }
    }
    
    
    return {
      message: `Start ticket - s: ${params.s}, d: ${params.d}`,
      data: data
    };
  }
}

module.exports = MiddlewareService;
