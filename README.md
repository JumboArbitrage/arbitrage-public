# arbitrage-public

This repository is a public, safety-first version of an Ethereum arbitrage prototype.
It contains the original TradeInit transaction generators, a Go pending-transaction
listener, and an Express backend that can prepare arbitrage swaps.

The default mode is **dry-run**. Dry-run mode never signs transactions and never
sends transactions to a chain. Live chain writes require both:

- `LIVE_TRADING=1`
- the Docker Compose `live` profile

## Documentation Map

- [Project guide](docs/project-guide.md): long-form overview of the repository,
  component boundaries, safety model, tested guarantees, and remaining limits.
- [Project notes](doc/Doc.md): concise English notes for setup, dry-run, live
  mode, and tests.
- [中文项目说明](doc/Doc_ch.md): Chinese companion notes for the same operational
  workflow.
- [Security policy](SECURITY.md): secret handling, live-mode warnings, and local
  safety checks.
- [Refactor notes](docs/refactor-notes.md): intentionally preserved debt and
  recommended next checkpoints.

## Current Limits

- The historical prototype targeted Rinkeby and Uniswap V2. Rinkeby and Goerli
  are deprecated, and Holesky is no longer the recommended validator/staking
  testnet. Use Sepolia for application-level testing unless you have a specific
  reason to target another network.
- Sepolia is only a network example in this repo. Live use still requires
  user-provided RPC endpoints, contract addresses, approvals, and funded
  accounts for the exact target network.
- This pass does not prove arbitrage profitability. It only makes the repo safer,
  isolated, testable, and easier to continue refactoring.
- The legacy browser demo and repeated TradeInit scripts are preserved for now,
  but live secrets were removed from the current tree.

## Isolated Environment

Use Docker Compose as the only supported default entrypoint. Do not run
`npm install`, `npm test`, `go test`, or `go run` directly on the host unless
you intentionally want a non-isolated setup.

Build the shared Node + Go environment:

```sh
docker compose build
```

Open a shell inside the isolated workspace:

```sh
docker compose run --rm shell
```

Run the safe test suite:

```sh
docker compose run --rm test
```

The test service uses `.env.example` and forces `LIVE_TRADING=0`.
It also sets `ARBITRAGE_ISOLATED=1`; the root `npm test` command refuses to run
without that marker.

Docker volumes hold generated dependencies and caches outside the repo tree:

- npm cache: `npm-cache`
- Express dependencies: `dependency-cache` mounted at `/deps`
- Express package lock used for audit: `/deps/express-backend/package-lock.json`
- Go module cache: `go-cache`
- Go build cache: `go-build-cache`

After a test run, these should print nothing from the repo root:

```sh
find . -name node_modules -type d -prune -print
find . -name package-lock.json -type f -print
find . -name .cache -type d -prune -print
```

## Dry-Run Backend

From the isolated shell only:

```sh
cd sdk/ArbitrageProject/version2.0/back-end/express-backend
rm -rf /deps/express-backend
mkdir -p /deps/express-backend
cp package.json /deps/express-backend/package.json
npm --prefix /deps/express-backend install
NODE_PATH=/deps/express-backend/node_modules node app.js
```

Example request:

```sh
curl -X POST http://localhost:8081/arbitrage \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'Gasprice=0.000000001&InOrOut=true'
```

The response contains a redacted execution plan and `submitted: false`.

## Live Mode

Live mode can send signed transactions. Use only with accounts and funds you are
prepared to lose. The current safety pass has not verified live submission on a
real chain.

1. Copy `.env.example` to `.env`.
2. Fill in `RPC_HTTP_URL`, `RPC_WS_URL`, `PRIVATE_KEY_1`, `PRIVATE_KEY_2`,
   `BUY_IN_ACCOUNT`, `BUY_OUT_ACCOUNT`, and contract addresses for your target
   network.
3. Start services with the explicit live profile:

```sh
docker compose --profile live up live-backend live-client
```

The Go listener refuses to start unless `LIVE_TRADING=1` and both RPC URLs are
present. The backend refuses live execution unless the required RPC, account,
private key, and contract settings are present.

The sample `.env.example` uses Sepolia chain metadata (`CHAIN_ID=11155111`) as a
current application testnet example. That does not imply a usable router,
factory, WETH, or test-token deployment exists for this project; provide the
contracts you intend to trade against. Hoodi is primarily for validator and
staking testing, not this application's default live target.

Sell requests call `swapExactTokensForETH`; before live use, the buy-out
account must approve the configured router to spend the configured test token.
This repo does not automatically send approval transactions.

## Project Layout

- `sdk/TradeInit`: legacy transaction generation scripts and browser demo.
  Historical shell scripts under `sdk/scripts` are archived and intentionally
  exit instead of running host-side Node or Go commands.
- `sdk/TradeInit/dry-run`: dry-run-only TradeInit plan generator and static
  fixtures for selected legacy traffic shapes. It never signs, sends, imports
  old transaction scripts, or connects to RPC.
- `sdk/ArbitrageProject/version2.0/client`: Go pending-transaction listener and
  strategy logic.
- `sdk/ArbitrageProject/version2.0/back-end/express-backend`: safe Express
  backend with dry-run/live guard.
- `docs/refactor-notes.md`: known follow-up refactor debt.
- `tools/secret-scan.js`: local safety scan for hard-coded provider keys,
  private key values, browser key includes, and raw serialized transaction logs.
- `tools/tradeinit-legacy-boundary.test.js`: safety boundary test proving the
  archived TradeInit manifests, config placeholders, and browser demo secret
  references stay non-active and non-secret.
- `tools/tradeinit-dry-run-cli.test.js`: fixture-backed tests for the TradeInit
  dry-run CLI contract.

## Verification

Safe verification target:

```sh
docker compose run --rm test
```

That runs:

- secret scan
- TradeInit legacy boundary checks
- TradeInit dry-run CLI fixture checks
- Express production dependency audit
- Express dry-run API test
- Go strategy tests

Optional local EVM integration target:

```sh
docker compose --profile evm-test run --rm evm-test
docker compose --profile evm-test down
```

This starts a local Anvil chain, deploys mock token/router contracts, and
exercises the Express live buy/sell submission path with public Anvil test
accounts. It does not use real RPC URLs, real private keys, or real funds.
It verifies local signing/submission plumbing only; it does not prove real DEX
profitability or real-network compatibility.

The active Express backend has a small dependency surface: `express`, `web3`,
`bignumber.js`, and `dotenv`. Historical SDK, TradeInit, and Nest package
manifests are archived and intentionally do not install dependencies in this
safety-first pass.

The TradeInit browser demo and repeated `main*.js` files are preserved legacy
traffic generators, not a supported frontend. Consolidating them into a single
CLI should happen only after defining a dry-run-only CLI contract and fixture
tests; this repo should not revive old `web3` or `ethereumjs-tx` dependencies as
part of routine verification.

The new TradeInit dry-run CLI is only a plan generator. Example from the
isolated shell:

```sh
node sdk/TradeInit/dry-run/cli.js dry-run \
  --fixture main2_0 \
  --chain-id 11155111 \
  --chain-name sepolia \
  --router-contract 0x1111111111111111111111111111111111111111 \
  --test-token-contract 0x2222222222222222222222222222222222222222 \
  --weth-contract 0x3333333333333333333333333333333333333333 \
  --test-amount 0.01 \
  --eth-amount 0.005
```

It prints JSON describing the planned buy/sell traffic shape. It does not read
private keys, create transactions, or submit anything to a chain.

If dependency installation or Docker build fails because the network is blocked,
rerun Docker Compose in an environment that can download npm and Go modules.
