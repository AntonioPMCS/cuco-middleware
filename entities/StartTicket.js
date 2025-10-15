/**
 * Start Ticket
 * Represents a Start ticket (TT=S)
 */
const Ticket = require('./Ticket');

class StartTicket extends Ticket {
  constructor({ serialNumber, deviceData, defaults, deviceKeys }) {
    super({ serialNumber, deviceKeys });
    this.deviceData = deviceData;
    this.defaults = defaults;
    
    // Add type-specific fields for Start ticket
    this.addField('TT', 'S');
    this.addField('IT', this.getFieldValue('IT'));
    this.addField('BT', this.getFieldValue('BT'));
    this.addField('BW', this.getFieldValue('BW'));
    this.addField('LD', this.generateLDField(this.getFieldValue('ticketlifetime')));
    this.addField('TW', this.getFieldValue('TW'));
    this.addField('MaxUC', this.getFieldValue('MaxUC'));
    
    // Add start-specific fields
    this.addField('AKT', 'S');
    this.addField('AK', this.deviceKeys.AK);
    this.addField('UK', this.deviceKeys.UK);
  }
}

module.exports = StartTicket;
