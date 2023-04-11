// SPDX-License-Identifier: GPL-3.0
// reference: https://medium.com/coinmonks/learn-solidity-lesson-36-cryptography-and-digital-signature-5330e4ae600e

pragma solidity 0.8.19;

/**
 * @title Verifying Signature Contract
 * @author Howard Lee
 * @notice This smart contract is a draft to understand the structure of a signed message
 * @custom:experimental version 1.0.0
 */

contract VerifySignature {
    /// @notice function to verify that signature is indeed signed by EOA
    /// @param sig = signature hash of the signed message
    /// @param text = the message that was signed
    /// @param sender = sender address
    /// @return bool = returns true if signature is verified, otherwise false
    function checkSignature(
        bytes memory sig,
        string memory text,
        address sender
    ) external pure returns (bool) {
        bytes32 hashMsg = keccak256(bytes(text));
        bytes32 hashFinal = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hashMsg)
        );

        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(sig);
        return (ecrecover(hashFinal, v, r, s) == sender);
    }

    /// @notice function to recover the public address of the signer
    /// @param text = the message that was signed
    /// @param sig = signature hash of the signed message
    /// @return address = public address of the signer
    function recoverSignerFromSignature(
        string memory text,
        bytes memory sig
    ) external pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(sig);
        bytes32 hashMsg = keccak256(bytes(text));
        bytes32 hashFinal = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hashMsg)
        );
        address signer = ecrecover(hashFinal, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");
        return signer;
    }

    /// @notice helper function to split up the signature hash to retrieve the values of r,s and v
    /// @param sig = the signature hash of the signed message
    /// @return r = first 32 bytes of the signature hash
    /// @return s = next 32 bytes of the signature hash
    /// @return v = final 1 byte of the signature hash
    function _splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
