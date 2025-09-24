const MiddlewareService = require('../services/middleware');
const { generateCTField, hexToDateString, getCustomEpoch } = require('../utils/timestamp');

describe('MiddlewareService', () => {
  let middlewareService;

  beforeEach(() => {
    middlewareService = new MiddlewareService();
  });

  describe('Timestamp Utils', () => {
    test('should generate valid hex timestamp with custom epoch', () => {
      const ctValue = generateCTField();
      
      // Should be a valid hex string
      expect(ctValue).toMatch(/^[0-9a-f]+$/);
      
      // Should be reasonable length (hex representation of current timestamp)
      expect(ctValue.length).toBeGreaterThan(6);
      expect(ctValue.length).toBeLessThan(12);
    });

    test('should convert hex timestamp to readable date with custom epoch', () => {
      const ctValue = generateCTField();
      const dateString = hexToDateString(ctValue);
      
      // Should be a valid ISO date string
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Should be recent (within last minute)
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.abs(now - date);
      expect(diff).toBeLessThan(60000); // Less than 1 minute
    });

    test('should use custom epoch (40 years after UNIX epoch)', () => {
      const customEpoch = getCustomEpoch();
      const expectedEpoch = new Date('2010-01-01T00:00:00.000Z').getTime() / 1000;
      
      expect(customEpoch).toBe(expectedEpoch);
    });

    test('should generate smaller hex values due to custom epoch', () => {
      const ctValue = generateCTField();
      const decimalValue = parseInt(ctValue, 16);
      
      // The decimal value should be much smaller than current UNIX timestamp
      const currentUnix = Math.floor(Date.now() / 1000);
      expect(decimalValue).toBeLessThan(currentUnix);
      
      // Should be positive (after 2010)
      expect(decimalValue).toBeGreaterThan(0);
    });
  });

  describe('transformDataForClient', () => {
    test('should build data field correctly for checkme request with CT field after SN', () => {
      // Mock IPFS content
      const mockIpfsContent = {
        data: [
          ["BT", "Your computer is locked by CUCo Firmware security"],
          ["BW", "This is a test warning message"],
          ["SN", "3E98B2B9A3860403415B91E97B9347AD"],
          ["LD", "1DB820DD"],
          ["TW", "02A300"],
          ["MaxUC", "64"],
          ["Authenticator", "HMAC-SHA256 3392a7aa0e230e0bfa64a65d7108a329fc2ba3e38d93fbc1e1358c1c3013c1df"]
        ]
      };

      const params = { s: "DEVICE123", d: "world", t: "checkme" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      // Check structure: V, TT, BT, BW, SN, CT, LD, TW, MaxUC, Authenticator
      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "S"]);
      expect(result.data[2]).toEqual(["BT", "Your computer is locked by CUCo Firmware security"]);
      expect(result.data[3]).toEqual(["BW", "This is a test warning message"]);
      expect(result.data[4]).toEqual(["SN", "3E98B2B9A3860403415B91E97B9347AD"]);
      
      // CT should be after SN
      expect(result.data[5][0]).toBe("CT");
      expect(result.data[5][1]).toMatch(/^[0-9a-f]+$/);
      
      expect(result.data[6]).toEqual(["LD", "1DB820DD"]);
      expect(result.data[7]).toEqual(["TW", "02A300"]);
      expect(result.data[8]).toEqual(["MaxUC", "64"]);
      expect(result.data[9]).toEqual(["Authenticator", "HMAC-SHA256 3392a7aa0e230e0bfa64a65d7108a329fc2ba3e38d93fbc1e1358c1c3013c1df"]);
    });

    test('should build data field correctly for non-checkme request with CT field after SN', () => {
      const mockIpfsContent = {
        data: [
          ["BT", "Your computer is locked by CUCo Firmware security"],
          ["BW", "This is a test warning message"],
          ["SN", "3E98B2B9A3860403415B91E97B9347AD"],
          ["LD", "1DB820DD"]
        ]
      };

      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "0";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);

      // Check structure: V, TT, BT, BW, SN, CT, LD
      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "F"]);
      expect(result.data[2]).toEqual(["BT", "Your computer is locked by CUCo Firmware security"]);
      expect(result.data[3]).toEqual(["BW", "This is a test warning message"]);
      expect(result.data[4]).toEqual(["SN", "3E98B2B9A3860403415B91E97B9347AD"]);
      
      // CT should be after SN
      expect(result.data[5][0]).toBe("CT");
      expect(result.data[5][1]).toMatch(/^[0-9a-f]+$/);
      
      expect(result.data[6]).toEqual(["LD", "1DB820DD"]);
    });

    test('should handle missing IPFS content', () => {
      const params = { s: "DEVICE123", d: "world", t: "checkme" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(null, deviceState, params);

      // Should have V and TT fields even without IPFS content
      expect(result.data).toEqual([
        ["V", "1"],
        ["TT", "S"]
      ]);
      expect(result.message).toBe("Start ticket - s: DEVICE123, d: world");
    });

    test('should generate valid CT field format when SN is present', () => {
      const mockIpfsContent = { 
        data: [
          ["SN", "3E98B2B9A3860403415B91E97B9347AD"]
        ] 
      };
      const params = { s: "DEVICE123", d: "world", t: "normal" };
      const deviceState = "1";

      const result = middlewareService.transformDataForClient(mockIpfsContent, deviceState, params);
      
      // Should have: V, TT, SN, CT
      expect(result.data[0]).toEqual(["V", "1"]);
      expect(result.data[1]).toEqual(["TT", "N"]);
      expect(result.data[2]).toEqual(["SN", "3E98B2B9A3860403415B91E97B9347AD"]);
      
      // CT field should be after SN
      expect(result.data[3][0]).toBe("CT");
      expect(result.data[3][1]).toMatch(/^[0-9a-f]+$/);
      
      // Should be able to convert back to date
      const dateString = hexToDateString(result.data[3][1]);
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    // Skipping test for when SN is missing - as requested
    test.skip('should handle case when SN is missing', () => {
      // This test is skipped for now
    });
  });
});
