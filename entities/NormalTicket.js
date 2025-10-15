/**
 * Normal Ticket
 * Represents a Normal ticket (TT=N)
 */
const Ticket = require('./Ticket');

class NormalTicket extends Ticket {
  constructor({ serialNumber, deviceData, defaults, deviceKeys }) {
    super({ serialNumber, deviceKeys });
    this.deviceData = deviceData;
    this.defaults = defaults;
    
    // Add type-specific fields for Normal ticket
    this.addField('TT', 'N');
    this.addField('BT', this.getFieldValue('BT'));
    this.addField('BW', this.getFieldValue('BW'));
    this.addField('LD', this.generateLDField(this.getFieldValue('ticketlifetime')));
    this.addField('TW', this.getFieldValue('TW'));
    this.addField('MaxUC', this.getFieldValue('MaxUC'));
  }
}

module.exports = NormalTicket;
