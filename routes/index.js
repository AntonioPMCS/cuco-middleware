const express = require('express');
const EthereumService = require('../services/ethereum');
const IPFSService = require('../services/ipfs');
const MiddlewareService = require('../services/middleware');
const CryptographyService = require('../services/cryptography');
const router = express.Router();

// Initialize services
const ethereumService = new EthereumService();
const ipfsService = new IPFSService();
const middlewareService = new MiddlewareService();
const cryptoService = new CryptographyService("4E8ADD61E02DCD2FDAD9457D9738E370");

// Route handler for the root path that accepts URL parameter 't'
router.get('/', async (req, res) => {
  try {
    const t = req.query.t;
    const s = req.query.s;
    const d = req.query.d;

    // Always use middleware service to process the complete flow
    const result = await middlewareService.processRequest(ethereumService, ipfsService, cryptoService, { s, d, t });
    
    if (result.success) {
      return res.json(result.data);
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

module.exports = router;
