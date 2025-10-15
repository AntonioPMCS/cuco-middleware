const MiddlewareService = require('../services/middleware');
const CryptographyService = require('../services/cryptography');
const AuthKeyService = require('../services/auth-keys');
const EthereumMock = require('../services/ethereum_mock');
const IPFSService = require('../services/ipfs');

const SERIAL_NO="XPS7G-2KL94-HF3T"
const CUCO_ID="8A1054AAC0A0D77CEB6883EF0FC1C515"

describe('MiddlewareService', () => {
  let middlewareService;
  let ethereumService;
  let ipfsService;
  let cryptoService;
  let authKeyService;

  beforeEach(() => {
    middlewareService = new MiddlewareService();
    ethereumService = new EthereumMock();
    ipfsService = new IPFSService();
    cryptoService = new CryptographyService();
    authKeyService = new AuthKeyService();
  });

  describe('processRequest', () => {
    test('should process checkme request successfully', async () => {
      const params = { s: SERIAL_NO, d: "tb", t: "checkme" };
      
      const result = await middlewareService.processRequest(
        ethereumService, 
        ipfsService, 
        cryptoService, 
        authKeyService, 
        params
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('V=1');
      expect(result.data).toContain('TT=S');
      expect(result.data).toContain('Authenticator=HMAC-SHA256');
    });

    test('should process normal request successfully', async () => {
      const params = { t: CUCO_ID };
      
      const result = await middlewareService.processRequest(
        ethereumService, 
        ipfsService, 
        cryptoService, 
        authKeyService, 
        params
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('V=1');
      expect(result.data).toContain('Authenticator=HMAC-SHA256');
    });

    test('should handle missing parameters for checkme request', async () => {
      const params = { s: SERIAL_NO, d: "tb" }; // Missing 't'
      
      const result = await middlewareService.processRequest(
        ethereumService, 
        ipfsService, 
        cryptoService, 
        authKeyService, 
        params
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameter "t"');
      expect(result.statusCode).toBe(400);
    });

    test('should handle missing s and d parameters for checkme request', async () => {
      const params = { t: "checkme" }; // Missing 's' and 'd'
      
      const result = await middlewareService.processRequest(
        ethereumService, 
        ipfsService, 
        cryptoService, 
        authKeyService, 
        params
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameters');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('processUnlockRequest', () => {
    test('should process unlock request successfully', async () => {
      const params = { cid: CUCO_ID, ct: "1234567890", uc: "5" };
      
      const result = await middlewareService.processUnlockRequest(
        authKeyService, 
        cryptoService, 
        params
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    test('should handle missing parameters for unlock request', async () => {
      const params = { cid: CUCO_ID }; // Missing 'ct' and 'uc'
      
      const result = await middlewareService.processUnlockRequest(
        authKeyService, 
        cryptoService, 
        params
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameters');
      expect(result.statusCode).toBe(400);
    });

    test('should handle missing cid parameter', async () => {
      const params = { ct: CUCO_ID, uc: "5" }; // Missing 'cid'
      
      const result = await middlewareService.processUnlockRequest(
        authKeyService, 
        cryptoService, 
        params
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameters');
      expect(result.statusCode).toBe(400);
    });
  });
});
