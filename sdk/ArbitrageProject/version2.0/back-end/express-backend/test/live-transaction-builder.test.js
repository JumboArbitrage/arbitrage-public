const assert = require("assert");

const BigNumber = require("bignumber.js");

const { buildLiveTransaction, toHexQuantity } = require("../services/uniswapTradeService");

function createFakeWeb3() {
  function Contract() {
    return {
      methods: {
        getAmountsIn: () => ({
          call: async () => ["10000000000000000", "10000000000000000"],
        }),
        getAmountsOut: () => ({
          call: async () => ["10000000000000000", "10000000000000000"],
        }),
        swapETHForExactTokens: () => ({
          encodeABI: () => "0xbuydata",
        }),
        swapExactTokensForETH: () => ({
          encodeABI: () => "0xselldata",
        }),
      },
    };
  }

  return {
    eth: {
      Contract,
      getTransactionCount: async () => "7",
    },
  };
}

function baseConfig() {
  return {
    web3: createFakeWeb3(),
    rpcHttpUrl: "http://example.invalid",
    chainId: 31337,
    privateKeyIn: "in-key",
    privateKeyOut: "out-key",
    buyInAccount: "0x1111111111111111111111111111111111111111",
    buyOutAccount: "0x2222222222222222222222222222222222222222",
    gasLimit: 400000,
    testTokenAmount: "0.01",
    contracts: {
      router: "0x3333333333333333333333333333333333333333",
      weth: "0x4444444444444444444444444444444444444444",
      testToken: "0x5555555555555555555555555555555555555555",
    },
  };
}

function assertQuantity(value, expected) {
  assert.strictEqual(toHexQuantity(value), expected);
}

function assertNoAsciiEncodedDecimal(txData) {
  const serialized = JSON.stringify(txData).toLowerCase();
  assert.ok(!serialized.includes("0x343030303030"));
  assert.ok(!serialized.includes("0x31303030303030303030"));
  assert.ok(!serialized.includes("0x37"));
}

(async () => {
  assertQuantity("0", "0x0");
  assertQuantity("7", "0x7");
  assertQuantity(400000, "0x61a80");
  assertQuantity("1000000000", "0x3b9aca00");
  assertQuantity(new BigNumber("10000000000000000"), "0x2386f26fc10000");

  for (const invalid of ["abc", "-1", "1.5", Infinity]) {
    assert.throws(() => toHexQuantity(invalid), /non-negative integer/);
  }

  const buy = await buildLiveTransaction(
    { action: "buy", gasPriceWei: "1000000000" },
    baseConfig(),
  );
  assert.strictEqual(buy.txData.from, "0x1111111111111111111111111111111111111111");
  assert.strictEqual(buy.txData.to, "0x3333333333333333333333333333333333333333");
  assert.strictEqual(buy.txData.nonce, "0x7");
  assert.strictEqual(buy.txData.gas, "0x61a80");
  assert.strictEqual(buy.txData.gasPrice, "0x3b9aca00");
  assert.strictEqual(buy.txData.value, "0x23b4a67808b93f");
  assert.strictEqual(buy.txData.data, "0xbuydata");
  assertNoAsciiEncodedDecimal(buy.txData);

  const sell = await buildLiveTransaction(
    { action: "sell", gasPriceWei: "2000000000" },
    baseConfig(),
  );
  assert.strictEqual(sell.txData.from, "0x2222222222222222222222222222222222222222");
  assert.strictEqual(sell.txData.to, "0x3333333333333333333333333333333333333333");
  assert.strictEqual(sell.txData.nonce, "0x7");
  assert.strictEqual(sell.txData.gas, "0x61a80");
  assert.strictEqual(sell.txData.gasPrice, "0x77359400");
  assert.strictEqual(sell.txData.value, undefined);
  assert.strictEqual(sell.txData.data, "0xselldata");
  assertNoAsciiEncodedDecimal(sell.txData);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
