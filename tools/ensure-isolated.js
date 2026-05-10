#!/usr/bin/env node
"use strict";

if (process.env.ARBITRAGE_ISOLATED === "1") {
  process.exit(0);
}

console.error("Refusing to run outside the isolated Docker environment.");
console.error("Use: docker compose run --rm test");
process.exit(1);
