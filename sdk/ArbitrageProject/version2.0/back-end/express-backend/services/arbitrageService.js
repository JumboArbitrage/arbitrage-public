const BigNumber = require("bignumber.js");

const { validateLiveConfig } = require("../config/runtime");
const { redactAddress, redactUrl } = require("../utils/redact");
const { executeLiveSwap } = require("./uniswapTradeService");

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeRequest(body) {
  const gasPrice = String(body.Gasprice || "").trim();
  const inOrOut = String(body.InOrOut || "").trim();

  if (!gasPrice || !new BigNumber(gasPrice).isFinite() || new BigNumber(gasPrice).lte(0)) {
    throw httpError(400, "Gasprice must be a positive numeric string");
  }

  if (inOrOut !== "true" && inOrOut !== "false") {
    throw httpError(400, "InOrOut must be either 'true' or 'false'");
  }

  return { Gasprice: gasPrice, InOrOut: inOrOut };
}

function toWeiDecimal(value) {
  return new BigNumber(value).multipliedBy("1000000000000000000").integerValue().toFixed(0);
}

function buildPlan(dto, config) {
  const buy = dto.InOrOut === "true";
  const account = buy ? config.buyInAccount : config.buyOutAccount;

  return {
    action: buy ? "buy" : "sell",
    method: buy ? "swapETHForExactTokens" : "swapExactTokensForETH",
    gasPriceWei: toWeiDecimal(dto.Gasprice),
    chainId: config.chainId,
    chainName: config.chainName,
    account: redactAddress(account),
    router: redactAddress(config.contracts.router),
    rpc: redactUrl(config.rpcHttpUrl),
    tokenAmount: config.testTokenAmount,
  };
}

function createArbitrageService(config) {
  return {
    async handleArbitrageRequest(body) {
      const dto = normalizeRequest(body);
      const plan = buildPlan(dto, config);

      if (!config.liveTrading) {
        return {
          mode: "dry-run",
          request: dto,
          plan,
          submitted: false,
        };
      }

      validateLiveConfig(config);
      const liveResult = await executeLiveSwap(plan, config);
      return {
        mode: "live",
        request: dto,
        plan,
        submitted: true,
        transactionHash: liveResult.transactionHash,
      };
    },
  };
}

module.exports = {
  buildPlan,
  createArbitrageService,
  normalizeRequest,
  toWeiDecimal,
};
