const assert = require("assert");

const { createArbitrageService } = require("../services/arbitrageService");

const config = {
  liveTrading: false,
  backendPort: 0,
  rpcHttpUrl: "",
  chainId: 4,
  chainName: "rinkeby",
  privateKeyIn: "",
  privateKeyOut: "",
  buyInAccount: "0x1111111111111111111111111111111111111111",
  buyOutAccount: "0x2222222222222222222222222222222222222222",
  gasLimit: 400000,
  testTokenAmount: "0.01",
  ethAmount: "0.005",
  contracts: {
    factory: "0x0000000000000000000000000000000000000000",
    router: "0x3333333333333333333333333333333333333333",
    weth: "0x4444444444444444444444444444444444444444",
    testToken: "0x5555555555555555555555555555555555555555",
  },
};

(async () => {
  const service = createArbitrageService(config);

  const buy = await service.handleArbitrageRequest({
    Gasprice: "0.000000001",
    InOrOut: "true",
  });

  assert.strictEqual(buy.mode, "dry-run");
  assert.strictEqual(buy.submitted, false);
  assert.strictEqual(buy.plan.action, "buy");
  assert.strictEqual(buy.plan.method, "swapETHForExactTokens");
  assert.strictEqual(buy.plan.gasPriceWei, "1000000000");
  assert.ok(!JSON.stringify(buy).includes(config.buyInAccount));

  const sell = await service.handleArbitrageRequest({
    Gasprice: "0.000000002",
    InOrOut: "false",
  });

  assert.strictEqual(sell.plan.action, "sell");
  assert.strictEqual(sell.plan.method, "swapExactTokensForETH");

  await assert.rejects(
    () => service.handleArbitrageRequest({ Gasprice: "0", InOrOut: "true" }),
    /Gasprice must be a positive numeric string/,
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
