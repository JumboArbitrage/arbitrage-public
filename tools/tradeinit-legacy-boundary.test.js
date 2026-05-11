#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { scanRoot } = require("./secret-scan");

const root = path.resolve(__dirname, "..");
const tradeInitRoot = path.join(root, "sdk", "TradeInit");
const zeroAddress = "0x0000000000000000000000000000000000000000";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function assertArchivedPackage(relativePath) {
  const manifest = readJson(relativePath);
  assert.strictEqual(manifest.private, true, `${relativePath} must stay private`);
  assert.ok(!manifest.dependencies, `${relativePath} must not install dependencies`);
  assert.ok(!manifest.devDependencies, `${relativePath} must not install dev dependencies`);
  assert.ok(manifest.scripts && manifest.scripts.test, `${relativePath} must keep a guard test script`);
  assert.match(manifest.scripts.test, /Archived|docker compose run --rm test/);
  assert.doesNotMatch(manifest.scripts.test, /\bnode\b|\bnpm\b|\bgo\b/);
}

function assertLegacyConfigIsEmpty() {
  const config = readJson("sdk/TradeInit/loal-version/config/config.json");
  const addressKeys = [
    "FactoryContractAddress",
    "RouterContractAddress",
    "UniTokenContractAddress",
    "WETH9ContractAddress",
    "DaiTokenContractAddress",
    "PairContractAddress",
    "TestContractAddress",
  ];

  for (const key of addressKeys) {
    assert.strictEqual(config[key], zeroAddress, `${key} must remain a placeholder`);
  }

  assert.deepStrictEqual(config.address, []);
  assert.strictEqual(config.url, "");
  assert.ok(!Object.hasOwn(config, "privateKey"), "legacy config must not contain privateKey");
  assert.ok(!Object.hasOwn(config, "privateKeys"), "legacy config must not contain privateKeys");
}

function listFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function assertBrowserDemoHasNoLocalSecretFileReference() {
  const files = listFiles(path.join(tradeInitRoot, "browser-version"));
  const localKeyFilePattern = new RegExp(`\\bkey${"\\."}txt\\b`, "i");

  for (const file of files) {
    if (/\.(png|jpg|jpeg|gif|woff2?|ttf)$/i.test(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(content, new RegExp(`config/key${"\\."}txt`, "i"), `${file} must not reference config key file`);
    assert.doesNotMatch(content, localKeyFilePattern, `${file} must not reference local key file`);
  }
}

function assertSecretScanCoversTradeInitPatterns() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tradeinit-secret-scan-"));
  try {
    const fixtureDir = path.join(tempRoot, "sdk", "TradeInit", "browser-version", "js");
    fs.mkdirSync(fixtureDir, { recursive: true });
    const privateKeyName = ["PRIVATE", "KEY"].join("_");
    const fakePrivateKey = "a".repeat(64);
    const browserKeyPath = ["config", "key.txt"].join("/");
    fs.writeFileSync(
      path.join(fixtureDir, "fixture.js"),
      `fetch('${browserKeyPath}');\nconst ${privateKeyName}='${fakePrivateKey}';\n`,
    );
    const findings = scanRoot(tempRoot);
    assert.ok(
      findings.some((finding) => finding.includes("browser key include")),
      "secret scan must catch browser key file references under TradeInit",
    );
    assert.ok(
      findings.some((finding) => finding.includes("hard-coded private key value")),
      "secret scan must catch private key values under TradeInit",
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

assertArchivedPackage("sdk/package.json");
assertArchivedPackage("sdk/TradeInit/loal-version/package.json");
assertLegacyConfigIsEmpty();
assertBrowserDemoHasNoLocalSecretFileReference();
assertSecretScanCoversTradeInitPatterns();

console.log("TradeInit legacy boundary test passed.");
