import './App.css';
import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import members from './Members.json'
import factory from './Factory.json'


import 'bootstrap/dist/css/bootstrap.min.css';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function MakeRequests(props) {
    const {web3, factoryContract} = props;
    const [state, setState] = useState({
	merchantAddress: "",
	mintAmount : "",
	mintTx: "",
	mintAddress: "",
	burnAmount: "",
        isSettingAddress: false,
	isMinting: false,
	isBurning: false
    })

    function bumpState(newStateChunk) {
        setState(prev => {return {
            ...prev,
            ...newStateChunk
        }});
    }

    function handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        bumpState({[name]: value, valid: true})
    }

    async function contractWrite(contractAddress, contractAbi, doer, notifier) {
        const signer = web3.getSigner()
        const protocol = new ethers.Contract(contractAddress, contractAbi, signer)
        try{
            bumpState(notifier(true));
            const tx = await doer(protocol);
            await tx.wait();
        } catch (e) {
            //ignore
            if (e.code !== 4001)
                console.log(e);
        } finally {
            bumpState(notifier(false));
        }
    }

    async function factoryWrite(doer, notifier) {
        return await contractWrite(factoryContract, factory.abi, doer, notifier);
    }
    
    async function setMerchantDepositAddress(event) {
        event.preventDefault();

	await factoryWrite(
            (contract) => contract.setMerchantDepositAddress(state.merchantAddress, {gasLimit: 250000}),
            (b) => ({isSettingAddress: b}));
    }

    async function addMintRequest(event) {
        event.preventDefault();

	if (state.mintAmount.includes(".")) {
	    console.log("Fixed numbers please");
	    return;
	}
	
	const mintAmount = ethers.BigNumber.from(state.mintAmount)
	      .mul(ethers.BigNumber.from(10).pow(8));

	await factoryWrite(
            (contract) => contract.addMintRequest(mintAmount, state.mintTx, state.mintAddress, {gasLimit: 450000}),
            (b) => ({isMinting: b}));
    }

    async function burn(event) {
        event.preventDefault();

	if (state.burnAmount.includes(".")) {
	    console.log("Fixed numbers please");
	    return;
	}

	const burnAmount = ethers.BigNumber.from(state.burnAmount)
	      .mul(ethers.BigNumber.from(10).pow(8));

	await factoryWrite(
            (contract) => contract.burn(burnAmount, {gasLimit: 250000}),
            (b) => ({isBurning: b}));
    }

    return (

<form className="row g-3">
  <div className="col-md-12">
    <label htmlFor="mintAmount" className="form-label">Mint amount</label>
    <input type="text" className="form-control col-sm-10" id="mintAmount" name="mintAmount" value={state.mintAmount} onChange={handleChange}/>
  </div>
  <div className="col-md-12">
    <label htmlFor="mintTx" className="form-label">Your transaction</label>
    <input type="text" className="form-control col-sm-10" id="mintTx" name="mintTx" value={state.mintTx} onChange={handleChange}/>
  </div>
  <div className="col-md-12">
    <label htmlFor="mintAddress" className="form-label">To address</label>
    <input type="text" className="form-control col-sm-10" id="mintAddress" name="mintAddress" value={state.mintAddress} onChange={handleChange}/>
  </div>
  <div className="col-10">
    <button className="btn btn-primary" onClick={addMintRequest}>Add mint request</button>
  </div>
  <div className="col-2">
    {(state.isMinting) &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>

  <div className="col-md-12">
    <label htmlFor="burnAmount" className="form-label">Burn amount</label>
    <input type="text" className="form-control col-sm-10" id="burnAmount" name="burnAmount" value={state.burnAmount} onChange={handleChange}/>
  </div>
  <div className="col-10">
    <button className="btn btn-primary" onClick={burn}>Add burn request</button>
  </div>
  <div className="col-2">
    {(state.isBurning) &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>
  <div className="col-md-12">
    <label htmlFor="merchantAddress" className="form-label">Deposit address</label>
    <input type="text" className="form-control" id="merchantAddress" name="merchantAddress" value={state.merchantAddress} onChange={handleChange}/>
  </div>
  <div className="col-2">
    <button type="submit" className="btn btn-primary" onClick={setMerchantDepositAddress}>Set</button>
  </div>
  <div className="col-2">
    {state.isSettingAddress &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>

</form>

    );
}


function ConfirmRequests(props) {
    const {web3, factoryContract} = props;
    const [state, setState] = useState({
	hash: "",
	burnHash: "",
        isAdding: false,
    })

    function bumpState(newStateChunk) {
        setState(prev => {return {
            ...prev,
            ...newStateChunk
        }});
    }

    function handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        bumpState({[name]: value, valid: true})
    }

    async function contractWrite(contractAddress, contractAbi, doer, notifier) {
        const signer = web3.getSigner()
        const protocol = new ethers.Contract(contractAddress, contractAbi, signer)
        try{
            bumpState(notifier(true));
            const tx = await doer(protocol);
            await tx.wait();
        } catch (e) {
            //ignore
            if (e.code !== 4001)
                console.log(e);
        } finally {
            bumpState(notifier(false));
        }
    }

    async function factoryWrite(doer, notifier) {
        return await contractWrite(factoryContract, factory.abi, doer, notifier);
    }
    
    async function confirmMintRequest(event) {
        event.preventDefault();

	await factoryWrite(
            (contract) => contract.confirmMintRequest(state.hash, {gasLimit: 250000}),
            (b) => ({isAdding: b}));
    }

    async function confirmBurnRequest(event) {
        event.preventDefault();

	await factoryWrite(
            (contract) => contract.confirmBurnRequest(state.burnHash, {gasLimit: 250000}),
            (b) => ({isRemoving: b}));
    }

    return (

<form className="row g-3">
  <div className="col-md-12">
    <label htmlFor="hash" className="form-label">Request hash</label>
    <input type="text" className="form-control" id="hash" name="hash" value={state.hash} onChange={handleChange}/>
  </div>
  <div className="col-2">
    <button type="submit" className="btn btn-primary" onClick={confirmMintRequest}>Confirm</button>
  </div>
  <div className="col-2">
    {state.isAdding &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>
  <div className="col-md-12">
    <label htmlFor="burnHash" className="form-label">Burn request hash</label>
    <input type="text" className="form-control col-sm-10" id="burnHash" name="burnHash" value={state.burnHash} onChange={handleChange}/>
  </div>
  <div className="col-10">
    <button className="btn btn-primary" onClick={confirmBurnRequest}>Confirm burn</button>
  </div>
  <div className="col-2">
    {(state.isRemoving) &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>
</form>

    );
}


function AddRemoveMembers(props) {
    const {web3, membersContract} = props;
    const [state, setState] = useState({
	address: "",
	removeAddress: "",
        isAdding: false,
    })

    function bumpState(newStateChunk) {
        setState(prev => {return {
            ...prev,
            ...newStateChunk
        }});
    }

    function handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        bumpState({[name]: value, valid: true})
    }

    async function contractWrite(contractAddress, contractAbi, doer, notifier) {
        const signer = web3.getSigner()
        const protocol = new ethers.Contract(contractAddress, contractAbi, signer)
        try{
            bumpState(notifier(true));
            const tx = await doer(protocol);
            await tx.wait();
        } catch (e) {
            //ignore
            if (e.code !== 4001)
                console.log(e);
        } finally {
            bumpState(notifier(false));
        }
    }

    async function membersWrite(doer, notifier) {
        return await contractWrite(membersContract, members.abi, doer, notifier);
    }
    
    async function addMember(event) {
        event.preventDefault();

	await membersWrite(
            (contract) => contract.addMerchant(state.address, {gasLimit: 250000}),
            (b) => ({isAdding: b}));
    }

    async function removeMember(event) {
        event.preventDefault();

	await membersWrite(
            (contract) => contract.removeMerchant(state.removeAddress, {gasLimit: 250000}),
            (b) => ({isRemoving: b}));
    }

    return (

<form className="row g-3">
  <div className="col-md-12">
    <label htmlFor="amount" className="form-label">Add address</label>
    <input type="text" className="form-control" id="address" name="address" value={state.address} onChange={handleChange}/>
  </div>
  <div className="col-2">
    <button type="submit" className="btn btn-primary" onClick={addMember}>Add member</button>
  </div>
  <div className="col-2">
    {state.isAdding &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>
  <div className="col-md-12">
    <label htmlFor="removeAddress" className="form-label">Remove address</label>
    <input type="text" className="form-control col-sm-10" id="removeAddress" name="removeAddress" value={state.removeAddress} onChange={handleChange}/>
  </div>
  <div className="col-10">
    <button className="btn btn-primary" onClick={removeMember}>Remove member</button>
  </div>
  <div className="col-2">
    {(state.isRemoving) &&
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Please wait...</span>
    </div>
    }
  </div>
</form>

    );
}

function App() {
    const [ethereum, setEthereum] = useState(null)
    const [web3, setWeb3] = useState(null)
    const [accounts, setAccounts] = useState(null)
    const [chain, setChain] = useState(null);

    function shortAddress(a) {
        if (!a)
            return a;
        return a.substring(0, 6) + "..." + a.substring(a.length - 4, a.length);
    }

    if (ethereum == null) {
	//        console.log("No ethereum");
        detectEthereumProvider().then(eth => {
            if (!eth)
                return;

            setEthereum(eth);
            if (web3 == null) {
                setWeb3(new ethers.providers.Web3Provider(eth));
            }
        });
    }

    function toChain(chainId) {
        //https://chainlist.org/
        switch (chainId) {
        case 1:
            return "ETH";
        case 56:
            return "BSC";
        case 97:
            return "BSC-Test";
        case 137:
            return "Polygon";
        case 80001:
            return "Polygon-Test";
        case 42161:
            return "Arbitrum";
        case 1337:
            return "localhost";
        default:
            return "?";
        }
    }

    useEffect(() => {
        if (ethereum) {
            ethereum.on('accountsChanged', setAccounts);
            ethereum.on('chainChanged', window.location.reload);
            ethereum.request({ method: 'eth_accounts' })
                .then(setAccounts);
            ethereum.request({ method: 'eth_chainId' })
	    //                .then(console.log);
                .then(id => setChain(toChain(parseInt(id, 16))));
        }
        return function cleanup() {
            if (ethereum) {
                ethereum.removeListener('accountsChanged', setAccounts);
                ethereum.removeListener('chainChanged', window.location.reload);
            }
        };
    }, [ethereum]);

    async function requestAccount() {
        ethereum.request({ method: 'eth_requestAccounts' })
            .then(setAccounts);
    }

    
    return (
<div className="App">
  <header className="App-header">
    <div className="container">
      <div className="row">
	<div className="col s12 m6 l6">
  	  Wrapped TICO
     	</div>
  	<div className="col s12 m6 l6">
	  {ethereum ?
          ((accounts == null || accounts.length === 0) ?
  	  <button className="tui-button" onClick={requestAccount}>Connect</button>
	  :
	  <button className="tui-button">{shortAddress(accounts[0])}</button>
	  ) :
	  <button className="tui-button">Install Metamask</button>
	  }
	</div>
      </div>

    </div>
    
  </header>

  <Tabs
    defaultActiveKey="home"
    id="maintab"
    className="mb-3"
    >
    <Tab eventKey="home" title="Home">
      <p>Wrapped TICO delivers the caw caaw &#x1F99C; of TICO with the flexibility
	of a BSC token.</p>

      <p>Wrapped TICO (WTICO) BSC address: 0x9ed4b2D6bC2F193b22D62681223d5EF731F6EB4a</p>

      <img src="parrot.jpg" alt="Parrot"/>

    </Tab>
    <Tab eventKey="admin" title="Administrative">

      <h2>Wrapping &#x1F381;</h2>
      
      <MakeRequests web3={web3} factoryContract="0x08B4d506B1b67Ce7F269d104f64d57D3710ea3aa" />

      <h2>Administrative &#x1F4D2;</h2>

      <AddRemoveMembers web3={web3} membersContract="0xE040fD7E371F28692e14c93F3a89CEaEf681deFa" />

      <ConfirmRequests web3={web3} factoryContract="0x08B4d506B1b67Ce7F269d104f64d57D3710ea3aa" />

      
    </Tab>
  </Tabs>
  
  {chain}
</div>
    );
}

export default App;
