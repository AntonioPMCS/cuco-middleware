

class EthereumMock {
  constructor() {
  }

  async getDeviceBySn(sn) {
    return '0x123ec58b06bF6305B886793AA20A2da31D034E68';
  }

  async getDeviceMetadata(deviceAddress) {
    return 'ipfs://bafkreibaqbylj5xkpxtgc4tz4c2qf4forvvq4tqnmlszyxws5y5q5oi4ti';
  }

  async getDeviceSerialNumber(deviceAddress) {
    return 'XPS7G-2KL94-HF3T';
  }

  async getDeviceState(deviceAddress) {
    return '1';
  }

}

module.exports = EthereumMock;