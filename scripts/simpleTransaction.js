const { privateKey } = require('../privateKey');
const { getUtxos, showError } = require('../helpers');
const bsv = require('bsv');

(async () => {
    try {
        const keyPair = new bsv.KeyPair().fromPrivKey(privateKey)
        const sourceAddress = new bsv.Address.Testnet().fromPubKey(keyPair.pubKey)

        console.log(sourceAddress.toString())
        let utxos = await getUtxos(sourceAddress);

        let utxo = utxos[0];

        console.log(utxos)

        // Create the unspent output
        const txHashBuf = Buffer.from(utxo.txId, 'hex').reverse();
        const txOut = bsv.TxOut.fromProperties(
            new bsv.Bn(utxo.satoshis), // Satoshi Amount in the UTXO
            sourceAddress.toTxOutScript() // Locking script of the UTXO
        )

        var txb = new bsv.TxBuilder()
            .setFeePerKbNum(500) // 0.5 sat/B
            .setChangeAddress(sourceAddress)

        txb.inputFromPubKeyHash(
            txHashBuf,
            utxo.outputIndex,
            txOut,
            keyPair.pubKey
        )

        txb.outputToAddress(new bsv.Bn(10000), sourceAddress)

        // Build the transaction
        txb.build({ useAllInputs: true });

        // Sign the transaction
        txb.signTxIn(0, keyPair);

        // Print the transactions json. The transaction hex code can be found in `txb.tx`.
        console.log(txb.toJSON())

    } catch (error) {
        console.log('Failed on testnet')
        console.error(error)
        showError(error)
    }

})();