import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ERC20Token from './ERC20Token.json';
import Vesting from './Vesting.json';

function App() {
    const [account, setAccount] = useState('');
    const [erc20Address, setErc20Address] = useState('');
    const [vestingAddress, setVestingAddress] = useState('');
    const [erc20Contract, setErc20Contract] = useState(null);
    const [vestingContract, setVestingContract] = useState(null);
    const [beneficiary, setBeneficiary] = useState('');
    const [cliff, setCliff] = useState('');
    const [duration, setDuration] = useState('');
    const [role, setRole] = useState('0'); 
    const [vestingInfo, setVestingInfo] = useState({});

    
    useEffect(() => {
        const loadWeb3 = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                try {
                   
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
                } catch (error) {
                    console.error("User denied account access or error in fetching accounts");
                }
            } else if (window.web3) {
                
                const web3 = window.web3;
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
            } else {
                alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        };
        loadWeb3();
    }, []);

    
    const deployERC20Token = async () => {
        const web3 = new Web3(window.ethereum);
        const deployer = account;
        const tokenContract = new web3.eth.Contract(ERC20Token.abi);
    
        try {
            const result = await tokenContract
                .deploy({
                    data: ERC20Token.bytecode, 
                    arguments: [ '1000000000000000000000000'], 
                })
                .send({ from: deployer, gas: '3000000' });
    
            console.log('ERC20 Token deployed to:', result.options.address);
            setErc20Address(result.options.address);
            setErc20Contract(result);
        } catch (error) {
            console.error("ERC20 Token deployment error:", error);
        }
    };

    
    const deployVestingContract = async () => {
        const web3 = new Web3(window.ethereum);
        const deployer = account;
        const vestingContract = new web3.eth.Contract(Vesting.abi);

        if (!erc20Address) {
            alert("Please deploy the ERC20 token first.");
            return;
        }

        try {
            const result = await vestingContract
                .deploy({
                    data: Vesting.bytecode,
                    arguments: [erc20Address], 
                })
                .send({ from: deployer, gas: '3000000' });

            console.log('Vesting Contract deployed to:', result.options.address);
            setVestingAddress(result.options.address);
            setVestingContract(result);
        } catch (error) {
            console.error("Vesting Contract deployment error:", error);
        }
    };

    const addBeneficiary = async () => {
        if (vestingContract) {
            await vestingContract.methods.addBeneficiary(
                beneficiary,
                Web3.utils.toWei(cliff, 'ether'),
                Web3.utils.toWei(duration, 'ether'),
                role
            ).send({ from: account });
        }
    };

    const releaseTokens = async () => {
        if (vestingContract) {
            await vestingContract.methods.releaseTokens().send({ from: account });
        }
    };

    const fetchVestingInfo = async () => {
        if (vestingContract) {
            const info = await vestingContract.methods.beneficiaries(account).call();
            setVestingInfo(info);
        }
    };

    return (
        <div className="App">
            <h1>Vesting and ERC20 Token Contracts</h1>
            <div>
                <h2>Account</h2>
                {account ? (
                    <p>Connected Account: {account}</p>
                ) : (
                    <button onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}>Connect Wallet</button>
                )}
            </div>

            {account && !erc20Contract && (
                <div>
                    <h2>Deploy ERC20 Token</h2>
                    <button onClick={deployERC20Token}>Deploy ERC20 Token</button>
                </div>
            )}

            {account && erc20Contract && !vestingContract && (
                <div>
                    <h2>Deploy Vesting Contract</h2>
                    <button onClick={deployVestingContract}>Deploy Vesting Contract</button>
                </div>
            )}

            {vestingContract && (
                <div>
                    <h2>Add Beneficiary</h2>
                    <input
                        type="text"
                        value={beneficiary}
                        onChange={(e) => setBeneficiary(e.target.value)}
                        placeholder="Beneficiary Address"
                    />
                    <input
                        type="text"
                        value={cliff}
                        onChange={(e) => setCliff(e.target.value)}
                        placeholder="Cliff (ETH)"
                    />
                    <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Duration (ETH)"
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="0">User</option>
                        <option value="1">Admin</option>
                    </select>
                    <button onClick={addBeneficiary}>Add Beneficiary</button>
                </div>
            )}

            {vestingContract && (
                <div>
                    <h2>Release Tokens</h2>
                    <button onClick={releaseTokens}>Release Tokens</button>
                </div>
            )}

            {vestingContract && (
                <div>
                    <h2>Vesting Info</h2>
                    <button onClick={fetchVestingInfo}>Fetch Vesting Info</button>
                    <div>
                        <p>Beneficiary: {vestingInfo.beneficiary}</p>
                        <p>Cliff: {vestingInfo.cliff}</p>
                        <p>Duration: {vestingInfo.duration}</p>
                        <p>Role: {vestingInfo.role}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
