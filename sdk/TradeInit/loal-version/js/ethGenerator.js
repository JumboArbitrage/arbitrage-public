var Wallet = require('ethereumjs-wallet')
const fs = require('fs');
const path = require('path');

fs.appendFile(path.join(__dirname, "../config/address.json"), "{\n\"address\": [\n", (err) => {
    if (err) throw err;
    console.log('🙈 address need to be added!');
 }); 
fs.appendFile(path.join(__dirname, "../config/privateKey.json"), "{\n\"privatekey\": [\n", (err) => {
    if (err) throw err;
    console.log('🙈 privateKey need to be added!');
 }); 
const num = 2;
// 生成  num 个钱包地址数量
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
    
	// 将所有地址保存到文件中
    fs.appendFile(path.join(__dirname, "../config/address.json"), addr, (err) => {
        if (err) throw err;
        console.log('🙈 address need to be added!');
     }); 
     // 将所有的私钥保存到私钥文件中
     fs.appendFile(path.join(__dirname, "../config/privateKey.json"), pKey, (err) => {
        if (err) throw err;
        console.log('🙈 privateKey need to be added!');
     }); 

}

// 'use strict';
// console.log('Generator Start..............');
// const num = 5;
// const secp256k1 = require("secp256k1/elliptic");
// const createKeccakHash = require("keccak");
// const crypto = require('crypto');
// // 地址转换
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
//   // 生成私钥
//   const privateKey = crypto.randomBytes(32);
//   // 生成公钥
//   const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
//   // 生成地址
//   const address = createKeccakHash("keccak256").update(publicKey).digest().slice(-20);
//   const normAddress = toChecksumAddress(address.toString('hex'));
//   // 查看结果
//   console.log(privateKey.toString('hex'));
//   console.log(normAddress);
// }