const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "e236b51a883941b3f848f016c4f21b333095d0c2": 100,
  "6368ceadc97b1b329d911b50c50c027be434e53f": 50,
  "68a8a57c8329e27863129d075342685aea4be431": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, hash, sig, recoveryBit } = req.body;

  // hash and sig are sent as objects in the request body so need to be converted back to Uint8 Array
  const hashArr = Uint8Array.from(Object.values(hash));
  const sigArr = Uint8Array.from(Object.values(sig));

  // recover public key
  const pubKey = secp.recoverPublicKey(hashArr, sigArr, recoveryBit);

  // convert pub key to Eth address (same as "sender")
  const keccakHash = keccak256(pubKey.slice(1));
  const ethAddress = toHex(keccakHash.slice(12));

  // compare recovered eth address with sender address as form of sig verification
  if (ethAddress === sender) {
    setInitialBalance(sender);
    setInitialBalance(recipient);
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    // set 40x response if sig verification failed
    res.status(401).send({ message: "Signature verification failed" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
