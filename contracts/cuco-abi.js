// CUCo Blockchain Contract ABI
const CUCO_CONTRACT_ABI = [
  {
    "type": "function",
    "name": "getDeviceBySn",
    "inputs": [
      {
        "name": "sn",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "device",
        "type": "address",
        "internalType": "contract Device"
      }
    ],
    "stateMutability": "view"
  }
];

module.exports = CUCO_CONTRACT_ABI;
