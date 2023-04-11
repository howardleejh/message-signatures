import { useState } from 'react'
import { ethers, toUtf8Bytes } from 'ethers'
import './App.css'

const ethereum = window.ethereum
const provider = new ethers.BrowserProvider(ethereum)

function App() {
  const [wallet, setWallet] = useState(null)
  const [input, setInput] = useState(null)
  const [hash, setHash] = useState(null)
  const [signed, setSigned] = useState(null)
  const [altSigned, setAltSigned] = useState(null)
  const [messageResults, setMessageResults] = useState(null)

  const getUser = async () => {
    try {
      const wallet = await provider.getSigner()
      setWallet(wallet)
    } catch (err) {
      console.log(err)
    }
    return
  }

  const onInputChange = (event) => {
    event.preventDefault()
    setInput(event.target.value)
  }

  const hashMessage = async () => {
    if (input === null || input.trim().length === 0) {
      return console.log('no input')
    }
    const hash = ethers.keccak256(toUtf8Bytes(input))

    setHash({
      message: input,
      hash: hash,
    })
    return
  }

  // uses ethersJS to sign message
  // requires ethers.getBytes() instead of directly using the hashMessage to properly verify signature
  // hashMessage > keccak256(toUtfBytes()) > getBytes() === "personal_sign" method for metamask
  const signMessage = async () => {
    const messageHash = ethers.getBytes(hash.hash)
    const signer = await provider.getSigner()
    try {
      const signed = await signer.signMessage(messageHash)
      setSigned(signed)
    } catch (err) {
      console.log(err)
    }
  }
  // uses Metamask ethereum.request({method: 'personal_sign}) to sign message
  const signMessageAlternately = async () => {
    const messageHash = hash.hash
    const signer = await provider.getSigner()
    try {
      const signed = await ethereum.request({
        method: 'personal_sign',
        params: [signer?.address, messageHash],
      })
      setAltSigned(signed)
    } catch (err) {
      console.log(err)
    }
  }

  const getSigner = async () => {
    try {
      const results = await ethers.verifyMessage(
        ethers.getBytes(hash.hash),
        signed
      )
      setMessageResults(results)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className='App'>
      <ul id='status'>
        <li>
          <h3>wallet: {wallet?.address}</h3>
        </li>
        <li>
          <h3>message: {hash?.message}</h3>
        </li>
        <li>
          <h3>hash: {hash?.hash}</h3>
        </li>
        <li>
          <input onChange={onInputChange} placeholder='message' />
        </li>
        <li>
          <button onClick={hashMessage}>Hash Message</button>
        </li>
        <li>
          <button onClick={getUser}>Connect Wallet</button>
        </li>
        <li>
          <button onClick={signMessage}>Sign Message</button>
        </li>
        {signed ? (
          <li className='signature'>
            <h3 style={{ color: altSigned === signed ? 'green' : 'red' }}>
              Signature: {signed}
            </h3>
          </li>
        ) : (
          <></>
        )}
        <li>
          <button onClick={signMessageAlternately}>
            Sign Message Alternately
          </button>
        </li>
        {altSigned ? (
          <li className='signature'>
            <h3 style={{ color: altSigned === signed ? 'green' : 'red' }}>
              Signature: {altSigned}
            </h3>
          </li>
        ) : (
          <></>
        )}
        {signed !== null && altSigned !== null ? (
          signed === altSigned ? (
            <strong style={{ color: 'green' }}>
              EthersJS & Metamask signature matches!
            </strong>
          ) : (
            <strong style={{ color: 'red' }}>
              Ethers & Metamask signature does not match!
            </strong>
          )
        ) : (
          <></>
        )}
        <li>
          <button onClick={getSigner}>Get Signer</button>
        </li>
        <li>
          <h4>Signer: {messageResults}</h4>
        </li>
      </ul>
    </div>
  )
}

export default App
