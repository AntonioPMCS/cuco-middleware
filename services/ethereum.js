const { ethers } = require('ethers');
const CUCO_CONTRACT_ABI = require('../contracts/cuco-abi');
const DEVICE_CONTRACT_ABI = require('../contracts/device-abi');

class EthereumService {
  constructor() {
    const infuraProjectId = process.env.INFURA_PROJECT_ID;
    const cucoAddress = process.env.CUCO_ADDRESS;
    
    if (!infuraProjectId || infuraProjectId === 'your_infura_project_id_here') {
      console.error('❌ ERROR: INFURA_PROJECT_ID not found or not configured!');
      console.error('Please:');
      console.error('1. Get your Infura project ID from https://infura.io');
      console.error('2. Update the .env file with your actual project ID');
      console.error('3. Replace "your_infura_project_id_here" with your real project ID');
      process.exit(1);
    }
    
    if (!cucoAddress || cucoAddress === '0x0000000000000000000000000000000000000000') {
      console.error('❌ ERROR: CUCO_ADDRESS not configured!');
      console.error('Please:');
      console.error('1. Update the .env file with the actual CUCo contract address');
      console.error('2. Replace "0x0000000000000000000000000000000000000000" with the real contract address');
      process.exit(1);
    }
    
    this.provider = new ethers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${infuraProjectId}`
    );
    
    // Initialize CUCo contract
    this.cucoContract = new ethers.Contract(cucoAddress, CUCO_CONTRACT_ABI, this.provider);
    
    console.log('✅ Ethereum service initialized with Infura and CUCo Contract');
    console.log(`📋 CUCo Contract Address: ${cucoAddress}`);
  }

  async getDeviceBySn(sn) {
    try {
      const deviceAddress = await this.cucoContract.getDeviceBySn(sn);
      return deviceAddress;
    } catch (error) {
      console.error('Error calling getDeviceBySn:', error);
      throw new Error(`Failed to get device by serial number: ${error.message}`);
    }
  }

  async getDeviceMetadata(deviceAddress) {
    // try {
    //   const deviceContract = new ethers.Contract(deviceAddress, DEVICE_CONTRACT_ABI, this.provider);
    //   const metadata = await deviceContract.metadata();
    //   return metadata;
    // } catch (error) {
    //   console.error('Error calling device metadata:', error);
    //   throw new Error(`Failed to get device metadata: ${error.message}`);
    // }
    return 'ipfs://bafkreihccimod2m7y7txvnm34kocealmr7u2yurqohwgleaslloh2fokzi';
  }

  async getDeviceSerialNumber(deviceAddress) {
    try {
      const deviceContract = new ethers.Contract(deviceAddress, DEVICE_CONTRACT_ABI, this.provider);
      const serialNumber = await deviceContract.sn();
      return serialNumber;
    } catch (error) {
      console.error('Error calling device serial number:', error);
      throw new Error(`Failed to get device serial number: ${error.message}`);
    }
  }

  async getDeviceState(deviceAddress) {
    try {
      const deviceContract = new ethers.Contract(deviceAddress, DEVICE_CONTRACT_ABI, this.provider);
      const deviceState = await deviceContract.deviceState();
      return deviceState.toString();
    } catch (error) {
      console.error('Error calling device state:', error);
      throw new Error(`Failed to get device state: ${error.message}`);
    }
  }
}

module.exports = EthereumService;
