# Project Notes

## Purpose

This SDK is an Ethereum arbitrage prototype. It has two main parts:

- `TradeInit`: legacy scripts that create test swap traffic.
- `ArbitrageProject`: a Go listener that watches pending transactions and an
  Express backend that prepares arbitrage swaps.

The current safe default is dry-run. Dry-run builds a redacted execution plan and
does not sign or submit transactions.

## Environment

Use Docker Compose for a unified isolated Node + Go environment:

```sh
docker compose build
docker compose run --rm shell
docker compose run --rm test
```

Do not install global `cnpm` or project dependencies on the host unless you
explicitly want a non-isolated local setup.

The default test command is intentionally guarded. `npm test` should be run by
Docker Compose, which sets `ARBITRAGE_ISOLATED=1`:

```sh
docker compose run --rm test
```

Generated dependency state is kept in Docker volumes, not in the repository
workspace. The temporary package lock used for audit lives under
`/deps/express-backend` inside a Docker volume. To verify the repo after a run:

```sh
find . -name node_modules -type d -prune -print
find . -name package-lock.json -type f -print
find . -name .cache -type d -prune -print
```

These commands should print nothing.

## Dry-Run Backend

Run the backend from `docker compose run --rm shell` if you need manual dry-run
testing. Avoid `npm install` in the mounted backend directory; install into the
Docker dependency volume instead:

```sh
cd sdk/ArbitrageProject/version2.0/back-end/express-backend
rm -rf /deps/express-backend
mkdir -p /deps/express-backend
cp package.json /deps/express-backend/package.json
npm --prefix /deps/express-backend install
NODE_PATH=/deps/express-backend/node_modules node app.js
```

```sh
curl -X POST http://localhost:8081/arbitrage \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'Gasprice=0.000000001&InOrOut=true'
```

Expected behavior: the response says `mode: dry-run` and `submitted: false`.

## Live Mode

Live mode requires `.env` and the Compose `live` profile:

```sh
cp .env.example .env
# Fill in RPC_HTTP_URL, RPC_WS_URL, account addresses, contract addresses,
# PRIVATE_KEY_1, and PRIVATE_KEY_2.
docker compose --profile live up live-backend live-client
```

Rinkeby was the original target network in the historical code. Rinkeby is now a
legacy testnet, so live use requires current RPC endpoints and contract
addresses supplied by the user.

This safety pass has not verified live submission on a real chain. Sell requests
require the buy-out account to approve the configured router for the configured
test token before live use; the backend does not automatically send approval
transactions.

Historical shell scripts under `sdk/scripts` are archived. Use Docker Compose
entrypoints instead of running those scripts directly.

## Tests

```sh
docker compose run --rm test
```

The test suite checks that:

- no obvious provider keys or private key values are committed;
- active Express production dependencies pass `npm audit`;
- the Express backend returns a dry-run plan without submitting a transaction;
- the Go decoder and strategy logic behave deterministically on fixtures.

Optional local EVM integration testing:

```sh
docker compose --profile evm-test run --rm evm-test
docker compose --profile evm-test down
```

This uses a local Anvil chain and mock contracts. It does not use real RPC URLs,
real private keys, or real funds.
