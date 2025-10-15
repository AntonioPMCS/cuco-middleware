# Entities Directory

This directory contains domain entities that represent core business objects using the Template Method pattern.

## Ticket.js (Base Class)

The `Ticket` class is the base class that defines the template method pattern for ticket generation.

### Key Features:
- **Template Method Pattern**: Defines the overall ticket generation process
- **Constructor-based Field Addition**: Type-specific fields added during construction
- **Flexible Field Management**: Easy to add fields with `addField(key, value)`
- **Built-in Timestamp Generation**: CT and LD field generation methods
- **Built-in HMAC**: Automatic authenticator generation with secret key handling
- **Fully Formed Objects**: Tickets are complete immediately after construction
- **Self-contained**: All ticket logic contained within the class
- **Parameterless Serialization**: No external parameters needed for serialization

### Usage Examples:

```javascript
// Base ticket creation
const ticket = new Ticket({
  version: 1,
  serialNumber: 'ABC123',
  deviceKeys: { AK: 'authKey', UK: 'unlockKey' }
});

// Add fields
ticket.addField('TT', 'F');
ticket.addField('IT', 'someValue');

// Serialize ticket to string
const ticketString = await ticket.serialize(cryptoService);
```

## Ticket Subclasses

### FreeTicket.js
- **Type**: Free ticket (TT=F)
- **Fields**: V, SN, CT, TT, IT, Authenticator

### NormalTicket.js
- **Type**: Normal ticket (TT=N)
- **Fields**: V, SN, CT, TT, BT, BW, LD, TW, MaxUC, Authenticator

### BlockedTicket.js
- **Type**: Blocked ticket (TT=B)
- **Fields**: V, SN, CT, TT, BT, Authenticator

### StartTicket.js
- **Type**: Start ticket (TT=S)
- **Fields**: V, SN, CT, TT, IT, BT, BW, LD, TW, MaxUC, AKT, AK, UK, Authenticator

## TicketFactory.js

The `TicketFactory` handles ticket creation based on device state and request parameters.

### Usage:

```javascript
// Create ticket instance
const ticket = TicketFactory.createTicket(deviceState, deviceKeys, deviceData, defaults, params);

// Serialize with crypto service
const ticketString = await ticket.serialize(cryptoService);
```

## Benefits of This Approach:

1. **Template Method Pattern**: Clean separation of common and specific logic
2. **Constructor-based Design**: Type-specific fields added during construction
3. **Fully Formed Objects**: Tickets are complete immediately after creation
4. **Inheritance**: Each ticket type extends the base Ticket class
5. **Polymorphism**: All tickets follow the same interface
6. **Maintainability**: Easy to add new ticket types
7. **Testability**: Easy to unit test individual ticket types
8. **Clean Code**: Follows SOLID principles
