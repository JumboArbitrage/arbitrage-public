const path = require("path");

const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../../../../.env") });

const staticConfig = require("./config.json");

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function envNumber(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number`);
  }
  return parsed;
}

function isLiveTrading() {
  return env("LIVE_TRADING", "0") === "1";
}

function loadRuntimeConfig() {
  const liveTrading = isLiveTrading();
  const addresses = staticConfig.address || [];

  return {
    liveTrading,
    backendPort: envNumber("BACKEND_PORT", 8081),
    rpcHttpUrl: env("RPC_HTTP_URL", staticConfig.url || ""),
    chainId: envNumber("CHAIN_ID", 4),
    chainName: env("CHAIN_NAME", "rinkeby"),
    privateKeyIn: env("PRIVATE_KEY_1"),
    privateKeyOut: env("PRIVATE_KEY_2"),
    buyInAccount: env("BUY_IN_ACCOUNT", addresses[0] || ""),
    buyOutAccount: env("BUY_OUT_ACCOUNT", addresses[1] || ""),
    gasLimit: envNumber("ARBITRAGE_GAS_LIMIT", staticConfig.gaslimit || 400000),
    testTokenAmount: env("ARBITRAGE_TEST_TOKEN_AMOUNT", "0.01"),
    ethAmount: env("ARBITRAGE_ETH_AMOUNT", "0.005"),
    contracts: {
      factory: env("FACTORY_CONTRACT_ADDRESS", staticConfig.FactoryContractAddress || ""),
      router: env("ROUTER_CONTRACT_ADDRESS", staticConfig.RouterContractAddress || ""),
      weth: env("WETH9_CONTRACT_ADDRESS", staticConfig.WETH9ContractAddress || ""),
      testToken: env("TEST_CONTRACT_ADDRESS", staticConfig.TestContractAddress || ""),
    },
  };
}

function validateLiveConfig(config) {
  const required = [
    ["RPC_HTTP_URL", config.rpcHttpUrl],
    ["PRIVATE_KEY_1", config.privateKeyIn],
    ["PRIVATE_KEY_2", config.privateKeyOut],
    ["BUY_IN_ACCOUNT", config.buyInAccount],
    ["BUY_OUT_ACCOUNT", config.buyOutAccount],
    ["ROUTER_CONTRACT_ADDRESS", config.contracts.router],
    ["WETH9_CONTRACT_ADDRESS", config.contracts.weth],
    ["TEST_CONTRACT_ADDRESS", config.contracts.testToken],
  ];

  const missing = required.filter(([, value]) => !value);
  if (missing.length) {
    throw new Error(
      `Live trading requires: ${missing.map(([name]) => name).join(", ")}`,
    );
  }
}

module.exports = {
  loadRuntimeConfig,
  validateLiveConfig,
};
