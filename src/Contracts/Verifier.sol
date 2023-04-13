// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract Verifier {
    using SignatureChecker for *;

    struct Store {
        uint256 nonce;
        string data;
        string prevData;
    }

    Store public store;

    function writeSomething(string calldata _input) external returns (bool) {
        if (store.nonce == 0) {
            store.nonce++;
            store.data = _input;
            return true;
        }
        store.nonce++;
        store.prevData = store.data;
        store.data = _input;
        return true;
    }

    function verifySig(
        address _signer,
        bytes32 _hash,
        bytes calldata _signature
    ) external view returns (bool) {
        return SignatureChecker.isValidSignatureNow(_signer, _hash, _signature);
    }
}
