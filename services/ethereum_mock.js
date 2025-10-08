

class EthereumMock {
  constructor() {
  }

  async getDeviceBySn(sn) {
    return '0x123ec58b06bF6305B886793AA20A2da31D034E68';
  }

  async getDeviceMetadata(deviceAddress) {
    return 'ipfs://bafkreib55r7osq7xpnnji2lc2ix5iljabblmpomtd5bacm7ibz3coybuli';
  }

  async getDeviceSerialNumber(deviceAddress) {
    return 'XPS7G-2KL94-HF3T';
  }

  async getDeviceState(deviceAddress) {
    return '1';
  }

}

module.exports = EthereumMock;