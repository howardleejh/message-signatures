import { useState } from 'react'
import verifierAbi from './Abi/verifier.json'
import { ethers } from 'ethers'
import './App.css'

const ethereum = window.ethereum
const provider = new ethers.BrowserProvider(ethereum)

const CONTRACT_ADDR = `0x23471fd730142cbcedd3a46fe558231bf7023ee9`

function App() {
  const [user, setUser] = useState(null)
  const [contract, setContract] = useState(null)
  const [input, setInput] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [status, setStatus] = useState(null)
  const [signedTx, setSignedTx] = useState(null)

  const getUser = async () => {
    const user = await provider.getSigner()
    setUser(user.address)
    return
  }

  const connectContract = async () => {
    const instance = new ethers.Contract(CONTRACT_ADDR, verifierAbi)
    setContract(instance)
    return
  }

  const inputChangeHandler = (event) => {
    setInput(event.target.value)
    return
  }

  const submitHandler = async (event) => {
    event.preventDefault()
    const storedInput = input.trim()
    if (storedInput.length === 0) {
      return console.log('no input')
    }
    if (user === null || contract === null) {
      return console.log('no signer or contract')
    }
    const signer = await provider.getSigner()
    const connected = await contract.connect(signer)
    const tx = await connected.writeSomething(storedInput)
    await tx.wait()
    await getStatus()
    setReceipt(tx.hash)

    return
  }

  const getStatus = async () => {
    const connected = contract.connect(provider)
    const status = await connected.store()
    const { nonce, data, prevData } = status
    const statusData = {
      nonce: nonce.toString(),
      data: data,
      prevData: prevData,
    }
    setStatus(statusData)
  }

  const getTxWithSig = async () => {
    const storedInput = input.trim()
    const signer = await provider.getSigner()
    const connected = await contract.connect(signer)
    // this is to populate tx and get an object with "to" and "data"
    const tx = await connected.writeSomething.populateTransaction(storedInput)
    console.log(tx)
    // this is to sign tx as message
    const signed = await signer.signMessage(tx.data)

    setSignedTx(signed)
  }

  const delegateTxWithSig = async () => {
    const tx = ethers.Transaction.from(signedTx).serialized
    console.log(tx)
  }

  return (
    <div className='App'>
      <h3>Attached Contract: {contract?.target}</h3>
      <h3>User: {user}</h3>
      <h4 id='status'>
        <ul>
          <li>
            <span> Nonce: {status?.nonce}</span>
          </li>
          <li>
            <span> Current: {status?.data}</span>
          </li>
          <li>
            <span> Previous: {status?.prevData}</span>
          </li>
        </ul>
      </h4>
      <ul>
        <li>
          <button onClick={connectContract}>Connect Contract</button>
        </li>
        <li>
          <button onClick={getStatus}>Get Contract Status</button>
        </li>
        <li>
          <button onClick={getUser}>Connect Wallet</button>
        </li>
        <li>
          <form id='contract-fn' onSubmit={submitHandler}>
            <label>Write Something: </label>
            <input
              id='fn-input'
              value={input}
              onChange={inputChangeHandler}
              type='text'
            />
            <button type='submit'>Execute</button>
          </form>
        </li>
        {receipt !== null ? (
          <li>
            <h4>
              Receipt:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${receipt}`}
                target='_blank'
                rel='noreferrer'
              >
                {receipt}
              </a>
            </h4>
          </li>
        ) : (
          <></>
        )}
        <li>
          <button onClick={getTxWithSig}>Save Signature</button>
        </li>
        <li>
          <h5>Signature: {signedTx}</h5>
        </li>
        <li>
          <button onClick={delegateTxWithSig}>Send Signature</button>
        </li>
      </ul>
    </div>
  )
}

export default App
