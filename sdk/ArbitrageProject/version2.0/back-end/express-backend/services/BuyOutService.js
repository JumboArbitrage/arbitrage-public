const { buildLiveTransaction } = require("./uniswapTradeService");

async function TransactionSellInitForTEST(config, plan) {
  if (plan.action !== "sell") {
    throw new Error("TransactionSellInitForTEST requires a sell plan");
  }
  return buildLiveTransaction(plan, config);
}

module.exports = {
  TransactionSellInitForTEST,
};
