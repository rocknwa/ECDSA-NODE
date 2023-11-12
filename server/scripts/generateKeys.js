const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();
console.log(`privatekey: `, toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
const keccakHash = keccak256(publicKey.slice(1));
console.log(`publicKey: `, toHex(keccakHash.slice(12)));