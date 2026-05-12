#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const fixturePath = path.join(__dirname, "legacy-fixtures.json");
const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const integerPattern = /^(0|[1-9][0-9]*)$/;
const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]+)?$/;
const allowedOptions = new Set([
  "fixture",
  "account-start",
  "account-end-exclusive",
  "direction-mode",
  "gas-prices",
  "chain-id",
  "chain-name",
  "router-contract",
  "test-token-contract",
  "weth-contract",
  "test-amount",
  "eth-amount",
]);
const explicitShapeOptions = new Set([
  "account-start",
  "account-end-exclusive",
  "direction-mode",
  "gas-prices",
]);

function loadFixtures() {
  return JSON.parse(fs.readFileSync(fixturePath, "utf8"));
}

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  const options = {};

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith("--")) {
      throw new Error(`unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    if (key === "live") {
      throw new Error("TradeInit dry-run CLI does not support live mode");
    }
    if (!allowedOptions.has(key)) {
      throw new Error(`unknown option --${key}`);
    }
    const value = tokens[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for --${key}`);
    }
    options[key] = value;
    i += 1;
  }

  return { command, options };
}

function requireOption(options, name) {
  if (!options[name]) {
    throw new Error(`missing required option --${name}`);
  }
  return options[name];
}

function assertPositiveInteger(value, name) {
  if (!integerPattern.test(value) || BigInt(value) <= 0n) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function assertPositiveDecimal(value, name) {
  if (!decimalPattern.test(value) || /^0+(\.0+)?$/.test(value)) {
    throw new Error(`${name} must be a positive decimal`);
  }
  return value;
}

function assertAddress(value, name) {
  if (!addressPattern.test(value)) {
    throw new Error(`${name} must be a 0x-prefixed address`);
  }
  return value;
}

function parseIntegerOption(value, name) {
  assertPositiveInteger(value, name);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${name} is too large`);
  }
  return parsed;
}

function directionFor(mode, index, total) {
  if (mode === "all-buy") return "buy";
  if (mode === "edge-sell") return index === 0 || index === total - 1 ? "sell" : "buy";
  if (mode === "last-sell") return index === total - 1 ? "sell" : "buy";
  throw new Error(`unsupported direction mode: ${mode}`);
}

function shapeFromOptions(options, fixtures) {
  if (options.fixture) {
    const mixedOption = [...explicitShapeOptions].find((name) => Object.hasOwn(options, name));
    if (mixedOption) {
      throw new Error(`--fixture cannot be combined with --${mixedOption}`);
    }
    const fixture = fixtures.fixtures[options.fixture];
    if (!fixture) {
      throw new Error(`unknown fixture: ${options.fixture}`);
    }
    return {
      source: `legacy-fixture:${options.fixture}`,
      legacyFile: fixture.legacyFile,
      accountStart: fixture.accountStart,
      accountEndExclusive: fixture.accountEndExclusive,
      directionMode: fixture.directionMode,
      gasPricesWei: fixtures.legacyGasPricesWei,
    };
  }

  for (const name of explicitShapeOptions) {
    requireOption(options, name);
  }

  const gasPricesWei = requireOption(options, "gas-prices")
    .split(",")
    .map((value) => assertPositiveInteger(value.trim(), "gas price"));

  return {
    source: "explicit",
    legacyFile: null,
    accountStart: parseIntegerOption(requireOption(options, "account-start"), "account start"),
    accountEndExclusive: parseIntegerOption(requireOption(options, "account-end-exclusive"), "account end exclusive"),
    directionMode: requireOption(options, "direction-mode"),
    gasPricesWei,
  };
}

function buildPlan(options, fixtures = loadFixtures()) {
  const shape = shapeFromOptions(options, fixtures);
  const total = shape.accountEndExclusive - shape.accountStart;
  if (total <= 0) {
    throw new Error("account range must contain at least one account");
  }
  if (shape.gasPricesWei.length < total) {
    throw new Error("not enough gas prices for account range");
  }

  const chainId = assertPositiveInteger(requireOption(options, "chain-id"), "chain id");
  const chainName = requireOption(options, "chain-name");
  const contracts = {
    router: assertAddress(requireOption(options, "router-contract"), "router contract"),
    testToken: assertAddress(requireOption(options, "test-token-contract"), "test token contract"),
    weth: assertAddress(requireOption(options, "weth-contract"), "weth contract"),
  };
  const amounts = {
    buyEth: assertPositiveDecimal(requireOption(options, "eth-amount"), "eth amount"),
    sellTestToken: assertPositiveDecimal(requireOption(options, "test-amount"), "test amount"),
  };

  const trades = [];
  for (let index = 0; index < total; index += 1) {
    const direction = directionFor(shape.directionMode, index, total);
    trades.push({
      order: index,
      legacyAccountIndex: shape.accountStart + index,
      direction,
      method: direction === "buy" ? "swapExactETHForTokens" : "swapExactTokensForETH",
      gasPriceWei: shape.gasPricesWei[index],
      amount: direction === "buy"
        ? { asset: "ETH", value: amounts.buyEth }
        : { asset: "TEST", value: amounts.sellTestToken },
      contracts,
    });
  }

  return {
    mode: "dry-run",
    submitted: false,
    signing: false,
    source: shape.source,
    legacyFile: shape.legacyFile,
    network: { chainId, chainName },
    directionMode: shape.directionMode,
    accountRange: {
      start: shape.accountStart,
      endExclusive: shape.accountEndExclusive,
    },
    amounts,
    trades,
    summary: {
      total: trades.length,
      buy: trades.filter((trade) => trade.direction === "buy").length,
      sell: trades.filter((trade) => trade.direction === "sell").length,
    },
    warnings: [
      "Dry-run only: no signing, no RPC calls, and no chain submission.",
      "This plan preserves legacy traffic shape only; it does not prove profitability.",
    ],
  };
}

function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  if (command !== "dry-run") {
    throw new Error("only the dry-run command is supported");
  }
  process.stdout.write(`${JSON.stringify(buildPlan(options), null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { buildPlan, loadFixtures, parseArgs };
