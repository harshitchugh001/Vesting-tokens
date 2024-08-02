import Web3 from 'web3';
import VestingABI from './Vesting.json';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const CONTRACT_ADDRESS = localStorage.getItem('contractAddress'); 
const contract = new web3.eth.Contract(VestingABI.abi, CONTRACT_ADDRESS);

export default contract;
