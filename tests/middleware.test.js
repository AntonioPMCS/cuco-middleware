const MiddlewareService = require('../services/middleware');

describe('MiddlewareService', () => {
  let middlewareService;

  beforeEach(() => {
    middlewareService = new MiddlewareService();
  });

  describe('transformDataForClient', () => {
    test('should build data field correctly for checkme request', () => {
      // Mock IPFS content
      const mockIpfsContent = {
        data: [
          ["BT", "Your computer is locked by CUCo Firmware security"],
          ["BW", "This is a test warning message"],
          ["SN", "3E98B2B9A3860403415B91E97B9347AD"],
          ["CT", "1D9093DD"],
          ["LD", "1DB820DD"],
          ["TW", "02A300"],
          ["MaxUC", "64"]
        ]
      };

      const params = { s: "DEVICE123", d: "world", t: "checkme" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      // Check if V=1 is at position 0
      expect(result.data[0]).toEqual(["V", "1"]);
      
      // Check if TT=S is at position 1 for checkme
      expect(result.data[1]).toEqual(["TT", "S"]);
      
      // Check if IPFS data follows after TT
      expect(result.data[2]).toEqual(["BT", "Your computer is locked by CUCo Firmware security"]);
      expect(result.data[3]).toEqual(["BW", "This is a test warning message"]);
      expect(result.data[4]).toEqual(["SN", "3E98B2B9A3860403415B91E97B9347AD"]);
      
      // Check message
      expect(result.message).toBe("Start ticket - s: DEVICE123, d: world");
    });

    test('should build data field correctly for non-checkme request with deviceState 0', () => {
      const mockIpfsContent = {
        data: [
          ["BT", "Your computer is locked by CUCo Firmware security"],
          ["BW", "This is a test warning message"]
        ]
      };

      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "0";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      // Check if V=1 is at position 0
      expect(result.data[0]).toEqual(["V", "1"]);
      
      // Check if TT=F is at position 1 for deviceState 0
      expect(result.data[1]).toEqual(["TT", "F"]);
      
      // Check if IPFS data follows
      expect(result.data[2]).toEqual(["BT", "Your computer is locked by CUCo Firmware security"]);
    });

    test('should build data field correctly for deviceState 1', () => {
      const mockIpfsContent = {
        data: [["BT", "Test message"]]
      };

      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "N"]);
      expect(result.data[2]).toEqual(["BT", "Test message"]);
    });

    test('should build data field correctly for deviceState 2', () => {
      const mockIpfsContent = {
        data: [["BT", "Test message"]]
      };

      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "2";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "B"]);
      expect(result.data[2]).toEqual(["BT", "Test message"]);
    });

    test('should handle unknown deviceState', () => {
      const mockIpfsContent = {
        data: [["BT", "Test message"]]
      };

      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "999";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "Unknown"]);
      expect(result.data[2]).toEqual(["BT", "Test message"]);
    });

    test('should handle missing IPFS content', () => {
      const params = { s: "DEVICE123", d: "world", t: "checkme" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(null, deviceState, params);

      expect(result.data).toEqual([["V", "1"]]);
      expect(result.message).toBe("Start ticket - s: DEVICE123, d: world");
    });
  });
});
