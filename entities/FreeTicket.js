/**
 * Free Ticket
 * Represents a Free ticket (TT=F)
 */
const Ticket = require('./Ticket');

class FreeTicket extends Ticket {
  constructor({ serialNumber, deviceData, defaults, deviceKeys }) {
    super({ serialNumber, deviceKeys });
    this.deviceData = deviceData;
    this.defaults = defaults;
    
    // Add type-specific fields for Free ticket
    this.addField('TT', 'F');
    this.addField('IT', this.getFieldValue('IT'));
  }
}

module.exports = FreeTicket;
