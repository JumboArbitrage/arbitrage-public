const { buildLiveTransaction } = require("./uniswapTradeService");

async function TransactionBuyInitForTESTPlus(config, plan) {
  if (plan.action !== "buy") {
    throw new Error("TransactionBuyInitForTESTPlus requires a buy plan");
  }
  return buildLiveTransaction(plan, config);
}

module.exports = {
  TransactionBuyInitForTESTPlus,
};
