
const axios = require('axios')
const API_PREFIX = 'https://api.whatsonchain.com/v1/bsv/test'
const bsv = require('bsv');

async function getUtxos(address) {

    let {
        data: utxos
    } = await axios.get(`${API_PREFIX}/address/${address.toString()}/unspent`)

    utxos = utxos.map((utxo) => ({
        txId: utxo.tx_hash,
        outputIndex: utxo.tx_pos,
        satoshis: utxo.value,
        script: new bsv.Script().fromPubKeyHash(address.hashBuf).toHex(),
    }))

    return utxos
}

async function sendTx(tx) {
  const {
    data: txid
  } = await axios.post(`${API_PREFIX}/tx/raw`, {
    txhex: tx
  })
  console.log(txid);
  return txid
}

function showError(error) {
    // Error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Failed - StatusCodeError: ' + error.response.status + ' - "' + error.response.data + '"');
      // console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the
      // browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error:', error.message);
      if (error.context) {
        console.log(error.context);
      }
    }
  };

module.exports = {
    getUtxos,
    sendTx,
    showError
}