

class EthereumMock {
  constructor() {
  }

  async getDeviceBySn(sn) {
    return '0x73A99b188A1054aAc0A0D77cEB6883eF0FC1c515';
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