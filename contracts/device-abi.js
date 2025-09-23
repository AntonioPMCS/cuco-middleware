// Device Contract ABI
const DEVICE_CONTRACT_ABI = [
  {
    "type": "function",
    "name": "metadata",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "inputs":[],
      "name":"deviceState",
      "outputs":[
         {
            "internalType":"enum Device.DeviceState",
            "name":"",
            "type":"uint8"
         }
      ],
      "stateMutability":"view",
      "type":"function"
  },
  {
    "inputs":[],
      "name":"sn",
      "outputs":[
         {
            "internalType":"string",
            "name":"",
            "type":"string"
         }
      ],
      "stateMutability":"view",
      "type":"function"
  }
];

module.exports = DEVICE_CONTRACT_ABI;
