/**
 * Ticket Factory
 * Handles ticket creation based on device state and request parameters
 * Acts as a factory for creating appropriate ticket types
 */
const FreeTicket = require('./FreeTicket');
const NormalTicket = require('./NormalTicket');
const BlockedTicket = require('./BlockedTicket');
const StartTicket = require('./StartTicket');

class TicketFactory {
  /**
   * Create a ticket based on device state and request parameters
   * @param {string} deviceState - Device state ("0", "1", "2")
   * @param {Object} deviceKeys - Device authentication keys
   * @param {Object} deviceData - Device data from IPFS
   * @param {Object} defaults - Default values
   * @param {Object} params - Request parameters
   * @returns {Object} - Created ticket instance
   */
  static createTicket(deviceState, deviceKeys, deviceData, defaults, params) {
    const sn = deviceKeys.Address.slice(10).toUpperCase();
    
    let ticket;
    
    if (params.t === 'checkme') {
      ticket = new StartTicket({
        serialNumber: sn,
        deviceData,
        defaults,
        deviceKeys
      });
    } else {
      switch (deviceState) {
        case "0": // Free
          ticket = new FreeTicket({
            serialNumber: sn,
            deviceData,
            defaults,
            deviceKeys
          });
          break;
        
        case "1": // Normal
          ticket = new NormalTicket({
            serialNumber: sn,
            deviceData,
            defaults,
            deviceKeys
          });
          break;
        
        case "2": // Blocked
          ticket = new BlockedTicket({
            serialNumber: sn,
            deviceData,
            defaults,
            deviceKeys
          });
          break;
        
        default:
          throw new Error(`Unknown device state: ${deviceState}`);
      }
    }
    
    // Return the ticket instance
    return ticket;
  }
}

module.exports = TicketFactory;
