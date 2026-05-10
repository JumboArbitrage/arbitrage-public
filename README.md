# arbitrage-public

This repository is a public, safety-first version of an Ethereum arbitrage prototype.
It contains the original TradeInit transaction generators, a Go pending-transaction
listener, and an Express backend that can prepare arbitrage swaps.

The default mode is **dry-run**. Dry-run mode never signs transactions and never
sends transactions to a chain. Live chain writes require both:

- `LIVE_TRADING=1`
- the Docker Compose `live` profile

## Current Limits

- The historical prototype targeted Rinkeby and Uniswap V2. Rinkeby is no longer
  a current public testnet, so live use requires user-provided RPC endpoints,
  contract addresses, and funded accounts for the target network.
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
prepared to lose.

1. Copy `.env.example` to `.env`.
2. Fill in `RPC_HTTP_URL`, `RPC_WS_URL`, `PRIVATE_KEY_1`, `PRIVATE_KEY_2`,
   account addresses, and contract addresses for your target network.
3. Start services with the explicit live profile:

```sh
docker compose --profile live up live-backend live-client
```

The Go listener refuses to start unless `LIVE_TRADING=1` and both RPC URLs are
present. The backend refuses live execution unless the required RPC, account,
private key, and contract settings are present.

## Project Layout

- `sdk/TradeInit`: legacy transaction generation scripts and browser demo.
- `sdk/ArbitrageProject/version2.0/client`: Go pending-transaction listener and
  strategy logic.
- `sdk/ArbitrageProject/version2.0/back-end/express-backend`: safe Express
  backend with dry-run/live guard.
- `docs/refactor-notes.md`: known follow-up refactor debt.
- `tools/secret-scan.js`: local safety scan for hard-coded provider keys,
  private key values, browser key includes, and raw serialized transaction logs.

## Verification

Safe verification target:

```sh
docker compose run --rm test
```

That runs:

- secret scan
- Express production dependency audit
- Express dry-run API test
- Go strategy tests

The active Express backend has a small dependency surface: `express`, `web3`,
`bignumber.js`, and `dotenv`. Historical SDK, TradeInit, and Nest package
manifests are archived and intentionally do not install dependencies in this
safety-first pass.

If dependency installation or Docker build fails because the network is blocked,
rerun Docker Compose in an environment that can download npm and Go modules.
