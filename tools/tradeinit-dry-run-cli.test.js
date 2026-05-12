#!/usr/bin/env node
"use strict";

const assert = require("assert");
const { execFileSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const { buildPlan, loadFixtures } = require("../sdk/TradeInit/dry-run/cli");

const root = path.resolve(__dirname, "..");
const cliPath = path.join(root, "sdk", "TradeInit", "dry-run", "cli.js");
const baseOptions = {
  "chain-id": "11155111",
  "chain-name": "sepolia",
  "router-contract": "0x1111111111111111111111111111111111111111",
  "test-token-contract": "0x2222222222222222222222222222222222222222",
  "weth-contract": "0x3333333333333333333333333333333333333333",
  "test-amount": "0.01",
  "eth-amount": "0.005",
};

function optionsWithFixture(fixture) {
  return { ...baseOptions, fixture };
}

function directions(plan) {
  return plan.trades.map((trade) => trade.direction);
}

function assertPlanSafety(plan) {
  assert.strictEqual(plan.mode, "dry-run");
  assert.strictEqual(plan.submitted, false);
  assert.strictEqual(plan.signing, false);
  const serialized = JSON.stringify(plan);
  assert.doesNotMatch(serialized, /private/i);
  assert.doesNotMatch(serialized, /signed/i);
}

function assertBuildFails(options, pattern) {
  assert.throws(() => buildPlan(options, fixtures), pattern);
}

function assertCliFails(args, pattern) {
  const result = spawnSync("node", [cliPath, ...args], { encoding: "utf8" });
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, pattern);
}

const fixtures = loadFixtures();
const legacyGasPricesWei = [
  "1000001000",
  "1002005000",
  "1012003000",
  "10001000000",
  "10082050000",
  "10400060000",
  "10800070000",
  "11001040000",
  "100000400000",
  "100500400000",
  "115000800000",
  "155020400000",
  "175040400000",
  "1050604000000",
  "1050804000000",
  "1052004000000",
  "1054004000000",
  "1057004000000",
];

assert.deepStrictEqual(fixtures.legacyGasPricesWei, legacyGasPricesWei);
for (const [name, fixture] of Object.entries(fixtures.fixtures)) {
  assert.ok(!Object.hasOwn(fixture, "gasPricesWei"), `${name} must use shared gas prices`);
}

function planSummary(name) {
  const plan = buildPlan(optionsWithFixture(name), fixtures);
  assertPlanSafety(plan);
  return {
    source: plan.source,
    legacyFile: plan.legacyFile,
    accountRange: plan.accountRange,
    directions: directions(plan),
    gasPriceWei: plan.trades.map((trade) => trade.gasPriceWei),
    legacyAccountIndices: plan.trades.map((trade) => trade.legacyAccountIndex),
    summary: plan.summary,
  };
}

assert.deepStrictEqual(planSummary("main_0"), {
  source: "legacy-fixture:main_0",
  legacyFile: "sdk/TradeInit/loal-version/js/main_0.js",
  accountRange: { start: 2, endExclusive: 17 },
  directions: Array(15).fill("buy"),
  gasPriceWei: legacyGasPricesWei.slice(0, 15),
  legacyAccountIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  summary: { total: 15, buy: 15, sell: 0 },
});

assert.deepStrictEqual(planSummary("main_1"), {
  source: "legacy-fixture:main_1",
  legacyFile: "sdk/TradeInit/loal-version/js/main_1.js",
  accountRange: { start: 4, endExclusive: 8 },
  directions: Array(4).fill("buy"),
  gasPriceWei: legacyGasPricesWei.slice(0, 4),
  legacyAccountIndices: [4, 5, 6, 7],
  summary: { total: 4, buy: 4, sell: 0 },
});

assert.deepStrictEqual(planSummary("main2_0"), {
  source: "legacy-fixture:main2_0",
  legacyFile: "sdk/TradeInit/loal-version/js/main2_0.js",
  accountRange: { start: 2, endExclusive: 7 },
  directions: ["sell", "buy", "buy", "buy", "sell"],
  gasPriceWei: legacyGasPricesWei.slice(0, 5),
  legacyAccountIndices: [2, 3, 4, 5, 6],
  summary: { total: 5, buy: 3, sell: 2 },
});

assert.deepStrictEqual(planSummary("main3_1"), {
  source: "legacy-fixture:main3_1",
  legacyFile: "sdk/TradeInit/loal-version/js/main3_1.js",
  accountRange: { start: 6, endExclusive: 10 },
  directions: ["buy", "buy", "buy", "sell"],
  gasPriceWei: legacyGasPricesWei.slice(0, 4),
  legacyAccountIndices: [6, 7, 8, 9],
  summary: { total: 4, buy: 3, sell: 1 },
});

const explicitPlan = buildPlan({
  ...baseOptions,
  "account-start": "10",
  "account-end-exclusive": "13",
  "direction-mode": "edge-sell",
  "gas-prices": "1,2,3",
}, fixtures);
assertPlanSafety(explicitPlan);
assert.strictEqual(explicitPlan.source, "explicit");
assert.deepStrictEqual(directions(explicitPlan), ["sell", "buy", "sell"]);

const cliOutput = execFileSync("node", [
  cliPath,
  "dry-run",
  "--fixture",
  "main3_1",
  "--chain-id",
  baseOptions["chain-id"],
  "--chain-name",
  baseOptions["chain-name"],
  "--router-contract",
  baseOptions["router-contract"],
  "--test-token-contract",
  baseOptions["test-token-contract"],
  "--weth-contract",
  baseOptions["weth-contract"],
  "--test-amount",
  baseOptions["test-amount"],
  "--eth-amount",
  baseOptions["eth-amount"],
], { encoding: "utf8" });
const cliPlan = JSON.parse(cliOutput);
assertPlanSafety(cliPlan);
assert.deepStrictEqual(directions(cliPlan), ["buy", "buy", "buy", "sell"]);

const liveAttempt = spawnSync("node", [cliPath, "live"], { encoding: "utf8" });
assert.notStrictEqual(liveAttempt.status, 0);
assert.match(liveAttempt.stderr, /dry-run/);
assertCliFails(["dry-run", "--fixture", "main_0", "--unknown", "1"], /unknown option/);
assertCliFails(["dry-run", "--fixture", "main_0", "--live"], /live mode/);

assertBuildFails({ ...baseOptions, fixture: "main_0", "gas-prices": "1,2,3" }, /cannot be combined/);
assertBuildFails({ ...baseOptions, "account-start": "1", "direction-mode": "all-buy", "gas-prices": "1" }, /account-end-exclusive/);
assertBuildFails({
  ...baseOptions,
  "account-start": "1",
  "account-end-exclusive": "2",
  "direction-mode": "sideways",
  "gas-prices": "1",
}, /unsupported direction mode/);
assertBuildFails({
  ...baseOptions,
  "account-start": "1",
  "account-end-exclusive": "2",
  "direction-mode": "all-buy",
  "gas-prices": "0",
}, /gas price/);

for (const value of ["0", "0.0", "-1", "1e3", "Infinity", ".", "1.", ".1"]) {
  assertBuildFails({ ...optionsWithFixture("main_0"), "eth-amount": value }, /eth amount/);
}
assertBuildFails({ ...optionsWithFixture("main_0"), "eth-amount": "" }, /eth-amount/);

const cliSource = fs.readFileSync(cliPath, "utf8");
assert.doesNotMatch(cliSource, /web3/i);
assert.doesNotMatch(cliSource, /ethereumjs/i);
assert.doesNotMatch(cliSource, /sendSignedTransaction/);
assert.doesNotMatch(cliSource, /loal-version\/js\/main/);

console.log("TradeInit dry-run CLI test passed.");
