
import Web3 from 'web3';

// Create a Web3 instance using MetaMask's provider or a local provider
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Default export the web3 instance
export default web3;
