const Web3 = require('web3');
const BigNumber = require("bignumber.js");
const Tx = require('ethereumjs-tx').Transaction;

/* web3 config: */
const infuraUrl = '';
const API_KEY = '';
const web3  = new Web3(infuraUrl);
/* the account address & key: */
const from = "0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B";
const PRIVATE_KEY = '';
/* the addr of the contracts: */
const FactoryContractAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const RouterContractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UniTokenContractAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const WETH9ContractAddress = '0xc778417e063141139fce010982780140aa0cd5ab';
const DaiTokenContractAddress = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735';
const PairContractAddress = '0x4E99615101cCBB83A462dC4DE2bc1362EF1365e5';
const TestContractAddress = '0x0DbD59D60A9016B5cb30221D71220dc7474c6947';
/* the ABI */
const FACTORY_ABI_JSON = require('../ABI/UniswapV2FactoryABI.json');
const ROUTER_ABI_JSON = require("../ABI/UniswapV2Router02ABI.json");
const PAIR_ABI_JSON = require('../ABI/UniswapV2PairABI.json');
const TEST_ABI_JSON = require('../ABI/TokenERC20ForTestABI.json');
const UNI_ABI_JSON = require('../ABI/UniABI.json');
const WETH9_ABI_JSON = require('../ABI/WETH9ABI.json')
const DAI_ABI_JSON = require('../ABI/DaiABI.json')

/* contracts: */
const UniswapV2Factory = new web3.eth.Contract(FACTORY_ABI_JSON, FactoryContractAddress, {
    from: from
});
const UniswapV2Router02 = new web3.eth.Contract(ROUTER_ABI_JSON, RouterContractAddress, {
    from: from
});
const UniToken = new web3.eth.Contract(UNI_ABI_JSON, UniTokenContractAddress, {
    from: from
});
const WETH = new web3.eth.Contract(WETH9_ABI_JSON, WETH9ContractAddress, {
    from: from
});
const TestToken = new web3.eth.Contract(TEST_ABI_JSON, TestContractAddress, {
    from: from
});
const DaiToken = new web3.eth.Contract(DAI_ABI_JSON, DaiTokenContractAddress, {
    from: from
});
const UniswapV2Pair = new web3.eth.Contract(PAIR_ABI_JSON, PairContractAddress, {
    from: from
});



// /**
//  * 模拟发送卖单和买单：
//  */
// var BILLS = [];


// main function:
(async function () {
    // for (let i in accounts) {
    const nounce = await web3.eth.getTransactionCount(from, 'pending');
    let gasPrice = web3.eth.getGasPrice().then(console.log);
    console.log("gasPrice: ", gasPrice);
    const transaction = {
        'to' : from, // 要将 Eth 发​​送到的地址
        // 'value': 100, // 希望发送的金额，在wei哪里指定10¹⁸ wei = 1 ETH
        'gas': 30000, // 21000 是在以太坊上的操作将使用的最低气体量，因此为了确保我们的交易能够执行，我们将 30000 放在这里
        'maxFeePerGas': 10000000000, // 为执行交易支付的每笔 gas 金额 1gas为1*10**10
        'nonce': nounce, // nonce 规范用于跟踪从您的地址发送的交易数量
        // data：这是可选的，用于在您的转账中发送附加信息，或调用智能合约，余额转账不需要
    }
    // }
})();

async function AddLiquidity(to, transaction) {
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
        gasPrice: web3.utils.toHex(transaction.maxFeePerGas),
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

async function TransactionBuyInitForTEST(to, transaction) {
    // swap:
    const amoutAInit = 0.01; // 单位：WETH
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amountIn = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
    let path = [WETH9ContractAddress, TestContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    console.log("deadline:", deadline, "amountIn:" + (web3.utils.toBN(amountIn)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(from).call({
        from: from
    }, function call(err, result) {
        if (!err) {
            console.log("😙 balance of ETH: ", result)
        } else {
            console.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(from).call({
        from: from
    }, function call(err, result) {
        if (!err) {
            console.log("😙 balance of TEST: ", result)
        } else {
            console.log("❌error: ", err);
        }
    });
    let isSuccessETH = await WETH.methods.approve(from, balanceOfETH).call();
    let isSuccessTEST = await TestToken.methods.approve(from, balanceOfTEST).call();
    if (isSuccessETH && isSuccessTEST) {
        let amountsExpected = await UniswapV2Router02.methods.getAmountsOut(amountIn, path).call();
        console.log("amountsExpected:", amountsExpected);
        let amountOutMin = BigNumber(amountsExpected[1]).multipliedBy(990).dividedToIntegerBy(1000); // 接受 auto 1.0% 的滑点
        let data = await UniswapV2Router02.methods.swapExactETHForTokens(
            // amountsExpected[0], // amountIn
            amountOutMin,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
        console.log("[0]: ", amountsExpected[0], "haha: ", inValue)
        let txData = {
            nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
            gasLimit: web3.utils.toHex(400000),// 要调高
            gasPrice: web3.utils.toHex(transaction.maxFeePerGas),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            value: amountIn, // 携带的ETH数量
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

async function TransactionSellInitForTEST(to, transaction) {
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
        from: from
    }, function call(err, result) {
        if (!err) {
            console.log("😙 balance of WETH: ", result)
        } else {
            console.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: from
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
            gasPrice: web3.utils.toHex(10000000000),
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
async function TransactionSellInitForTESTPlus(to, transaction) {
    const amoutAInit = 0.02; // target 单位：ETH
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amountOut = web3.utils.toHex(decimals.times(amoutAInit));
    let path = [TestContractAddress, WETH9ContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
    console.log("deadline:", deadline, "amountOut:" + (web3.utils.toBN(amountOut)));
    // approve first:
    let balanceOfETH = await WETH.methods.balanceOf(to).call({
        from: from
    }, function call(err, result) {
        if (!err) {
            console.log("😙 balance of WETH: ", result)
        } else {
            console.log("❌error: ", err);
        }
    });
    let balanceOfTEST = await TestToken.methods.balanceOf(to).call({
        from: from
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
            gasPrice: web3.utils.toHex(10000000000),
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

// swapETHForExactTokens 使用尽量少的ETH交换精确的token
async function TransactionBuyInitForTESTPlus(to, transaction) {
    const amoutAInit = 0.05; // 单位：TEST
    let decimals = new BigNumber(10**18); // 做大数处理
    // console.log("decimals: ", decimals)
    let amountOut = web3.utils.toHex(decimals.times(amoutAInit)); // 例如 10000000000000000 == 0.01 WETH (1ETH = 1WETH)
    let path = [WETH9ContractAddress, TestContractAddress];
    let deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from the current Unix time
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
        let amountsExpected = await UniswapV2Router02.methods.getAmountsIn(amountOut, path).call();
        console.log("amountsExpected:", amountsExpected);
        let amountInMax = BigNumber(amountsExpected[0]).dividedToIntegerBy(990).multipliedBy(1000).toNumber(); // 接受 auto 1.0% 的滑点
        let data = await UniswapV2Router02.methods.swapETHForExactTokens(
            amountOut,
            path,
            to,
            deadline,
        ).encodeABI();
        let nonce = await web3.eth.getTransactionCount(to);
        inValue = BigNumber(amountsExpected[0]).multipliedBy(2).toNumber(); // inValue - amountIn >= gas fee
        console.log("[0]: ", amountsExpected[0], "haha: ", inValue)
        let txData = {
            nonce: web3.utils.toHex(nonce), // 钱包地址的nonce
            gasLimit: web3.utils.toHex(400000),// 要调高
            gasPrice: web3.utils.toHex(transaction.maxFeePerGas),
            to: RouterContractAddress, // 这笔交易的接收地址，为router合约
            from: to, // 交易的发起地址
            data: data, // 编码过后的交易数据
            value: amountInMax, // 携带的ETH数量
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


async function sendSigned(Data) {
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
