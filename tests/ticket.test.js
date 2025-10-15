const CryptographyService = require('../services/cryptography');
const TicketFactory = require('../entities/TicketFactory');



describe('Ticket Classes', () => {
  let cryptoService;

  const mockDeviceKeys = {
    Address: '0x73a99b188a1054aac0a0d77ceb6883ef0fc1c515',
    AK: '4E8ADD61E02DCD2FDAD9457D9738E370',
    UK: '2A6BCC61D12DCD2FDAD9457D9738E421'
  };

  const mockDeviceData = {
    IT: 'TestITValue',
    BT: 'TestBTValue', 
    BW: 'TestBWValue',
    ticketlifetime: 3600,
    TW: 'TestTWValue',
    MaxUC: '10'
  };

  const mockDefaults = {
    IT: 'DefaultITValue',
    BT: 'DefaultBTValue',
    BW: 'DefaultBWValue',
    ticketlifetime: 7200,
    TW: 'DefaultTWValue',
    MaxUC: '5'
  };

  beforeEach(() => {
    cryptoService = new CryptographyService();
  });

  describe('FreeTicket', () => {
    test('should create Free ticket with correct fields', () => {
      const ticket = TicketFactory.createTicket('0', mockDeviceKeys, mockDeviceData, mockDefaults, {});
      
      expect(ticket.getField('V')).toBe('1');
      expect(ticket.getField('TT')).toBe('F');
      expect(ticket.getField('IT')).toBe('TestITValue');
      expect(ticket.getField('SN')).toBeDefined();
      expect(ticket.getField('CT')).toBeDefined();
    });

  });

  describe('NormalTicket', () => {
    test('should create Normal ticket with correct fields', () => {
      const ticket = TicketFactory.createTicket('1', mockDeviceKeys, mockDeviceData, mockDefaults, {});
      
      expect(ticket.getField('V')).toBe('1');
      expect(ticket.getField('TT')).toBe('N');
      expect(ticket.getField('BT')).toBe('TestBTValue');
      expect(ticket.getField('BW')).toBe('TestBWValue');
      expect(ticket.getField('LD')).toBeDefined();
      expect(ticket.getField('TW')).toBe('TestTWValue');
      expect(ticket.getField('MaxUC')).toBe('10');
    });

  });

  describe('BlockedTicket', () => {
    test('should create Blocked ticket with correct fields', () => {
      const ticket = TicketFactory.createTicket('2', mockDeviceKeys, mockDeviceData, mockDefaults, {});
      
      expect(ticket.getField('V')).toBe('1');
      expect(ticket.getField('TT')).toBe('B');
      expect(ticket.getField('BT')).toBe('TestBTValue');
      expect(ticket.getField('SN')).toBeDefined();
      expect(ticket.getField('CT')).toBeDefined();
    });

  });

  describe('StartTicket (Checkme)', () => {
    test('should create Start ticket with correct fields', () => {
      const ticket = TicketFactory.createTicket('1', mockDeviceKeys, mockDeviceData, mockDefaults, { t: 'checkme' });
      
      expect(ticket.getField('V')).toBe('1');
      expect(ticket.getField('TT')).toBe('S');
      expect(ticket.getField('IT')).toBe('TestITValue');
      expect(ticket.getField('BT')).toBe('TestBTValue');
      expect(ticket.getField('BW')).toBe('TestBWValue');
      expect(ticket.getField('LD')).toBeDefined();
      expect(ticket.getField('TW')).toBe('TestTWValue');
      expect(ticket.getField('MaxUC')).toBe('10');
      expect(ticket.getField('AKT')).toBe('S');
      expect(ticket.getField('AK')).toBe(mockDeviceKeys.AK);
      expect(ticket.getField('UK')).toBe(mockDeviceKeys.UK);
    });

  });

  describe('Field Value Fallback', () => {
    test('should use default values when device data is empty', () => {
      const emptyDeviceData = {};
      const ticket = TicketFactory.createTicket('0', mockDeviceKeys, emptyDeviceData, mockDefaults, {});
      
      expect(ticket.getField('IT')).toBe('DefaultITValue');
    });

  });


  describe('JSON Representation', () => {
    test('should convert ticket to JSON correctly', () => {
      const ticket = TicketFactory.createTicket('1', mockDeviceKeys, mockDeviceData, mockDefaults, {});
      const json = ticket.toJSON();
      
      expect(json.fields).toBeDefined();
      expect(typeof json.fields).toBe('object');
      expect(json.fields.V).toBe('1');
      expect(json.fields.TT).toBe('N');
    });
  });

  describe('HMAC Verification', () => {
    test('should generate correct HMAC hash for specific ticket data', async () => {
      // Create a ticket with the exact values from the test case
      const specificDeviceKeys = {
        AK: 'D53470ED1DE204EAAB9ED03AA8BAEE86',
        UK: 'testUK'
      };

      const specificDeviceData = {
        BT: 'Your computer is locked by CUCo Firmware security\\nPlease contact your seller or the CUCo Firmware Support Team at support@cuco-firmware.com or try to unlock at \\nbeta.cuco-firmware.com/ucode/',
        BW: 'This is a test warning message :GNV: :FI:86400',
        ticketlifetime: 86400, // 1 day in seconds
        TW: '02A300',
        MaxUC: '64'
      };

      const specificDefaults = {};

      // Create a Normal ticket (deviceState = '1')
      const ticket = TicketFactory.createTicket('1', specificDeviceKeys, specificDeviceData, specificDefaults, {});
      
      // Serialize the ticket
      const serialized = await ticket.serialize(cryptoService);
      
      // Extract the HMAC hash from the serialized output
      const hmacMatch = serialized.match(/Authenticator=HMAC-SHA256 ([a-f0-9]+)$/);
      expect(hmacMatch).toBeTruthy();
      
      const generatedHash = hmacMatch[1];
      const expectedHash = '9c0ae5738061d0f487a540690acbc3d0a747048572133804b858e68c0174f75b';
      
      expect(generatedHash).toBe(expectedHash);
    });
  });

});
