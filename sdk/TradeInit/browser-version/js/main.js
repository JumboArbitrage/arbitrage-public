  // 在和以太坊兼容的浏览器中使用 web3.js 时，当前环境的原生 provider 会被浏览器设置
  // 例如安装了MetaMask，它在浏览器中注入了window.ethereum下的提供者对象，
  // 我们就可以通过window.ethereum来初始化web3对象
  var accounts;
  const ethereumFunction = async() => {
    // Request account access if needed
    accounts = await ethereum.send('eth_requestAccounts');
    console.log("accounts", accounts);
  }
  var web3Provider;
  if (window.ethereum) {
	  web3Provider = new Web3(window.ethereum);
    try {
      ethereumFunction();
    } catch (error) {
      console.log(error);
    }
  } else if (window.web3) { 
    // 老版 MetaMask Legacy dapp browsers...
	  web3Provider = window.web3.currentProvider;
  } else {
	  // 这里处理连接在不支持dapp的地方打开的情况
	  web3Provider = new providers.HttpProvider('https://eth-testnet.tokenlon.im');
	  console.log("💻 Non-Ethereum browser detected. You should consider trying MetaMask!")

	  // 这种情况下表示用户在不支持dapp的浏览器打开，无法初始化web3

	  // 这里一般的处理逻辑是：使用第一篇中的那种自己初始化，获得区块上的基础数据，但是没法获取用户的账户信息
	  // 或者直接提示错误，不进行任何处理
  }
  this.web3 = new Web3(web3Provider);

  // // 获取账户地址
  // console.log("获取账户地址Coinbase", this.web3.eth.getCoinbase());
  // // 获取metamask中连接的所有账户
  // console.log("获取metamask中连接的所有账户:", this.web3.eth.getAccounts());
  // // 获取网络ID，用来区分在测试网还是正式网
  // console.log("获取链 ID",this.web3.eth.net.getId())
  // console.log("ChainId获取链 ID", this.web3.eth.getChainId())
  // this.web3.eth.net.getId((err, netID) => {
  //   // Main Network: 1   表示主网
  //   // Ropsten Test Network: 3  //测试网Ropsten
  //   // Kovan Test Network: 42  //测试网Kovan
  //   // Rinkeby Test Network: 4  //测试网Rinkeby
  //  console.log("netID: " + netID)});
  //  // 查询当前区块高度
  //  console.log("查询当前区块高度", this.web3.eth.getBlockNumber())
  //  this.web3.eth.getBlockNumber(
  //   function(err, num) { 
  //     if (err === null) {
  //       console.log("BlockNum: " + num);
  //     }
  //   });
  //  // 获取当前metamask账户地址的eth余额
  //  this.web3.eth.getCoinbase((err, coinbase) => {
	//   this.web3.eth.getBalance(coinbase).then(console.log("coinbase: " + coinbase));
  //  })

  //  // 通过hash查询交易
  //  console.log("查询交易",this.web3.eth.getTransaction('0x89535d8905809614010ddf17d5e8eee5e5ad3977e2668441733ad3ad26f16df3'))
  //  // 查询交易Receipt,一般通过这里的status来判断交易是否成功
  //  console.log("查询交易receipt",this.web3.eth.getTransactionReceipt('0x89535d8905809614010ddf17d5e8eee5e5ad3977e2668441733ad3ad26f16df3'))

  // 发送交易https://learnblockchain.cn/docs/web3.js/web3-eth.html#sendtransaction
  // 使用回调
  //  this.web3.eth.sendTransaction({
  //   from:'0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B',//如果from为空，默认取this.web3.eth.defaultAccount
  //   to:'0xe92583e16272632258638d7432a6e1A4fA7ab372',
  //   value:100000000000000, //发送的金额，这里是0.001 ether
  //   gas: 21000 //一个固定值，可选
  //  }, function(error, hash) {
  //   if (error) {
  //     console.log("发送交易失败", error)
  //   } else { 
  //     console.log("发送交易成功， hash:", hash)
  //   }
  // });
  // 其他方法：
  // 1. 使用 promise:
  // this.web3.eth.sendTransaction({
  //   from:'0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B',
  //   to:'0xe92583e16272632258638d7432a6e1A4fA7ab372',
  //   value:10000000000000000
  // }).then(function (receipt) {
  //   //待区块确认后会回调，通过receipt判断交易是否成功
  //   console.log(receipt)
  //   console.log("交易状态：", receipt.status)
  // });
  // 2. 使用事件发生器
  // this.web3.eth.sendTransaction({
  //   from:'0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B',
  //   to:'0xe92583e16272632258638d7432a6e1A4fA7ab372',
  //   value: '10000000000000000'
  // }).on('transactionHash', function(hash){
  //   console.log("发送成功，获取交易hash：",hash)
  // }).on('receipt', function(receipt){
  //   console.log("链上结果返回，返回数据：",receipt)
  // }).on('confirmation', function(confirmationNumber, receipt){
  //   console.log("链上confirmation结果返回，确认数：",confirmationNumber)
  //   console.log("链上confirmation结果返回，返回数据：",receipt)
  // }).on('error', console.error); // 如果是 out of gas 错误, 第二个参数为交易收据

  // 废弃不安全方法!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!：
  // 获取erc20代币余额
  // var json = (function() {
  //   var json = null;
  //   $.ajax({
  //     'async': false,
  //     'global': false,
  //     'url': "../ABI/SwapRouter02ABI.json", //json文件相对于这个HTML的路径
  //     'dataType':"json",
  //     'success':function(data) {
  //       //这个data就是json数据
  //       json = data;
  //     },
  //     error:function() {
  //       alert("请求失败");
  //     }
  //   });
  //   return json;
  // })(); 

  // var json = JSON.parse(WZGLTokenABI)
  // // 发送代币的地址
  // var from = "0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B";
  // // 接收代币的地址
  // var to = "0xe92583e16272632258638d7432a6e1A4fA7ab372";
  // // erc20代币合约地址: 我自己在kovan发行的一个代币0x78616D23E97967eE072f21e82864F55826F674Bb
  // var contractAddress = "0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B";
  // // WZGLTokenABI在前面已经导入
  // console.log(json)
  // var WZGLToken = new this.web3.eth.Contract(json, contractAddress,{
  //   from: from
  // });
  // // 发送一个代币
  // WZGLToken.methods.transfer(to, '1000000000000000000').send({
  //   from: from
  // }, function(error, transactionHash){
  //   if (!error) {
  //   console.log("交易hash: ", transactionHash)
  //   } else {
  //   console.log(error)
  //   }
  // }).then(function (receipt) {
  //   // 监听后续的交易情况
  //   console.log(receipt)
  //   console.log("交易状态：", receipt.status)
  // });

  /* the account address: */
  const from = "0x4bfeb3440b35051BB2ba0c1226bbdcB54d3f5D1B";
  /* the addr of the contracts: */
  const FactoryContractAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const RouterContractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const UniTokenContractAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
  const WETH9ContractAddress = '0xc778417e063141139fce010982780140aa0cd5ab';
  const DaiTokenContractAddress = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735';
  const PairContractAddress = '0x4E99615101cCBB83A462dC4DE2bc1362EF1365e5';
  const TestContractAddress = '0x0DbD59D60A9016B5cb30221D71220dc7474c6947';
  /* abi json： */
  const FactoryABI = JSON.parse(UniswapV2FactoryABI);
  const RouterABI = JSON.parse(UniswapV2Router02ABI);
  const UniTokenABI = JSON.parse(UniABI);
  const WETHABI = JSON.parse(WETH9ABI);
  const TestABI = JSON.parse(TokenERC20ForTestABI);
  const DaiTokenABI = JSON.parse(DaiABI);
  const PairABI = JSON.parse(UniswapV2PairABI);
  /* contracts: */
  const UniswapV2Factory = new this.web3.eth.Contract(FactoryABI, FactoryContractAddress, {
    from: from
  });
  // console.log("UniswapV2Factory:  ", UniswapV2Factory);
  const UniswapV2Router02 = new this.web3.eth.Contract(RouterABI, RouterContractAddress, {
    from: from
  });
  // console.log("UniswapV2Router02:  ", UniswapV2Router02);
  const UniToken = new this.web3.eth.Contract(UniTokenABI, UniTokenContractAddress, {
    from: from
  });
  // console.log("UniToken:  ", UniToken);
  const WETH = new this.web3.eth.Contract(WETHABI, WETH9ContractAddress, {
    from: from
  });
  // console.log("WETH:  ", WETH);
  const TestToken = new this.web3.eth.Contract(TestABI, TestContractAddress, {
    from: from
  });
  // console.log("TestToken:  ", TestToken);
  const DaiToken = new this.web3.eth.Contract(DaiTokenABI, DaiTokenContractAddress, {
    from: from
  });
  // console.log("DaiToken:  ", DaiToken);
  const UniswapV2Pair = new this.web3.eth.Contract(PairABI, PairContractAddress, {
    from: from
  });
  // console.log("UniswapV2Pair:  ", UniswapV2Pair);
  

  /**
   * 模拟发送卖单和买单：
   */
  var BILLS = [];


  // main function:
  (async function () {       
    // for (let i in accounts) {
      const nounce = await web3.eth.getTransactionCount(from, 'pending');
      // console.log("nounce: " + nounce);
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
      await TransactionBuyInitForTESTPlus(from, transaction);
      await TransactionSellInitForTESTPlus(from, transaction);
      await TransactionBuyInitForTEST(from, transaction); 
      await TransactionSellInitForTEST(from, transaction);

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
      // .send(
      //   // amountsExpected[0], 
      //   // BigNumber(amountsExpected[1]).multipliedBy(995).dividedToIntegerBy(1000), // 接受 auto 0.5% 的滑点 
      //   // path,
      //   // to, 
      //   // deadline,
      //   {
      //     from: from,
      //     gasPrice: transaction.maxFeePerGas,
      //     gas: transaction.gas,
      //     value: amountsExpected[0],
      //   }, 
      //   function(error, transactionHash) {
      //     if (!error) {
      //       console.log("🎉🎉🎉 The hash of your transaction is: ", 
      //       transactionHash, 
      //       "\n Check and view the status of your transaction!");
      //     } else {
      //       console.log("❗😅🤢🤮Something went wrong while submitting your transaction:", error)
      //     }
      //   }
      // );
      // console.log("return value(unit[] memory amounts) : " + amounts);
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
    // 签名函数
    let privateKeys = ethereumjs.Buffer.Buffer(PRIVATE_KEY, 'hex');
    let thisTransaction = new ethereumjs.Tx(Data, {chain: 'rinkeby'}); // let tx = new ethereumjs.Tx(txParams)
    thisTransaction.sign(privateKeys);
    let serializedTx = thisTransaction.serialize().toString('hex');
    console.log('serializedTx:', serializedTx);
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
    // // another way
    // // signedTx：要签署我们的交易对象
    // const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
    // // sendSignedTransaction：一旦我们有一个签名的交易，我们可以通过使用将其发送到后续块中
    // web3.eth.sendSignedTransaction('0x' + serializedTx, function(error, hash) {
    //   if (!error) {
    //     console.log("🎉 The hash of your transaction is: ", 
    //     hash, 
    //     "\n Check Pool to view the status of your transaction!");
    //     return hash;
    //   } else {
    //     console.log("❗Something went wrong while submitting your transaction:", error)
    //     return error;
    //   }
    //  });
  }

  // sleep
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }


  // async function TransactionBuyInit(to, transaction) {
  //   // 通过工厂对象调用工厂合约里面的 getPair（）方法，传入 eth 和 Dai 币的地址，得到交易对的地址
  //   let uniPairAddress = await UniswapV2Factory.methods.getPair(WETH9ContractAddress, UniTokenContractAddress).call();
  //   // 通过 UniswapV2Pair 合约的 abi 和通过工厂合约得到的交易对地址创建 pair 的实例
  //   let uniPair = new web3.eth.Contract(PairABI, uniPairAddress);
  //   console.log("uniPair: ",uniPair);
  //   // 调取 Pair 合约的 getReserves（）方法返回 reserve0、reserve1、blockTimestampLast 信息
  //   let ReservesAllMessageForUni = await uniPair.methods.getReserves().call();
  //   console.log("ReservesAllMessageForUni: ", ReservesAllMessageForUni);
  //   // 获取reserve0、reserve1 用以计算流动性
  //   // 此处需要做字典排序
  //   let reserve0ForUni = ReservesAllMessageForUni['_reserve0'];
  //   let reserve1ForUni = ReservesAllMessageForUni['_reserve1'];
  //   let blockTimestampLastForUni = ReservesAllMessageForUni['_blockTimestampLast'];
  //   console.log("reserve0: " + reserve0ForUni + "   reserve1: " + reserve0ForUni);

  //   const amout_A = 0.00000000001; //10000000
  //   let decimals = new BigNumber(10**18); // 做大数处理
  //   console.log("decimals: ", decimals)
  //   let amoutA = web3.utils.toHex(decimals.times(amout_A))
  //   let amoutB = await UniswapV2Router02.methods.quote(amoutA, reserve1ForUni, reserve0ForUni).call();
  //   console.log('流动性计算出的另一种币的数量： ' + amoutB);

  //   // buy:
  //   let amountIn = amoutA; //1000000000000; // 0.000001 WETH (1ETH = 1WETH)
  //   let amountOutMin = 1;
  //   let path = [WETH9ContractAddress, UniTokenContractAddress];
  //   let deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from the current Unix time
  //   let nonce = await web3.eth.getTransactionCount(from);
  //   console.log("deadline:", deadline);
  //   await UniswapV2Router02.methods.swapExactETHForTokens(amountOutMin, path, to, deadline).encodeABI();
  // }
