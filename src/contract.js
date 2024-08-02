import web3 from './web3';
import VestingABI from './Vesting.json'; 

const CONTRACT_ADDRESS = '0xEf9f1ACE83dfbB8f559Da621f4aEA72C6EB10eBf'; 
const contract = new web3.eth.Contract(VestingABI.abi, CONTRACT_ADDRESS);

export default contract;
