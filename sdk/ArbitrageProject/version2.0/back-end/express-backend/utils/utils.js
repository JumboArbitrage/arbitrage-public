const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const CONFIG = require("../config/config.json");
const path = require('path');
const dotenv = require('dotenv');
const envFound = dotenv.config({ path: path.resolve(__dirname, '../.env') })
/* web3 config: */
const infuraUrl = CONFIG.url;
const web3  = new Web3(infuraUrl);
/* the account address & key: */
const PRIVATE_KEY = process.env.PRIVATE_KEY;
console.log(PRIVATE_KEY)
/* trade config: */
const gasLimit = CONFIG.gaslimit;

async function sendSigned(Data) {
    // 签名函数
    let privateKeys = Buffer.from(PRIVATE_KEY, 'hex');
    let thisTransaction = new Tx(Data, {chain: 'rinkeby'}); // let tx = new ethereumjs.Tx(txParams)
    thisTransaction.sign(privateKeys);
    let serializedTx = thisTransaction.serialize().toString('hex');
    console.log('serializedTx:\n', serializedTx);
    return new Promise(function (resolve, reject) {
        // sendSignedTransaction：一旦我们有一个签名的交易，我们可以通过使用将其发送到后续块中
        //获取的原始私钥如果含有 ‘0x’ 会出现类型长度的错误
        new web3.eth.sendSignedTransaction('0x' + serializedTx, function(err, info) {
            if (err) {
                console.log("❗Something went wrong while submitting your transaction:", err);
                return reject(err);
            } else {
                console.log("🎉 Send SignedTransaction success!\n🎉 The hash of your transaction is: ",
                    info,
                    "\n🎉 Check Pool to view the status of your transaction!");
                return resolve(info);
            }
        })
    })
}

// sleep
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = {
    sendSigned: function(to, GasPriceForTest){},
    sleep: function(to, GasPriceForTest){}
}