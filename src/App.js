import React, { useState, useEffect } from 'react';
import web3 from './web3';
import contract from './contract';

function App() {
    const [account, setAccount] = useState('');
    const [beneficiary, setBeneficiary] = useState('');
    const [cliff, setCliff] = useState('');
    const [duration, setDuration] = useState('');
    const [role, setRole] = useState('User');
    const [vestingInfo, setVestingInfo] = useState({});

    useEffect(() => {
        const loadBlockchainData = async () => {
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
        };

        loadBlockchainData();
    }, []);

    const addBeneficiary = async () => {
        await contract.methods.addBeneficiary(
            beneficiary,
            web3.utils.toWei(cliff, 'ether'),
            web3.utils.toWei(duration, 'ether'),
            role
        ).send({ from: account });
    };

    const releaseTokens = async () => {
        await contract.methods.releaseTokens().send({ from: account });
    };

    const fetchVestingInfo = async () => {
        const info = await contract.methods.beneficiaries(account).call();
        setVestingInfo(info);
    };

    return (
        <div className="App">
            <h1>Vesting Contract</h1>
            <div>
                <h2>Add Beneficiary</h2>
                <input
                    type="text"
                    placeholder="Beneficiary Address"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Cliff (in seconds)"
                    value={cliff}
                    onChange={(e) => setCliff(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Duration (in seconds)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="0">User</option>
                    <option value="1">Partner</option>
                    <option value="2">Team</option>
                </select>
                <button onClick={addBeneficiary}>Add Beneficiary</button>
            </div>
            <div>
                <h2>Release Tokens</h2>
                <button onClick={releaseTokens}>Release Tokens</button>
            </div>
            <div>
                <h2>Vesting Information</h2>
                <button onClick={fetchVestingInfo}>Fetch Vesting Info</button>
                <div>
                    <p>Cliff: {vestingInfo.cliff}</p>
                    <p>Start: {vestingInfo.start}</p>
                    <p>Duration: {vestingInfo.duration}</p>
                    <p>Amount: {vestingInfo.amount}</p>
                    <p>Released: {vestingInfo.released}</p>
                </div>
            </div>
        </div>
    );
}

export default App;
