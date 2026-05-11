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

const fixtures = loadFixtures();

const main0 = buildPlan(optionsWithFixture("main_0"), fixtures);
assertPlanSafety(main0);
assert.strictEqual(main0.legacyFile, "sdk/TradeInit/loal-version/js/main_0.js");
assert.deepStrictEqual(main0.accountRange, { start: 2, endExclusive: 17 });
assert.deepStrictEqual(directions(main0), Array(15).fill("buy"));
assert.deepStrictEqual(
  main0.trades.slice(0, 3).map((trade) => trade.gasPriceWei),
  ["1000001000", "1002005000", "1012003000"],
);
assert.strictEqual(main0.summary.buy, 15);
assert.strictEqual(main0.summary.sell, 0);

const main20 = buildPlan(optionsWithFixture("main2_0"), fixtures);
assertPlanSafety(main20);
assert.deepStrictEqual(main20.accountRange, { start: 2, endExclusive: 7 });
assert.deepStrictEqual(directions(main20), ["sell", "buy", "buy", "buy", "sell"]);
assert.strictEqual(main20.trades[0].legacyAccountIndex, 2);
assert.strictEqual(main20.trades[4].legacyAccountIndex, 6);
assert.strictEqual(main20.summary.buy, 3);
assert.strictEqual(main20.summary.sell, 2);

const main31 = buildPlan(optionsWithFixture("main3_1"), fixtures);
assertPlanSafety(main31);
assert.deepStrictEqual(main31.accountRange, { start: 6, endExclusive: 10 });
assert.deepStrictEqual(directions(main31), ["buy", "buy", "buy", "sell"]);
assert.strictEqual(main31.trades[0].legacyAccountIndex, 6);
assert.strictEqual(main31.trades[3].legacyAccountIndex, 9);
assert.strictEqual(main31.summary.buy, 3);
assert.strictEqual(main31.summary.sell, 1);

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

const cliSource = fs.readFileSync(cliPath, "utf8");
assert.doesNotMatch(cliSource, /web3/i);
assert.doesNotMatch(cliSource, /ethereumjs/i);
assert.doesNotMatch(cliSource, /sendSignedTransaction/);
assert.doesNotMatch(cliSource, /loal-version\/js\/main/);

console.log("TradeInit dry-run CLI test passed.");
