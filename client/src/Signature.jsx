import * as secp from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';

async function Signature(privateKey, recipient, sendAmount){

    const messageHash = keccak256(utf8ToBytes(recipient + parseInt(sendAmount)));
    return secp.sign(messageHash, privateKey, {recovered:true});
}

export default Signature;