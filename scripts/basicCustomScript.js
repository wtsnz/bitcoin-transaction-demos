const { privateKey } = require('../privateKey');
const { getUtxos, sendTx, showError } = require('../helpers');
const { Sig, Interp } = require('bsv');
const bsv = require('bsv');

(async () => {
    try {
        const keyPair = new bsv.KeyPair().fromPrivKey(privateKey)
        const sourceAddress = new bsv.Address.Testnet().fromPubKey(keyPair.pubKey)

        var lockingScript = new bsv.Script().fromString("OP_5 OP_EQUAL");
        var unlockingScript = new bsv.Script().fromString("OP_5");

        var lockingTxId;
        var satoshisInScript = 10_000;

        {
            // 1. Create the transaction to lock satoshis into our script

            let utxos = await getUtxos(sourceAddress);
            let utxo = utxos[0];
        
            // Create the unspent output
            const txHashBuf = Buffer.from(utxo.txId, 'hex').reverse();
            const txOut = bsv.TxOut.fromProperties(
                new bsv.Bn(utxo.satoshis), // Satoshi amount in the UTXO
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
            
            // Add an output to the locking script
            txb.outputToScript(new bsv.Bn(satoshisInScript), lockingScript)
    
            // Build the transaction
            txb.build({ useAllInputs: true });
    
            // Sign the transaction
            txb.signTxIn(0, keyPair);
    
            // Print the transactions json. The transaction hex code can be found in `txb.tx`.
            console.log(txb.toJSON())

            lockingTxId = await sendTx(txb.tx.toHex());
            console.log("Locking TxId: " + lockingTxId);
        }

        {
            // 2. Create the transaction to unlock the satoshis in our script
    
            // Configure the UTXO that we created in (1) using the script hash
            let utxo = {
                txId: lockingTxId,
                outputIndex: 0,
                satoshis: satoshisInScript
            }
        
            // Create the unspent output as a TxOut
            const txHashBuf = Buffer.from(utxo.txId, 'hex').reverse();
            const txOut = bsv.TxOut.fromProperties(
                new bsv.Bn(utxo.satoshis), // Satoshi amount in the UTXO
                lockingScript // Locking script of the UTXO
            )
    
            var txb = new bsv.TxBuilder()
                .setFeePerKbNum(500) // 0.5 sat/B
                .setChangeAddress(sourceAddress)
    
            // Add the input using the TxOut we created, but provide the unlocking script
            txb.inputFromScript(
                txHashBuf,
                utxo.outputIndex,
                txOut,
                unlockingScript // Unlocking script
            )
            // Have to do this so that the build() command works
            txb.addSigOperation(txHashBuf, utxo.outputIndex, 0)

            txb.build()

            let unlockingTx = await sendTx(txb.tx.toHex());
            console.log("Unlocking TxId: " + unlockingTx);
        }
    } catch (error) {
        console.log('Failed on testnet')
        showError(error)
    }

})();