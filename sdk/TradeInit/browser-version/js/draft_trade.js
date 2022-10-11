const myDexExec = require('../dex/myDexExec'); // 引入fs模块
const accounts = require('../util/accounts.json');
const uniRouterABI = require('../abi/uniRouter.json');
const Web3 = require('web3');
const uniABI = require('../abi/uni.json');
const uniFactoryABI = require('../abi/uniFactory.json');
const uniPairABI = require('../abi/uniPair.json');
const ethABI = require('../abi/WETH.json')
const config = require('../config');
const BigNumber = require("bignumber.js");
const Tx = require('ethereumjs-tx');
const util = require('../util/util');
const web3 = new Web3('https://rinkeby.infura.io/v3/45192e3bb296499a93ef0a73c0eb159a');


//母账号转账
let symbol, amountToken, toAddress, amountEth;
symbol = 'uni';
amountToken = 1; // 向每个子账户转账的 uni 币数量
amountEth = 0.1; // 向每个子账户转账的 eth 数量
let addr = new Array();
// uniFACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
const uniRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const uniTokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const WETHAddress = '0xc778417e063141139fce010982780140aa0cd5ab';
const uniFactoryAddr= '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const uniPairAddress = '0x4E99615101cCBB83A462dC4DE2bc1362EF1365e5';

(async function () {       
    for (let i in accounts) {
        console.log('------------向子账户转账------------');
        await transferAccounts(accounts[i]);  // 母账户向所有子账户转账
        console.log('------------转账完成----------------')
        console.log('------------添加流动性--------------');
        await AddLiquidity(accounts[i]);  //账号添加流动性
        console.log('------------流动性完成--------------');
        console.log('------------账号提币----------------');
        await WithdrawMoney(accounts[i]);  //账号提币
        console.log('------------提币完成----------------');
    }

})();

async function transferAccounts(accounts){//母账户向所有子账户转账（uni,eth）
        
        toAddress = accounts.address;
        let addrLenth = addr.push(toAddress);
        if (addrLenth < 3) {
            //uni币转账
            let tokenTransResult = await myDexExec.transaction(symbol, amountToken, toAddress);
            if(!tokenTransResult){
                console.log(' uni 转账失败！！ ');
                return;
            }
            //查询 uin 币的余额
            let uniBalancer = await myDexExec.getBalanceFromSymbol(symbol,toAddress);
            console.log(toAddress + " 成功---uni余额：" + uniBalancer);

            //eth币转账
            let ethTransResult = await myDexExec.transactionEth(amountEth, toAddress);
            if (!ethTransResult) {
            console.log(' eth 转账失败！！ ')
            }
            //查询 ETH 币的余额
            let ETHbalancer = await myDexExec.getEthBalance(toAddress);
            console.log(toAddress + "成功---ETH余额：" + ETHbalancer);
        }
    
}


async function AddLiquidity(accounts){
    //账号添加流动性
    let toAddress = accounts.address;

    let Router = new web3.eth.Contract(uniRouterABI, uniRouterAddress);
    let Factory = new web3.eth.Contract(uniFactoryABI,uniFactoryAddr);
    //通过工厂对象调用工厂合约里面的 getPair（）方法，传入 eth 和 uni 币的地址，得到交易对的地址 
    let pairAddress = await Factory.methods.getPair(WETHAddress,uniTokenAddress).call();
    //通过 unisawppair 合约的 abi 和通过工厂合约得到的交易对地址创建 pair 的实例
    let uniPair = new web3.eth.Contract(uniPairABI,pairAddress);
    //调取 Pair 合约的 getReserves（）方法返回 reserve0、reserve1、blockTimestampLast 信息
    let ReservesAllMessage = await uniPair.methods.getReserves().call();
    //获取reserve0、reserve1 用以计算流动性
    //此处需要做字典排序
    let reserve0 = ReservesAllMessage['_reserve0'];
    let reserve1 = ReservesAllMessage['_reserve1'];

    let blockTimestampLast = ReservesAllMessage['_blockTimestampLast'];
    //调用 router 合约的 quote 方法，传入指定的 amoutA 数量通过流动性计算出返回的 amoutB 的数量
    const amout_A = 0.000000001;
    let decimals = new BigNumber(10**18);//做大数处理
    let amoutA =web3.utils.toHex(decimals.times(amout_A))
    let amoutB = await Router.methods.quote(amoutA,reserve1,reserve0).call();
    console.log('流动性计算出的另一种币的数量： '+ amoutB);

    //添加流动性函数 addLiquidityETH() 需要如下参数，在签名数据时需要携带ETH数量
    const tokenAddr = uniTokenAddress;
    const amountTokenDesired = amoutB;
    const amountTokenMin = amoutB-1;
    const amountETHMin = amoutA-1;
    const to = uniRouterAddress;
    const deadline = Date.now() + 600;
    
    let data = Router.methods.addLiquidityETH(tokenAddr,amountTokenDesired,amountTokenMin,amountETHMin,to,deadline).encodeABI();
    let nonce = await web3.eth.getTransactionCount(config.walletAddr);
    let getGasPrice = 1000000000;//1gas为1*10**9

    let txDataA = {
        nonce: web3.utils.toHex(nonce),//钱包地址的nonce
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: uniRouterAddress,//这笔交易的接收地址，为router合约
        from: toAddress,//交易的发起地址
        data: data,//编码过后的交易数据 
        value:amoutA,//携带的ETH数量
    }
    let hash = await myDexExec.sendSigned(txDataA);//调用签名函数
    console.log(new Date().toLocaleString(),'transfer',hash);
    console.log('流动性添加后返回的哈希：' + hash);
    let result = '';
    let desc;
    do {
        let data = await myDexExec.checkTrade(hash);
        if (data && data.status) {
            desc = data.status;
            result = true;
        }
        if (!result) {
            await util.sleep(300);
        }
    } while (!result);
    return desc;  
}


async function WithdrawMoney(accounts){ 
    // 账号提币
    //母账户向所有子账户提币（转账（uni,eth））
    const amount = 0.005;
    const toaddr = '0x88ded3010c9E9B2b2D1914B07C0d674281952d19';
    const uniTokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
    let addrs = new Array();//账户地址
    let keys = new Array();//私钥
    
    let fromAddress = accounts.address;//获取的账户地址       
    let pKey = accounts.privateKey;//获取的私钥

    let addrLenth0 = addrs.push(fromAddress);//将 key 对的地址 fromAddress 存到一个指定的数组
    let keysLenth = keys.push(pKey)//将 key 存到一个指定的数组
    if (addrLenth0 < 3) {
        console.log("提币地址数组长度: "+ addrLenth0 + ' ---本次获取的账户地址为： ' + fromAddress);
        console.log('对应私钥 key 的数组长度：' + keysLenth + ' ---本次获取的私钥为: ' + pKey);
        //uni币转账
        let tokenTransResult = await transactionToken(fromAddress, amount, toaddr,uniTokenAddress,pKey);
        if(!tokenTransResult){
            console.log(' uni 转账失败！！ ');
            return;
        }
        //查询 uin 币的余额
        let uniBalancer = await myDexExec.getBalanceFromSymbol(symbol,fromAddress);
        console.log(`${fromAddress} 提币_uni 余额：${uniBalancer}`);
        //eth币转账
        let ethTransResult = await transactionETH(fromAddress,amount,toaddr,pKey);
        if (!ethTransResult) {
            console.log(' eth 转账失败！！ ')
        }
        //查询 ETH 币的余额
        let ETHbalancer = await myDexExec.getEthBalance(fromAddress);
        console.log(`${fromAddress} 提币_ETH余额：${ETHbalancer}`);
    }

}

    
async function transactionToken(fromAddress,amount,toaddr,tokenAddress,pKey){  
    //uni 交易（从 fromAddress 转 amount 个数量到 toaddr 地址，接受 amount 数量的币的币地址为 tokenAddress）      
    const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
    let decimals = new BigNumber(10**18);
    let amountTrans = web3.utils.toHex(decimals.times(amount));
    let uniContract = new web3.eth.Contract(uniABI, uniAddress);
    
    let data = uniContract.methods.transfer(toaddr,amountTrans).encodeABI();
    let nonce = await web3.eth.getTransactionCount(fromAddress);
    let getGasPrice = 1000000000;
    let txData = {
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: tokenAddress,//需要调取合约，是币的合约地址
        from: fromAddress,
        data: data,
    }
    let hash = await sendSigned(txData,pKey);//调用签名函数
    console.log(new Date().toLocaleString(),'transfer',hash);
    let result = '';
    let desc;
    do{
        let data = await myDexExec.checkTrade(hash);
        if (data && data.status) {
            desc = data.status;
            result = true;
        }
        if (!result) {
            await util.sleep(300);
        }
    }while(!result);
    return desc;
}


async function transactionETH(fromAddress,amount,toAddress,pKey){
    //ETH交易(从 fromAddress 地址转 amount 个数量到 toAddress 地址)
    // const toddress = '0x88ded3010c9E9B2b2D1914B07C0d674281952d19';
    let decimals = new BigNumber(10**18);
    let amountTrans = web3.utils.toHex(decimals.times(amount));
    let nonce = await web3.eth.getTransactionCount(fromAddress);
    let getGasPrice = 1000000000;
    let txData = {
        nonce: Web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(400000),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: toAddress,//ETH转账不用调取合约，直接是接收地址
        from:fromAddress,
        value:amountTrans,
    }
    let hash = await sendSigned(txData,pKey);//调用签名函数
    console.log(new Date().toLocaleString(),'transactionETH',hash);
    let result = '';
    let desc;
    do {  
        let data = await myDexExec.checkTrade(hash);//交易完成检查，不检查会出现 nonce 相等的情况从而导致交易失败
        if (data && data.status) {
            desc = data.status;
            result = true;
        }
        if (!result) {
            await util.sleep(300);
        }
    } while (!result);
    return desc;
}


async function sendSigned(txData, pKey) {
    //签名函数
    let privateKeys = Buffer.from(pKey,'hex');
    let transaction = new Tx.Transaction(txData,{chain: 'rinkeby'});
    transaction.sign(privateKeys);
    let serializedTx = transaction.serialize().toString('hex');
    return new Promise(function (resolve,reject){//获取的原始私钥如果含有 ‘0x’ 会出现类型长度的错误
        web3.eth.sendSignedTransaction('0x' + serializedTx,function(err,info){
            if (err) {
                return reject(err);
            }
            return resolve(info);
        })
    })
}
