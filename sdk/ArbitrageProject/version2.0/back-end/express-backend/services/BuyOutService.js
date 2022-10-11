var sleep = require('../utils/utils');
var sendSigned = require('../utils/utils');
const Web3 = require('web3');
const BigNumber = require("bignumber.js");
const CONFIG = require("../config/config.json");
/* web3 config: */
const infuraUrl = CONFIG.url;
const web3  = new Web3(infuraUrl);
/* the account address & key: */
const from = CONFIG.address[0];
/* the addr of the contracts: */
const RouterContractAddress = CONFIG.RouterContractAddress;
const WETH9ContractAddress = CONFIG.WETH9ContractAddress;
const TestContractAddress = CONFIG.TestContractAddress;
/* the ABI */
const ROUTER_ABI_JSON = require("../public/ABI/UniswapV2Router02ABI.json");
const TEST_ABI_JSON = require('../public/ABI/TokenERC20ForTestABI.json');
const WETH9_ABI_JSON = require('../public/ABI/WETH9ABI.json');
/* contracts: */
const UniswapV2Router02 = new web3.eth.Contract(ROUTER_ABI_JSON, RouterContractAddress, {from: from});
const WETH = new web3.eth.Contract(WETH9_ABI_JSON, WETH9ContractAddress, {from: from});
const TestToken = new web3.eth.Contract(TEST_ABI_JSON, TestContractAddress, {from: from});
/* trade config: */
const gasLimit = CONFIG.gaslimit;

async function TransactionSellInitForTEST(to, GasPriceForTest) {
    // swap:
    const amoutAInit = 0.02; // 单位：TEST
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amountIn = web3.utils.toHex(decimals.times(amoutAInit));
    let path = [TestContractAddress, WETH9ContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
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
        let amountsExpected = await UniswapV2Router02.methods.getAmountsOut(amountIn, path).call();
        console.log("amountsExpected:", amountsExpected);
        let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(990).dividedToIntegerBy(1000); // 接受 auto 1.0% 的滑点
        let data = await UniswapV2Router02.methods.swapExactTokensForETH(
            amountsExpected[0], // amountIn
            amountOutMin,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        // inValue = BigNumber(amountsExpected[0]).multipliedBy(1.1).toNumber(); // inValue - amountIn >= gas fee
        // console.log("[0]: ", amountsExpected[0], "haha: ", inValue)
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
        console.log(data);
        let hash = await sendSigned(txData); // 调用签名函数
        console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
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
}
    
// swapTokensForExactETH 使用尽量少的token交换精确的ETH
async function TransactionSellInitForTESTPlus(to, GasPriceForTest) {
    const amoutAInit = 0.02; // target 单位：ETH
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amountOut = web3.utils.toHex(decimals.times(amoutAInit));
    let path = [TestContractAddress, WETH9ContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
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
        let amountsExpected = await UniswapV2Router02.methods.getAmountsIn(amountOut, path).call();
        console.log("amountsExpected:", amountsExpected);
        let amountInMax = BigNumber(amountsExpected[0]).dividedToIntegerBy(990).multipliedBy(1000); // 接受 auto 1.0% 的滑点
        let data = await UniswapV2Router02.methods.swapTokensForExactETH(
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
        console.log(data);
        let hash = await sendSigned(txData); // 调用签名函数
        console.log(new Date().toLocaleString(), '\ntransfer:\n', hash);
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
}
    

module.exports = {
    TransactionSellInitForTEST: function(to, GasPriceForTest){},
    TransactionSellInitForTESTPlus: function(to, GasPriceForTest){}
};