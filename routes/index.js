const express = require('express');
const EthereumService = require('../services/ethereum');
const EthereumMock = require('../services/ethereum_mock');
const IPFSService = require('../services/ipfs');
const MiddlewareService = require('../services/middleware');
const CryptographyService = require('../services/cryptography');
const AuthKeyService = require('../services/auth-keys');
const router = express.Router();

// Initialize services
let ethereumService;
if (process.env.MOCK === "TRUE") {
  ethereumService = new EthereumMock();
  console.log('Using Ethereum Mock Service');
} else {
  ethereumService = new EthereumService();
}
const ipfsService = new IPFSService();
const middlewareService = new MiddlewareService();
const cryptoService = new CryptographyService();
const authKeyService = new AuthKeyService();

// Route handler for the root path that accepts URL parameter 't'
router.get('/', async (req, res) => {
  let result;

  try {
    const {t, s, d} = req.query;
    const { cid, ct, uc } = req.query;

    if (cid) {
      result = await middlewareService.processUnlockRequest(authKeyService, cryptoService, {cid, ct, uc});
    } else {
      result = await middlewareService.processRequest(ethereumService, ipfsService, cryptoService, authKeyService, { s, d, t });
    }
    
    if (result.success) {
      return res.send(result.data);
    } else {
      // Handle validation errors with proper status codes
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        error: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    console.error('Route error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route handler for unlock code generation
router.get('/ucode/getcode', async (req, res) => {
  try {
    const { cid, ct, uc } = req.query;

    // Add your unlock code logic here
    const result = await middlewareService.processUnlockRequest(authKeyService, cryptoService, { cid, ct, uc });

    if (result.success) {
      return res.json(result.data);
    } else {
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    console.error('Unlock code route error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
