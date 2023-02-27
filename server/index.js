const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require('ethereum-cryptography/keccak');
const { utf8ToBytes } = require('ethereum-cryptography/utils');
const { toHex } = require('ethereum-cryptography/utils');

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

//Private keys just for debugging purposes
const balances = {
  //447385fbe3afcf969d2714e404a8b994a1d4258fbf6ed094b6db1101e45246b1
  "0449afbdb382994d86f9439b75578fd381aa1aac8e4c0e0396ed27dd9b4c1d244c8f7adbeb1dadf5fb38b52b42268009ba62cc5fd0d997e1c5405d210ee01eae96": 100,
  //0b30c3a1bdf04f28bba6fc83475addeef2e73768e7d5b1294cae0731dbd3e27d
  "04dced87a60f0fec570d13dca0151e41ae9660bb0ce1885574dde5fda09de303bd5342583056f62517919a37692dfdc673b5bb9cda8e56aef3af7f9b789c1d5fef": 50,
  //7d0e612bd0696c145ee870267eb7dd805ae70ca5d12393fa799e19d7c0da7cef
  "048729919094a91fde92d0aca2d231216df693dfad94eb0331cd179c9fa17e2052188bacc27da17aa3d821c1bbc7c96465ade37b35788cecd776026aae856364b3": 75,
  //d99ec032b99d5efa5529b9ecf9458ece3ac1db5eae84647775089cf0a8edb044
  "04cd29fdbf15a116cb9a6a698190af2952324b2de886fc621dbc3ca17f4f5feb8f307eb2355c6e120c3122f8395957a67002ee9c8d3fd5106025ba697e34be2a3f": 25,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  const messageHash = keccak256(utf8ToBytes(recipient + amount));
  const uintSignature = Uint8Array.from(Object.values(signature));
  const recoveredPublicKey = toHex(secp.recoverPublicKey(messageHash, uintSignature, recoveryBit));
  const verified = secp.verify(uintSignature, messageHash, sender);

  if (verified && recoveredPublicKey == sender) {
    setInitialBalance(sender);
    setInitialBalance(recipient);
    if (recipient != sender) {
      if (balances[sender] < amount) {
        res.status(400).send({ message: "Not enough funds!" });
      } else {
        balances[sender] -= amount;
        balances[recipient] += amount;
        res.send({ balance: balances[sender] });
      }
    } else {
      res.status(400).send({ message: "Cannot send transaction to your own address!" });
    }
  } else {
    res.status(400).send({ message: `Signatures don't match! Expected ${recoveredPublicKey} to equal ${sender}` });
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
