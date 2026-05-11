const BigNumber = require("bignumber.js");

function createWeb3(config) {
  if (config.web3) return config.web3;
  const { Web3 } = require("web3");
  return new Web3(config.rpcHttpUrl);
}

function toWei(value) {
  return new BigNumber(value).multipliedBy("1000000000000000000").integerValue().toFixed(0);
}

function toHexQuantity(value) {
  const decimal = new BigNumber(value);
  if (!decimal.isFinite() || decimal.lt(0) || !decimal.isInteger()) {
    throw new Error("Transaction quantity must be a non-negative integer");
  }
  return `0x${BigInt(decimal.toFixed(0)).toString(16)}`;
}

async function buildLiveTransaction(plan, config) {
  const web3 = createWeb3(config);
  const routerAbi = require("../public/ABI/UniswapV2Router02ABI.json");
  const router = new web3.eth.Contract(routerAbi, config.contracts.router);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

  if (plan.action === "buy") {
    const account = config.buyInAccount;
    const amountOut = toHexQuantity(toWei(config.testTokenAmount));
    const path = [config.contracts.weth, config.contracts.testToken];
    const amountsExpected = await router.methods.getAmountsIn(amountOut, path).call();
    const amountInMax = new BigNumber(amountsExpected[0])
      .multipliedBy(1000)
      .dividedToIntegerBy(995)
      .toFixed(0);
    const data = router.methods
      .swapETHForExactTokens(amountOut, path, account, deadline)
      .encodeABI();

    return {
      web3,
      privateKey: config.privateKeyIn,
      txData: {
        nonce: toHexQuantity(await web3.eth.getTransactionCount(account)),
        gas: toHexQuantity(config.gasLimit),
        gasPrice: toHexQuantity(plan.gasPriceWei),
        chainId: config.chainId,
        to: config.contracts.router,
        from: account,
        data,
        value: toHexQuantity(amountInMax),
      },
    };
  }

  const account = config.buyOutAccount;
  const amountIn = toHexQuantity(toWei(config.testTokenAmount));
  const path = [config.contracts.testToken, config.contracts.weth];
  const amountsExpected = await router.methods.getAmountsOut(amountIn, path).call();
  const amountOutMin = new BigNumber(amountsExpected[1])
    .multipliedBy(995)
    .dividedToIntegerBy(1000)
    .toFixed(0);
  const data = router.methods
    .swapExactTokensForETH(amountsExpected[0], amountOutMin, path, account, deadline)
    .encodeABI();

  return {
    web3,
    privateKey: config.privateKeyOut,
    txData: {
      nonce: toHexQuantity(await web3.eth.getTransactionCount(account)),
      gas: toHexQuantity(config.gasLimit),
      gasPrice: toHexQuantity(plan.gasPriceWei),
      chainId: config.chainId,
      to: config.contracts.router,
      from: account,
      data,
    },
  };
}

async function signAndSend(web3, txData, privateKey, config) {
  const signed = await web3.eth.accounts.signTransaction(txData, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  return receipt.transactionHash;
}

async function executeLiveSwap(plan, config) {
  const { web3, txData, privateKey } = await buildLiveTransaction(plan, config);
  const transactionHash = await signAndSend(web3, txData, privateKey, config);
  return { transactionHash };
}

module.exports = {
  buildLiveTransaction,
  executeLiveSwap,
  toHexQuantity,
};
