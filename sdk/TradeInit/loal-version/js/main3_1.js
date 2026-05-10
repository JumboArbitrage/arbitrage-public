const Web3 = require('web3');
const BigNumber = require("bignumber.js");
const Tx = require('ethereumjs-tx').Transaction;
const CONFIG = require('../config/config.json')
const path = require('path');
const dotenv = require("dotenv")
let envFound = dotenv.config({ path: path.resolve(__dirname, './.env') })
// if (envFound.error) {
//   // This error should crash whole process
//   throw new Error("⚠️  Couldn't find .env file  ⚠️");
// }
const args = require('minimist')(process.argv.slice(2));
const testCount = args['testCount'];
const ethCount = args['ethCount'];
/* web3 config: */
const infuraUrl = CONFIG.url;
const web3  = new Web3(infuraUrl);
/* the account address & key: */
// const from = "0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B";
let metamaskAccounts = new Array();
let keysForAccounts = new Array();
// mas:<17
for (let i = 6; i < 10; i++) {
  metamaskAccounts.push(CONFIG.address[i]);
  keysForAccounts.push(CONFIG.privateKey[i]);
}
/* the addr of the contracts: */
const FactoryContractAddress = CONFIG.FactoryContractAddress;
const RouterContractAddress = CONFIG.RouterContractAddress;
const WETH9ContractAddress = CONFIG.WETH9ContractAddress;
const PairContractAddress = CONFIG.PairContractAddress;
const TestContractAddress = CONFIG.TestContractAddress;
/* the ABI */
const FACTORY_ABI_JSON = require('../ABI/UniswapV2FactoryABI.json');
const ROUTER_ABI_JSON = require("../ABI/UniswapV2Router02ABI.json");
const PAIR_ABI_JSON = require('../ABI/UniswapV2PairABI.json');
const TEST_ABI_JSON = require('../ABI/TokenERC20ForTestABI.json');
const WETH9_ABI_JSON = require('../ABI/WETH9ABI.json')

/* contracts: */
const UniswapV2FactoryArry = new Array();
const UniswapV2Router02Arry = new Array();
const WETHArry = new Array();
const TestTokenArry = new Array();

for (n = 0; n < metamaskAccounts.length; n++) {
  var tempt = new web3.eth.Contract(FACTORY_ABI_JSON, FactoryContractAddress, {from: metamaskAccounts[n]});
  UniswapV2FactoryArry.push(tempt);
  tempt = new web3.eth.Contract(ROUTER_ABI_JSON, RouterContractAddress, {from: metamaskAccounts[n]});
  UniswapV2Router02Arry.push(tempt);
  tempt = new web3.eth.Contract(WETH9_ABI_JSON, WETH9ContractAddress, {from: metamaskAccounts[n]});
  WETHArry.push(tempt);
  tempt = new web3.eth.Contract(TEST_ABI_JSON, TestContractAddress, {from: metamaskAccounts[n]});
  TestTokenArry.push(tempt);
}

// /**
//  * 模拟发送卖单和买单：
//  */
// var BILLS = [];

// main function:
(async function () {       
  // 首先要对自动生成的钱包添加流动性，这里暂时手动添加
  // for (let i in accounts) {
    let gasPrice = web3.eth.getGasPrice().then(console.log);
    console.log("gasPrice: ", gasPrice);
    var Prices = new Array();
    Prices[0] = 1000001000;
    Prices[1] = 1002005000;
    Prices[2] = 1012003000;
    Prices[3] = 10001000000;
    Prices[4] = 10082050000;
    Prices[5] = 10400060000;
    Prices[6] = 10800070000;
    Prices[7] = 11001040000;
    Prices[8] = 100000400000;
    Prices[9] = 100500400000;
    Prices[10] = 115000800000;
    Prices[11] = 155020400000;
    Prices[12] = 175040400000;
    Prices[13] = 1050604000000;
    Prices[14] = 1050804000000;
    Prices[15] = 1052004000000;
    Prices[16] = 1054004000000;
    Prices[17] = 1057004000000;
    /* 流动性相关：*/
    // await AddLiquidity(from, transaction);

    /* Trade:(swap 🤢)
    swapExactTokensForTokens 根据精确的token交换尽量多的token
    swapTokensForExactTokens 使用尽量少的token交换精确的token
    swapExactETHForTokens 根据精确的ETH交换尽量多的token
    swapTokensForExactETH 使用尽量少的token交换精确的ETH
    swapExactTokensForETH 根据精确的token交换尽量多的ETH
    swapETHForExactTokens 使用尽量少的ETH交换精确的token
    swapExactTokensForTokensSupportingFeeOnTransferTokens 支持收税的根据精确的token交换尽量多的token
    swapExactETHForTokensswapExactETHForTokens 支持收税的根据精确的ETH交换尽量多的token
    swapExactTokensForETHSupportingFeeOnTransferTokens 支持收税的根据精确的token交换尽量多的ETH
    */

    var txDataArray = new Array();
    var hashArray = new Array();
    for (i = 0; i < metamaskAccounts.length; i++) {
      let temp;
      if (i == metamaskAccounts.length - 1) { // 最后一笔是卖单
        temp = await TransactionSellInitForTEST(metamaskAccounts[i], Prices[i], TestTokenArry[i], WETHArry[i], UniswapV2Router02Arry[i]);
      } else {
        temp = await TransactionBuyInitForTEST(metamaskAccounts[i], Prices[i], TestTokenArry[i], WETHArry[i], UniswapV2Router02Arry[i]);
      }
      txDataArray.push(temp);
      if ((i == metamaskAccounts.length - 1) || (i == 0)) {
        var blockNum =  await web3.eth.getBlockNumber();
        console.log("blockNum", blockNum);
        while(1) {
          var tmp = await web3.eth.getBlockNumber();
          if (tmp == blockNum + 1) {
            break;
          }
        }
      }
      let hash = await sendSigned(txDataArray[i], keysForAccounts[i]); // 调用签名函数
      console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
      await getReceipt(hash);  
      await sleep(15000); // 15s
    }
    // for (j = 0; j < metamaskAccounts.length; j++) {
    //   let hash = await sendSigned(txDataArray[j], keysForAccounts[j]); // 调用签名函数
    //   console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    //   hashArray.push(hash); 
    //   await sleep(2500);
    // }
    // for(k = 0; k < metamaskAccounts.length; k++) {
    //   await getReceipt(hashArray[k]);                                                                                    
    // }
    // await TransactionBuyInitForTESTPlus(from, Prices[0]);
    // // await sleep(1000);
    // await TransactionSellInitForTESTPlus(from, Prices[1]);
    // // await sleep(1000);
    // await TransactionBuyInitForTEST(from, Prices[2]); 
    // // await sleep(1000);
    // await TransactionSellInitForTEST(from, Prices[3]);
    // // await sleep(1000);

    // let hash = await sendSigned(txData); // 调用签名函数
    // console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    // await getReceipt(hash);  
  // }
})(); 

async function sendSigned(Data, PRIVATE_KEY) {
  if (process.env.LIVE_TRADING !== '1') {
    console.log('dry-run: transaction not submitted');
    return 'dry-run';
  }
  // 签名函数
  let privateKeys = Buffer.from(PRIVATE_KEY, 'hex');
  let thisTransaction = new Tx(Data, {chain: 'rinkeby'}); // let tx = new ethereumjs.Tx(txParams)
  thisTransaction.sign(privateKeys);
  let serializedTx = thisTransaction.serialize().toString('hex');
  console.log('serializedTx: [redacted]');
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

async function getReceipt(hash) {
  let result;
  let desc;
  do {
      let data = await web3.eth.getTransactionReceipt(hash);
      if (data && data.status) {
          desc = data.status;
          console.log("🎉🎉🎉 Swap completed!\n🎉🎉🎉 hash:", hash);
          result = true;
      }
      if (!result) {
          await sleep(300); // ms
      }
  } while (!result);
  return desc;  
}


async function TransactionBuyInitForTEST(to, Prices, TestToken, WETH, Router) { 
  // swap:
  const amoutAInit = ethCount; // 单位：WETH
  let decimals = new BigNumber(10**18); // 做大数处理
  // console.log("decimals: ", decimals)
  let amountIn = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
  let path = [WETH9ContractAddress, TestContractAddress];
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 5 minutes from the current Unix time
  console.log("deadline:", deadline, "amountIn:" + (web3.utils.toBN(amountIn)));
  // approve first:
  let balanceOfETH = await WETH.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of ETH: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of TEST: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
  let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
  if (isSuccessETH && isSuccessTEST) {
    let amountsExpected = await Router.methods.getAmountsOut(amountIn, path).call();
    console.log("amountsExpected:", amountsExpected);
    let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(990).dividedToIntegerBy(1000); // 接受 auto 1.0% 的滑点 
    let data = await Router.methods.swapExactETHForTokens(
      amountOutMin,
      path,
      to, 
      deadline,
    ).encodeABI();
    let nonce = await web3.eth.getTransactionCount(to);
    inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
    // console.log("[0]: ", amountsExpected[0], "haha: ", inValue)
    let txData = {
        nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),// 要调高
        gasPrice: web3.utils.toHex(Prices),
        to: RouterContractAddress, // 这笔交易的接收地址，为router合约
        from: to, // 交易的发起地址
        data: data, // 编码过后的交易数据 
        value: amountIn, // 携带的ETH数量
    }
    return txData;
    // let hash = await sendSigned(txData); // 调用签名函数
    // console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    // await getReceipt(hash);  
  }
}

async function TransactionSellInitForTEST(to, Prices, TestToken, WETH, Router) {
  // swap:
  const amoutAInit = testCount; // 单位：TEST
  let decimals = new BigNumber(10**18); // 做大数处理
  // console.log("decimals: ", decimals)
  let amountIn = web3.utils.toHex(decimals.times(amoutAInit));
  let path = [TestContractAddress, WETH9ContractAddress];
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 5 minutes from the current Unix time
  console.log("deadline:", deadline, "amountIn:" + (web3.utils.toBN(amountIn)));
  // approve first:
  let balanceOfETH = await WETH.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of WETH: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of TEST: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
  let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
  if (isSuccessETH && isSuccessTEST) {
    let amountsExpected = await Router.methods.getAmountsOut(amountIn, path).call();
    console.log("amountsExpected:", amountsExpected);
    let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(990).dividedToIntegerBy(1000); // 接受 auto 1.0% 的滑点 
    let data = await Router.methods.swapExactTokensForETH(
      amountsExpected[0], // amountIn
      amountOutMin,
      path,
      to, 
      deadline,
    ).encodeABI();
    let nonce = await web3.eth.getTransactionCount(to);
    // inValue = BigNumber(amountsExpected[0]).multipliedBy(1.1).toNumber(); // inValue - amountIn >= gas fee
    let txData = {
        nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(Prices),
        to: RouterContractAddress, // 这笔交易的接收地址，为router合约
        from: to, // 交易的发起地址
        data: data, // 编码过后的交易数据 
    }
    return txData;
    // let hash = await sendSigned(txData); // 调用签名函数
    // console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    // await getReceipt(hash);
}
}

// swapTokensForExactETH 使用尽量少的token交换精确的ETH
async function TransactionSellInitForTESTPlus(to, Prices, TestToken, WETH, Router) {
  const amoutAInit = ethCount; // target 单位：ETH
  let decimals = new BigNumber(10**18); // 做大数处理
  // console.log("decimals: ", decimals)
  let amountOut = web3.utils.toHex(decimals.times(amoutAInit));
  let path = [TestContractAddress, WETH9ContractAddress];
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 5 minutes from the current Unix time
  console.log("deadline:", deadline, "amountOut:" + (web3.utils.toBN(amountOut)));
  // approve first:
  let balanceOfETH = await WETH.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of WETH: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of TEST: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
  let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
  if (isSuccessETH && isSuccessTEST) {
    let amountsExpected = await Router.methods.getAmountsIn(amountOut, path).call();
    console.log("amountsExpected:", amountsExpected);
    let amountInMax = BigNumber(amountsExpected[0]).dividedToIntegerBy(990).multipliedBy(1000); // 接受 auto 1.0% 的滑点 
    let data = await Router.methods.swapTokensForExactETH(
      amountsExpected[1], // amountOut
      amountInMax,
      path,
      to, 
      deadline,
    ).encodeABI();
    let nonce = await web3.eth.getTransactionCount(to);
    let txData = {
        nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(Prices),
        to: RouterContractAddress, // 这笔交易的接收地址，为router合约
        from: to, // 交易的发起地址
        data: data, // 编码过后的交易数据 
    }
    return txData;
    // let hash = await sendSigned(txData); // 调用签名函数
    // console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    // await getReceipt(hash);
  }
}

async function TransactionBuyInitForTESTPlus(to, Prices, TestToken, WETH, Router) { 
  const amoutAInit = testCount; // 单位：TEST
  let decimals = new BigNumber(10**18); // 做大数处理
  // console.log("decimals: ", decimals)
  let amountOut = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
  let path = [WETH9ContractAddress, TestContractAddress];
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 5 minutes from the current Unix time
  console.log("deadline:", deadline, "amountOut:" + (web3.utils.toBN(amountOut)));
  // approve first:
  let balanceOfETH = await WETH.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of ETH: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
    from: to
  }, function call(err, result) {
    if (!err) {
      console.log("😙 balance of TEST: ", result)
    } else {
      console.log("❌error: ", err);
    }
  });
  let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
  let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
  if (isSuccessETH && isSuccessTEST) {
    let amountsExpected = await Router.methods.getAmountsIn(amountOut, path).call();
    console.log("amountsExpected:", amountsExpected);
    let amountInMax = BigNumber(amountsExpected[0]).dividedToIntegerBy(990).multipliedBy(1000).toNumber(); // 接受 auto 1.0% 的滑点 
    let data = await Router.methods.swapETHForExactTokens(
      amountOut,
      path,
      to, 
      deadline,
    ).encodeABI();
    let nonce = await web3.eth.getTransactionCount(to);
    inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
    // console.log("[0]: ", amountsExpected[0], "haha: ", inValue)
    let txData = {
        nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),// 要调高
        gasPrice: web3.utils.toHex(Prices),
        to: RouterContractAddress, // 这笔交易的接收地址，为router合约
        from: to, // 交易的发起地址
        data: data, // 编码过后的交易数据 
        value: amountInMax, // 携带的ETH数量
    }
    return txData;
    // let hash = await sendSigned(txData); // 调用签名函数
    // console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
    // await getReceipt(hash);
  }
}


async function AddLiquidity(to, Prices, Factory, Router) {
  // 通过工厂对象调用工厂合约里面的 getPair（）方法，传入 eth 和 TEST 币的地址，得到交易对的地址
  let testPairAddress = await Factory.methods.getPair(TestContractAddress, WETH9ContractAddress).call();
  // console.log("test: ", testPairAddress)
  // 通过 UniswapV2Pair 合约的 abi 和通过工厂合约得到的交易对地址创建 pair 的实例
  let testPair = new web3.eth.Contract(PairABI, testPairAddress);
  // console.log("testPair: ", testPair);
  // 调取 Pair 合约的 getReserves（）方法返回 reserve0、reserve1、blockTimestampLast 信息
  var ReservesAllMessageForTEST = await testPair.methods.getReserves().call();
  // console.log("ReservesAllMessageForTEST: ", ReservesAllMessageForTEST);
  // 获取reserve0、reserve1 用以计算流动性
  // 此处需要做字典排序
  let reserve0ForTEST = ReservesAllMessageForTEST['_reserve0'];
  let reserve1ForTEST = ReservesAllMessageForTEST['_reserve1'];
  let blockTimestampLastForTEST = ReservesAllMessageForTEST['_blockTimestampLast'];
  // console.log("reserve0: " + reserve0ForTEST + "   reserve1: " + reserve1ForTEST);
  // 调用 UniswapV2Router02 合约的 quote 方法，传入指定的 amoutA 数量通过流动性计算出返回的 amoutB 的数量 
  const amoutAInit = 0.001; // 单位：weth，即 decimal: 10000000000000000
  let decimals = new BigNumber(10**18); // 做大数处理
  // console.log("decimals: ", decimals)
  let amoutA = web3.utils.toHex(decimals.times(amoutAInit));
  let amoutB = await Router.methods.quote(amoutA, reserve1ForTEST, reserve0ForTEST).call();
  console.log('amountA: ' + web3.utils.toBN(amoutA), '\nAccoring to the liquidity, the amount of the other coin is: ' + amoutB);
  const tokenAddr = TestContractAddress;
  const amountTokenDesired = amoutB;
  const amountTokenMin = BigNumber(amoutB).minus(1);
  const amountETHMin = BigNumber(amoutA).minus(1);
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from the current Unix time
  let data = Router.methods.addLiquidityETH(
    tokenAddr,
    amountTokenDesired,
    amountTokenMin,
    amountETHMin,
    RouterContractAddress,
    deadline
  ).encodeABI();
  console.log("data: ", data);
  let nonce = await web3.eth.getTransactionCount(to);
  let txDataA = {
      nonce: web3.utils.toHex(nonce), //钱包地址的nonce
      gasLimit: web3.utils.toHex(400000),
      gasPrice: web3.utils.toHex(Prices),
      to: RouterContractAddress, //这笔交易的接收地址，为router合约
      from: to, //交易的发起地址
      data: data, //编码过后的交易数据 
      value: amoutA, //携带的ETH数量
  }
  return txDataA;
  // let hash = await sendSigned(txDataA);//调用签名函数
  // console.log(new Date().toLocaleString(),'transfer',hash);
  // await getReceipt(hash);
}