const Web3 = require('web3');
const BigNumber = require("bignumber.js");
const Tx = require('ethereumjs-tx').Transaction;
const CONFIG = require("./config/config.json");
const path = require('path');
const dotenv = require("dotenv")
let envFound = dotenv.config({ path: path.resolve(__dirname, './.env') })
if (envFound.error) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
const args = require('minimist')(process.argv.slice(2));
const testCount = args['testCount'];
// const ethCount = args['ethCount'];
// log added
const fs = require('fs');
let options = {
    flags: 'w', // 
    encoding: 'utf8', // utf8编码
}
let stderr = fs.createWriteStream(path.resolve(__dirname, './log/out.log'), options);
let logger = new console.Console(stderr);
fs.writeFile(path.resolve(__dirname, './log/out.log'), '', function (err) {
    if(err) {
        console.log(err);
    }
 });
/* ------------------- 跨域 ------------------ */
// const app = express(); // 基于node里面的express服务器
// var cors = require("cors");
// // 缺点：过于暴力，不适合携带cookie
// app.use(cors({
//     origin: [
//         'http://localhost:8080',
//         // 其他跨域域名（自己的域名要带上www，完整），eg: 'http://www.baidu.com'
//     ],
//     credentials: true // 允许客户端携带验证信息
// }))
const express = require('express');
const app = express();
app.use((req, res, next) => {
  // 判断路径
  if(req.path !== '/' && !req.path.includes('.')){
    res.set({
      'Access-Control-Allow-Credentials': true, // 允许后端发送cookie
      'Access-Control-Allow-Origin': req.headers.origin || '*', // 任意域名都可以访问,或者基于我请求头里面的域
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild', // 设置请求头格式和类型
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS', // 允许支持的请求方式
      'Content-Type': 'application/json; charset=utf-8' // 默认与允许的文本格式json和编码格式
    })
  }
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// // or:
// app.all('*',function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:8080');//仅支持配置一个域名
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Credentials',true)//允许客户端携带验证信息
//     next();
//    });

/* web3 config: */
const infuraUrl = CONFIG.url;
const web3  = new Web3(infuraUrl);
/* the account address & key: */
let metamaskAccounts = new Array();
const BuyInAccount = CONFIG.address[0];
const BuyOutAccount = CONFIG.address[1];
// logger.log(BuyInAccount + " & " + BuyOutAccount);
for (i = 0; i < 2; i++) {
    metamaskAccounts.push(CONFIG.address[i]);
}
const PRIVATE_KEY_IN = process.env.PRIVATE_KEY_1;
const PRIVATE_KEY_OUT = process.env.PRIVATE_KEY_2;
// logger.log(PRIVATE_KEY_IN + " & " + PRIVATE_KEY_OUT);
/* the addr of the contracts: */
const FactoryContractAddress = CONFIG.FactoryContractAddress;
const RouterContractAddress = CONFIG.RouterContractAddress;
const UniTokenContractAddress = CONFIG.UniTokenContractAddress;
const WETH9ContractAddress = CONFIG.WETH9ContractAddress;
const DaiTokenContractAddress = CONFIG.DaiTokenContractAddress;
const PairContractAddress = CONFIG.PairContractAddress;
const TestContractAddress = CONFIG.TestContractAddress;
/* the ABI */
const FACTORY_ABI_JSON = require('./public/ABI/UniswapV2FactoryABI.json');
const ROUTER_ABI_JSON = require("./public/ABI/UniswapV2Router02ABI.json");
const PAIR_ABI_JSON = require('./public/ABI/UniswapV2PairABI.json');
const TEST_ABI_JSON = require('./public/ABI/TokenERC20ForTestABI.json');
const UNI_ABI_JSON = require('./public/ABI/UniABI.json');
const WETH9_ABI_JSON = require('./public/ABI/WETH9ABI.json');
const DAI_ABI_JSON = require('./public/ABI/DaiABI.json');


/* contracts: */
let UniswapV2FactoryArry = new Array();
let UniswapV2Router02Arry = new Array();
let WETHArry = new Array();
let TestTokenArry = new Array();
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

/* trade config: */
const gasLimit = CONFIG.gaslimit;

// /* functions: */
// var BuyInService = require('./services/BuyInService');
// const TransactionBuyInit_ = BuyInService.TransactionBuyInitForTEST;
// var BuyOutService = require('./services/BuyOutService');
// var LiquidityService = require('./services/LiquidityService');

const port = 8081;
// 定义路由
app.get('/', function (req, res) {
    res.send('Hello World');
 })

let returnReslt;
app.post('/arbitrage', urlencodedParser, async function(req, res) {
    var tradeDTO = {
        // 单位：wei (10^-18 ETH)
        "Gasprice": req.body.Gasprice,
        // true: ETH -> TEST ()
        "InOrOut": req.body.InOrOut
    }
    let decimals = new BigNumber(10**18); // 做大数处理
    let thisGasPrice = web3.utils.toBN(decimals.times(tradeDTO.Gasprice)).toNumber();
    let gasPrice = web3.eth.getGasPrice().then(logger.log);
    logger.log("GasPrice: ", gasPrice, "new GasPrice: ", thisGasPrice);
    var ans;
    res.status(200).send(JSON.stringify(tradeDTO));
    logger.log(tradeDTO);
    if (tradeDTO.InOrOut == 'true') {
        // swapETHForExactTokens 使用尽量少的ETH交换精确的token
        ans = await TransactionBuyInitForTESTPlus(BuyInAccount, thisGasPrice, TestTokenArry[0], WETHArry[0], UniswapV2Router02Arry[0]);
    } else {
        // swapExactTokensForETH 使用精确的token交换尽量多的eth
        ans = await TransactionSellInitForTEST(BuyOutAccount, thisGasPrice, TestTokenArry[1], WETHArry[1], UniswapV2Router02Arry[1]);
    }
    // if(ans == true) {
    //     res.status(200).send(JSON.stringify(tradeDTO));
    // }
})

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    logger.log("client address: http://%s:%s", host, port);
})

async function sendSigned(Data, PRIVATE_KEY) {
    // 签名函数
    let privateKeys = Buffer.from(PRIVATE_KEY, 'hex');
    let thisTransaction = new Tx(Data, {chain: 'rinkeby'}); // let tx = new ethereumjs.Tx(txParams)
    thisTransaction.sign(privateKeys);
    let serializedTx = thisTransaction.serialize().toString('hex');
    logger.log('serializedTx:\n', serializedTx);
    return new Promise(function (resolve, reject) {
        // sendSignedTransaction：一旦我们有一个签名的交易，我们可以通过使用将其发送到后续块中
        // 获取的原始私钥如果含有 ‘0x’ 会出现类型长度的错误
        new web3.eth.sendSignedTransaction('0x' + serializedTx, function(err, info) {
            if (err) {
                logger.log("❗Something went wrong while submitting your transaction:", err);
                return reject(err);
            } else {
                logger.log("🎉 Send SignedTransaction success!\n🎉 The hash of your transaction is: ",
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

async function TransactionSellInitForTEST(to, GasPriceForTest, TestToken, WETH, Router) {
    logger.log("🙈swapExactTokensForETH:");
    // swap:
    const amoutAInit = testCount; // 单位：TEST
    let decimals = new BigNumber(10**18); // 做大数处理
    // logger.log("decimals: ", decimals)
    let amountIn = web3.utils.toHex(decimals.times(amoutAInit));
    let path = [TestContractAddress, WETH9ContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    logger.log("deadline:", deadline, "amountIn:" + (web3.utils.toBN(amountIn)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("✊ balance of WETH: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("😙 balance of TEST: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
    let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
    if (isSuccessETH && isSuccessTEST) {
        let amountsExpected = await Router.methods.getAmountsOut(amountIn, path).call();
        logger.log("amountsExpected:", amountsExpected);
        let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(995).dividedToIntegerBy(1000); // 接受 auto 0.5% 的滑点
        let data = await Router.methods.swapExactTokensForETH(
            amountsExpected[0], // amountIn
            amountOutMin,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        // inValue = BigNumber(amountsExpected[0]).multipliedBy(1.1).toNumber(); // inValue - amountIn >= gas fee
        // logger.log("[0]: ", amountsExpected[0], "haha: ", inValue)
        let txData = {
            nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
            gasLimit: web3.utils.toHex(300000),
            gasPrice: web3.utils.toHex(GasPriceForTest),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            // value: amountIn, // 携带的TEST数量
            // chain: "rinkeby",
            // chainId: web3.eth.net.getId(),
        }
        let hash = await sendSigned(txData, PRIVATE_KEY_OUT); // 调用签名函数
        logger.log(new Date().toLocaleString(), '\nswapExactTokensForETH transfer:\n', hash);
        let result;
        let desc;
        do {
            let data = await web3.eth.getTransactionReceipt(hash);
            if (data && data.status) {
                desc = data.status;
                result = true;
                logger.log("🎉🎉🎉 swapExactTokensForETH completed!\n🎉🎉🎉 hash:", hash);
            }
            if (!result) {
                await sleep(300); // ms
            }
        } while (!result);
        // logger.log("desc: ", desc);
        if (result == true) {
            return result;
        } else {
            return false;
        }
    }
}
    
// swapTokensForExactETH 使用尽量少的token交换精确的ETH
async function TransactionSellInitForTESTPlus(to, GasPriceForTest, TestToken, WETH, Router) {
    logger.log("🙈swapTokensForExactETH:");
    const amoutAInit = 0.005; // target 单位：ETH
    let decimals = new BigNumber(10**18); // 做大数处理
    // logger.log("decimals: ", decimals)
    let amountOut = web3.utils.toHex(decimals.times(amoutAInit));
    let path = [TestContractAddress, WETH9ContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    logger.log("deadline:", deadline, "amountOut:" + (web3.utils.toBN(amountOut)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("✊ balance of WETH: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("😙 balance of TEST: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
    let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
    if (isSuccessETH && isSuccessTEST) {
        let amountsExpected = await Router.methods.getAmountsIn(amountOut, path).call();
        logger.log("amountsExpected:", amountsExpected);
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
            gasLimit: web3.utils.toHex(300000),
            gasPrice: web3.utils.toHex(GasPriceForTest),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            // value: amountIn, // 不能有这个字段！
            // chain: "rinkeby",
            // chainId: web3.eth.net.getId(),
        }
        logger.log(data);
        let hash = await sendSigned(txData, PRIVATE_KEY_OUT); // 调用签名函数
        logger.log(new Date().toLocaleString(), '\nswapTokensForExactETH transfer:\n', hash);
        let result;
        let desc;
        do {
            let data = await web3.eth.getTransactionReceipt(hash);
            if (data && data.status) {
                desc = data.status;
                logger.log("🎉🎉🎉 swapTokensForExactETH completed!\n🎉🎉🎉 hash:", hash);
                result = true;
            }
            if (!result) {
                await sleep(300); // ms
            }
        } while (!result);
        // logger.log("desc: ", desc);
        if (result == true) {
            return result;
        } else {
            return false;
        }
    }
}


async function TransactionBuyInitForTEST(to, GasPriceForTest, TestToken, WETH, Router) {
    logger.log("🙈swapExactETHForTokens:");
    // swap:
    const amoutAInit = 0.005; // 单位：WETH
    let decimals = new BigNumber(10**18); // 做大数处理
    // logger.log("decimals: ", decimals)
    let amountIn = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
    let path = [WETH9ContractAddress, TestContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    logger.log("deadline:", deadline, "amountIn:" + (web3.utils.toBN(amountIn)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("✊ balance of ETH: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("😙 balance of TEST: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
    let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
    if (isSuccessETH && isSuccessTEST) {
        let amountsExpected = await Router.methods.getAmountsOut(amountIn, path).call();
        logger.log("amountsExpected:", amountsExpected);
        let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(995).dividedToIntegerBy(1000); // 接受 auto 0.5% 的滑点
        let data = await Router.methods.swapExactETHForTokens(
            // amountsExpected[0], // amountIn
            amountOutMin,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        // inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
        // logger.log("[0]: ", amountsExpected[0], "haha: ", inValue)
        let txData = {
            nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
            gasLimit: web3.utils.toHex(400000),// 要调高
            gasPrice: web3.utils.toHex(GasPriceForTest),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            value: amountIn, // 携带的ETH数量
        }
        logger.log(data);
        let hash = await sendSigned(txData, PRIVATE_KEY_IN); // 调用签名函数
        logger.log(new Date().toLocaleString(), '\nswapExactETHForTokens transfer:\n', hash);
        let result;
        let desc;
        do {
            let data = await web3.eth.getTransactionReceipt(hash);
            if (data && data.status) {
                desc = data.status;
                logger.log("🎉🎉🎉 nswapExactETHForTokens completed!\n🎉🎉🎉 hash:", hash);
                result = true;
            }
            if (!result) {
                await sleep(300); // ms
            }
        } while (!result);
        // logger.log("desc: ", desc);
        if (result == true) {
            return result;
        }
    }
};


// swapETHForExactTokens 使用尽量少的ETH交换精确的token
async function TransactionBuyInitForTESTPlus(to, GasPriceForTest, TestToken, WETH, Router) {
    logger.log("🙈swapETHForExactTokens");
    const amoutAInit = testCount; // 单位：TEST
    let decimals = new BigNumber(10**18); // 做大数处理
    // logger.log("decimals: ", decimals)
    let amountOut = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
    let path = [WETH9ContractAddress, TestContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    logger.log("deadline:", deadline, "amountOut:" + (web3.utils.toBN(amountOut)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("✊ balance of ETH: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: to
    }, function call(err, result) {
        if (!err) {
            logger.log("😙 balance of TEST: ", result)
        } else {
            logger.log("❌error: ", err);
        }
    });
    let isSuccessETH = await WETH.methods.approve(to, balanceOfETH).call();
    let isSuccessTEST = await TestToken.methods.approve(to, balanceOfTEST).call();
    if (isSuccessETH && isSuccessTEST) {
        let amountsExpected = await Router.methods.getAmountsIn(amountOut, path).call();
        logger.log("amountsExpected:", amountsExpected);
        let amountInMax = BigNumber(amountsExpected[0]).dividedToIntegerBy(995).multipliedBy(1000).toNumber(); // 接受 auto 0.5% 的滑点
        let data = await Router.methods.swapETHForExactTokens(
            amountOut,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        // inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
        // logger.log("[0]: ", amountsExpected[0], "haha: ", inValue)
        let txData = {
            nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
            gasLimit: web3.utils.toHex(400000),// 要调高
            gasPrice: web3.utils.toHex(GasPriceForTest),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            value: amountInMax, // 携带的ETH数量
        }
        logger.log(data);
        let hash = await sendSigned(txData, PRIVATE_KEY_IN); // 调用签名函数
        logger.log(new Date().toLocaleString(), '\nswapETHForExactTokens transfer:\n', hash);
        let result;
        let desc;
        do {
            let data = await web3.eth.getTransactionReceipt(hash);
            if (data && data.status) {
                desc = data.status;
                logger.log("🎉🎉🎉 swapETHForExactTokens completed!\n🎉🎉🎉 hash:", hash);
                result = true;
            }
            if (!result) {
                await sleep(300); // ms
            }
        } while (!result);
        // logger.log("desc: ", desc);
        if (result == true) {
            return result;
        }
    }
}


async function AddLiquidity(to, GasPriceForTest, Factory, Router) {
    // 通过工厂对象调用工厂合约里面的 getPair（）方法，传入 eth 和 TEST 币的地址，得到交易对的地址
    let testPairAddress = await Factory.methods.getPair(TestContractAddress, WETH9ContractAddress).call();
    // logger.log("test: ", testPairAddress)
    // 通过 UniswapV2Pair 合约的 abi 和通过工厂合约得到的交易对地址创建 pair 的实例
    let testPair = new web3.eth.Contract(PairABI, testPairAddress);
    // logger.log("testPair: ", testPair);
    // 调取 Pair 合约的 getReserves（）方法返回 reserve0、reserve1、blockTimestampLast 信息
    var ReservesAllMessageForTEST = await testPair.methods.getReserves().call();
    // logger.log("ReservesAllMessageForTEST: ", ReservesAllMessageForTEST);
    // 获取reserve0、reserve1 用以计算流动性
    // 此处需要做字典排序
    let reserve0ForTEST = ReservesAllMessageForTEST['_reserve0'];
    let reserve1ForTEST = ReservesAllMessageForTEST['_reserve1'];
    let blockTimestampLastForTEST = ReservesAllMessageForTEST['_blockTimestampLast'];
    // logger.log("reserve0: " + reserve0ForTEST + "   reserve1: " + reserve1ForTEST);
    // 调用 UniswapV2Router02 合约的 quote 方法，传入指定的 amoutA 数量通过流动性计算出返回的 amoutB 的数量
    const amoutAInit = 0.01; // 单位：weth，即 decimal: 10000000000000000
    let decimals = new BigNumber(10**18); // 做大数处理
    // logger.log("decimals: ", decimals)
    let amoutA = web3.utils.toHex(decimals.times(amoutAInit));
    let amoutB = await Router.methods.quote(amoutA, reserve1ForTEST, reserve0ForTEST).call();
    logger.log('amountA: ' + web3.utils.toBN(amoutA), '\nAccoring to the liquidity, the amount of the other coin is: ' + amoutB);
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
    logger.log("data: ", data);
    let nonce = await web3.eth.getTransactionCount(to);
    let txDataA = {
        nonce: web3.utils.toHex(nonce), //钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(GasPriceForTest),
        to: RouterContractAddress, //这笔交易的接收地址，为router合约
        from: to, //交易的发起地址
        data: data, //编码过后的交易数据
        value: amoutA, //携带的ETH数量
    }
    let hash = await sendSigned(txDataA);//调用签名函数
    logger.log(new Date().toLocaleString(),'transfer',hash);
    let result = '';
    let desc;
    do {
        let data = await web3.eth.getTransactionReceipt(hash);
        if (data && data.status) {
            desc = data.status;
            logger.log("🎉🎉🎉 Add liquidity completed!\n🎉🎉🎉 hash:", hash);
            result = true;
        }
        if (!result) {
            await sleep(300); // ms
        }
    } while (!result);
    logger.log("desc: ", desc);
    if (result == true) {
        return result;
    }
}
