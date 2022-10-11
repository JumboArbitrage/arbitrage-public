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
const FactoryContractAddress = CONFIG.FactoryContractAddress;
const RouterContractAddress = CONFIG.RouterContractAddress;
const UniTokenContractAddress = CONFIG.UniTokenContractAddress;
const WETH9ContractAddress = CONFIG.WETH9ContractAddress;
const DaiTokenContractAddress = CONFIG.DaiTokenContractAddress;
const PairContractAddress = CONFIG.PairContractAddress;
const TestContractAddress = CONFIG.TestContractAddress;
/* the ABI */
const FACTORY_ABI_JSON = require('../public/ABI/UniswapV2FactoryABI.json');
const ROUTER_ABI_JSON = require("../public/ABI/UniswapV2Router02ABI.json");
const PAIR_ABI_JSON = require('../public/ABI/UniswapV2PairABI.json');
const TEST_ABI_JSON = require('../public/ABI/TokenERC20ForTestABI.json');
const UNI_ABI_JSON = require('../public/ABI/UniABI.json');
const WETH9_ABI_JSON = require('../public/ABI/WETH9ABI.json');
const DAI_ABI_JSON = require('../public/ABI/DaiABI.json');
/* contracts: */
const UniswapV2Factory = new web3.eth.Contract(FACTORY_ABI_JSON, FactoryContractAddress, {from: from});
const UniswapV2Router02 = new web3.eth.Contract(ROUTER_ABI_JSON, RouterContractAddress, {from: from});
const UniToken = new web3.eth.Contract(UNI_ABI_JSON, UniTokenContractAddress, {from: from});
const WETH = new web3.eth.Contract(WETH9_ABI_JSON, WETH9ContractAddress, {from: from});
const TestToken = new web3.eth.Contract(TEST_ABI_JSON, TestContractAddress, {from: from});
const DaiToken = new web3.eth.Contract(DAI_ABI_JSON, DaiTokenContractAddress, {from: from});
const UniswapV2Pair = new web3.eth.Contract(PAIR_ABI_JSON, PairContractAddress, {from: from});
/* trade config: */
const gasLimit = CONFIG.gaslimit;

async function AddLiquidity(to, GasPriceForTest) {
    // 通过工厂对象调用工厂合约里面的 getPair（）方法，传入 eth 和 TEST 币的地址，得到交易对的地址
    let testPairAddress = await UniswapV2Factory.methods.getPair(TestContractAddress, WETH9ContractAddress).call();
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
    const amoutAInit = 0.01; // 单位：weth，即 decimal: 10000000000000000
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amoutA = web3.utils.toHex(decimals.times(amoutAInit));
    let amoutB = await UniswapV2Router02.methods.quote(amoutA, reserve1ForTEST, reserve0ForTEST).call();
    console.log('amountA: ' + web3.utils.toBN(amoutA), '\nAccoring to the liquidity, the amount of the other coin is: ' + amoutB);
    const tokenAddr = TestContractAddress;
    const amountTokenDesired = amoutB;
    const amountTokenMin = BigNumber(amoutB).minus(1);
    const amountETHMin = BigNumber(amoutA).minus(1);
    let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from the current Unix time
    let data = UniswapV2Router02.methods.addLiquidityETH(
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
        gasPrice: web3.utils.toHex(GasPriceForTest),
        to: RouterContractAddress, //这笔交易的接收地址，为router合约
        from: to, //交易的发起地址
        data: data, //编码过后的交易数据
        value: amoutA, //携带的ETH数量
    }
    let hash = await sendSigned(txDataA);//调用签名函数
    console.log(new Date().toLocaleString(),'transfer',hash);
    let result = '';
    let desc;
    do {
        let data = await web3.eth.getTransactionReceipt(hash);
        if (data && data.status) {
            desc = data.status;
            console.log("🎉🎉🎉 Add liquidity completed!\n🎉🎉🎉 hash:", hash);
            result = true;
        }
        if (!result) {
            await sleep(300); // ms
        }
    } while (!result);
    return desc;
}

module.exports = {
    AddLiquidity: function(to, GasPriceForTest){}
}