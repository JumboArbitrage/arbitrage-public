const assert = require("assert");

const { validateLiveConfig } = require("../config/runtime");

function validLiveConfig(overrides = {}) {
  return {
    liveTrading: true,
    backendPort: 8081,
    rpcHttpUrl: "https://example.invalid/rpc",
    chainId: 4,
    chainName: "rinkeby",
    privateKeyIn: "1".repeat(64),
    privateKeyOut: `0x${"2".repeat(64)}`,
    buyInAccount: "0x1111111111111111111111111111111111111111",
    buyOutAccount: "0x2222222222222222222222222222222222222222",
    gasLimit: 400000,
    testTokenAmount: "0.01",
    ethAmount: "0.005",
    contracts: {
      factory: "0x6666666666666666666666666666666666666666",
      router: "0x3333333333333333333333333333333333333333",
      weth: "0x4444444444444444444444444444444444444444",
      testToken: "0x5555555555555555555555555555555555555555",
    },
    ...overrides,
  };
}

(() => {
  assert.doesNotThrow(() => validateLiveConfig(validLiveConfig()));

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ buyInAccount: "" })),
    /Live trading requires: BUY_IN_ACCOUNT/,
  );

  assert.throws(
    () =>
      validateLiveConfig(
        validLiveConfig({
          contracts: {
            factory: "",
            router: "0x3333333333333333333333333333333333333333",
            weth: "0x4444444444444444444444444444444444444444",
            testToken: "0x5555555555555555555555555555555555555555",
          },
        }),
      ),
    /Live trading requires: FACTORY_CONTRACT_ADDRESS/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ buyInAccount: "not-an-address" })),
    /valid non-zero 0x addresses.*BUY_IN_ACCOUNT/,
  );

  assert.throws(
    () =>
      validateLiveConfig(
        validLiveConfig({
          contracts: {
            factory: "0x6666666666666666666666666666666666666666",
            router: "0x0000000000000000000000000000000000000000",
            weth: "0x4444444444444444444444444444444444444444",
            testToken: "0x5555555555555555555555555555555555555555",
          },
        }),
      ),
    /valid non-zero 0x addresses.*ROUTER_CONTRACT_ADDRESS/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ privateKeyIn: "not-a-key" })),
    /64-hex-character private keys.*PRIVATE_KEY_1/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ chainId: 0 })),
    /positive numbers.*CHAIN_ID/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ gasLimit: -1 })),
    /positive numbers.*ARBITRAGE_GAS_LIMIT/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ testTokenAmount: "0" })),
    /positive numbers.*ARBITRAGE_TEST_TOKEN_AMOUNT/,
  );

  assert.throws(
    () => validateLiveConfig(validLiveConfig({ ethAmount: "0" })),
    /positive numbers.*ARBITRAGE_ETH_AMOUNT/,
  );
})()
