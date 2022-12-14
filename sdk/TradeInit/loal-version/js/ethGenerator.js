var Wallet = require('ethereumjs-wallet')
const fs = require('fs');
const path = require('path');

fs.appendFile(path.join(__dirname, "../config/address.json"), "{\n\"address\": [\n", (err) => {
    if (err) throw err;
    console.log('π address need to be added!');
 }); 
fs.appendFile(path.join(__dirname, "../config/privateKey.json"), "{\n\"privatekey\": [\n", (err) => {
    if (err) throw err;
    console.log('π privateKey need to be added!');
 }); 
const num = 2;
// ηζ  num δΈͺι±εε°εζ°ι
for(var i = 0; i < num; i++) {
    const EthWallet = Wallet.default.generate(false);
    
    const addressALL = EthWallet.getAddressString();
    let addr;
    if(i < num - 1) {
        addr = "\"" + addressALL + "\",\n";
    } else {
        addr = "\"" + addressALL + "\"\n]\n}";
    }
    console.log("address[" + i + "]: " + EthWallet.getAddressString());

    const privateKeyALL = EthWallet.getPrivateKeyString();
    let pKey;
    if(i < num - 1) {
        pKey = "\"" + privateKeyALL.slice(2) + "\",\n";
    } else {
        pKey = "\"" + privateKeyALL.slice(2) + "\"\n]\n}";
    }
    console.log("privateKey[" + i + "]: " + EthWallet.getPrivateKeyString());
    
	// ε°ζζε°εδΏε­ε°ζδ»ΆδΈ­
    fs.appendFile(path.join(__dirname, "../config/address.json"), addr, (err) => {
        if (err) throw err;
        console.log('π address need to be added!');
     }); 
     // ε°ζζηη§ι₯δΏε­ε°η§ι₯ζδ»ΆδΈ­
     fs.appendFile(path.join(__dirname, "../config/privateKey.json"), pKey, (err) => {
        if (err) throw err;
        console.log('π privateKey need to be added!');
     }); 

}

// 'use strict';
// console.log('Generator Start..............');
// const num = 5;
// const secp256k1 = require("secp256k1/elliptic");
// const createKeccakHash = require("keccak");
// const crypto = require('crypto');
// // ε°εθ½¬ζ’
// function toChecksumAddress(address) {
//     address = address.toLowerCase().replace('0x', ''); 
//     var hash = createKeccakHash('keccak256').update(address).digest('hex'); 
//     var ret = '0x'; 
//     for (var i = 0; i < address.length; i++) {   
//         if (parseInt(hash[i], 16) >= 8) {     
//             ret += address[i].toUpperCase();   
//         } else {     
//             ret += address[i];   
//         } 
//     } 
//     return ret;
// }

// for (var i = 0; i < num; i++) {
//   // ηζη§ι₯
//   const privateKey = crypto.randomBytes(32);
//   // ηζε¬ι₯
//   const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
//   // ηζε°ε
//   const address = createKeccakHash("keccak256").update(publicKey).digest().slice(-20);
//   const normAddress = toChecksumAddress(address.toString('hex'));
//   // ζ₯ηη»ζ
//   console.log(privateKey.toString('hex'));
//   console.log(normAddress);
// }