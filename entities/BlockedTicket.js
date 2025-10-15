/**
 * Blocked Ticket
 * Represents a Blocked ticket (TT=B)
 */
const Ticket = require('./Ticket');

class BlockedTicket extends Ticket {
  constructor({ serialNumber, deviceData, defaults, deviceKeys }) {
    super({ serialNumber, deviceKeys });
    this.deviceData = deviceData;
    this.defaults = defaults;
    
    // Add type-specific fields for Blocked ticket
    this.addField('TT', 'B');
    this.addField('BT', this.getFieldValue('BT'));
  }
}

module.exports = BlockedTicket;
