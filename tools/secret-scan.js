#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skipDirs = new Set([".git", "node_modules", "dist", "coverage"]);
const skipFiles = new Set(["package-lock.json", "go.sum"]);
const skipSuffixes = [".min.js", ".woff2", ".woff", ".ttf", ".jpg", ".png", ".abi"];

const checks = [
  {
    name: "infura project URL",
    pattern: /https?:\/\/[^"'`\s]*infura\.io\/v3\/[A-Za-z0-9_-]{16,}/,
  },
  {
    name: "alchemy project URL",
    pattern: /https?:\/\/[^"'`\s]*alchemyapi\.io\/v2\/[A-Za-z0-9_-]{16,}/,
  },
  {
    name: "hard-coded private key value",
    pattern: /(?:PRIVATE_KEY|privateKey|privatekey)\s*[:=]\s*['"]?(?:0x)?[a-fA-F0-9]{64}['"]?/,
  },
  {
    name: "serialized transaction logging",
    pattern: /(console|logger)\.(log|error|warn)\([^)]*serializedTx[^)]*,/i,
  },
  {
    name: "browser key include",
    pattern: /config\/key\.txt/,
  },
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (skipFiles.has(entry.name)) continue;
    if (skipSuffixes.some((suffix) => entry.name.endsWith(suffix))) continue;
    files.push(full);
  }
  return files;
}

function scanRoot(scanRootDir) {
  const findings = [];
  for (const file of walk(scanRootDir)) {
    const rel = path.relative(scanRootDir, file);
    const content = fs.readFileSync(file, "utf8");
    for (const check of checks) {
      if (check.pattern.test(content)) {
        findings.push(`${rel}: ${check.name}`);
      }
    }
  }
  return findings;
}

function main() {
  const findings = scanRoot(root);
  if (findings.length) {
    console.error("Secret scan failed:");
    for (const finding of findings) console.error(`- ${finding}`);
    process.exit(1);
  }

  console.log("Secret scan passed.");
}

if (require.main === module) {
  main();
}

module.exports = { scanRoot };
