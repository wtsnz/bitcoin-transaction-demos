const { exit } = require('process')
const bsv = require('bsv');

// fill in private key on testnet in WIF here
const key = ''

if (!key) {
    genPrivKey()
}

function genPrivKey() {

    const newPrivKey = new bsv.PrivKey.Testnet().fromRandom()

    const address = new bsv.Address.Testnet().fromPrivKey(newPrivKey);

    console.log(`Missing private key, generating a new one ...
Private key generated: '${newPrivKey.toWif()}'
You can fund its address '${address}' from some faucet and use it to complete the test
Example faucets are https://faucet.bitcoincloud.net and https://testnet.satoshisvision.network`)
    exit(0)
}

const privateKey = new bsv.PrivKey.Testnet()
privateKey.fromWif(key)

module.exports = {
    privateKey,
    genPrivKey
}