# Project Guide

This guide is the long-form project orientation for `arbitrage-public`. The root
README stays focused on safe setup and verification commands; this file explains
the project shape, safety model, and current refactor boundary in more detail.

The historical GitHub wiki home is still available at
<https://github.com/JumboArbitrage/arbitrage-public/wiki>. The public raw wiki
home at
<https://raw.githubusercontent.com/wiki/JumboArbitrage/arbitrage-public/Home.md>
currently contains a short welcome title and a header image link. This guide
keeps that project-orientation spirit, but treats the current repository state
and tests as the source of truth.

## What This Repository Is

`arbitrage-public` is a public, safety-first version of an Ethereum arbitrage
prototype. The original project explored pending-transaction listening and
swap-triggered arbitrage behavior around Uniswap V2-style contracts. The current
repository is not presented as a profitable or production-ready trading system.
It is organized so that the old prototype can be studied, dry-run tested, and
refactored without accidentally signing or submitting live transactions.

The repo has three important areas:

- `sdk/TradeInit`: preserved legacy traffic-generation scripts and browser demo.
- `sdk/ArbitrageProject/version2.0/client`: Go pending-transaction listener and
  strategy code.
- `sdk/ArbitrageProject/version2.0/back-end/express-backend`: Express backend
  that builds dry-run plans by default and can only send transactions in
  explicitly enabled live mode.

The active work so far has been conservative. It does not rewrite the arbitrage
algorithm, does not claim real-chain profitability, and does not turn the legacy
browser demo into a supported frontend.

## Safety Model

The default mode is dry-run. In dry-run mode, the backend prepares a redacted
execution plan and reports `submitted: false`. It must not sign transactions,
print raw signed transactions, or send anything to a chain.

Live mode requires two explicit signals:

- `LIVE_TRADING=1`
- Docker Compose `--profile live`

The backend then also requires runtime configuration for RPC URLs, account
addresses, private keys, chain ID, contract addresses, gas limit, and trade
amounts. The Go listener also refuses to start without live mode and RPC URLs.
These checks are designed to fail early when configuration is incomplete.

Secrets are not stored in the repository. `.env.example` is a template only; it
keeps live values empty and uses Sepolia chain metadata only as a current public
testnet example. Sepolia in the template does not imply that usable router,
factory, WETH, or test-token contracts already exist for this project.

## Isolated Runtime

Docker Compose is the supported default entrypoint. The safe path is:

```sh
docker compose build
docker compose run --rm test
```

The test service sets `ARBITRAGE_ISOLATED=1` and `LIVE_TRADING=0`. Root
`npm test` is guarded so that the normal test suite fails outside the isolated
container. Generated dependency and build state lives in Docker volumes:

- npm cache
- Express backend dependencies and package lock used for audit
- Go module cache
- Go build cache

After running tests, the repository should not contain generated dependency
state such as `node_modules`, `package-lock.json`, or `.cache`.

## Runtime Modes

### Dry-Run Backend

The Express backend can be run manually from the isolated shell. In dry-run mode,
`POST /arbitrage` accepts the existing form shape, builds the transaction plan,
redacts sensitive material, and returns without submitting a transaction.

### Local EVM Integration Test

The optional `evm-test` Compose profile starts a local Anvil chain, deploys mock
contracts, and exercises the backend live signing/submission path against public
Anvil accounts. This is useful because it tests transaction encoding, signing,
submission, approval failure, and approval success without real RPC endpoints or
real funds.

Local EVM integration is not the same as real-network validation. It does not
prove DEX profitability, mempool behavior, router compatibility, or gas-market
behavior on a public network.

### Live Mode

Live mode can send signed transactions. It should only be used with accounts and
funds the operator is prepared to lose. Sell requests call
`swapExactTokensForETH`; before live sell use, the buy-out account must approve
the configured router to spend the configured test token. The backend does not
automatically send approval transactions.

The current safety work has not verified live submission on a real public chain.
Any real-network run needs user-owned RPC endpoints, accounts, balances,
contract addresses, and a separate validation plan.

## Component Boundaries

### TradeInit

`TradeInit` is preserved as legacy traffic-generation history. Its old package
manifests are archived without dependencies, and the browser demo is not treated
as an active frontend. The current dry-run CLI under `sdk/TradeInit/dry-run`
only generates JSON plans for selected legacy traffic shapes. It does not import
old `main*.js` scripts, read private keys, sign transactions, or call RPC.

### Go Listener

The Go client still owns the long-running listener model. It has been split
carefully around tested boundaries: config loading, strategy orchestration,
backend posting, pending-window collection, one-round orchestration, and pending
subscription setup. The outer `watch()` function still owns live setup, RPC
dialing, per-round subscription creation, and the long-running loop.

Subscription lifecycle, unsubscribe behavior, reconnect behavior, and context
cancellation have intentionally not been changed yet.

### Express Backend

The Express backend is the active backend entrypoint. It keeps dry-run as the
default, validates live configuration before live use, redacts sensitive output,
and has both API tests and local EVM integration coverage. Its active production
dependencies are intentionally small.

### Legacy Frontend / Browser Demo

The browser demo remains a preserved historical artifact. It is not a supported
frontend, and its file structure should not be reorganized casually. Moving or
rewriting it would risk changing historical references without improving the
current safe execution boundary.

## What Is Proven Today

The default test suite proves the following boundaries:

- the repository can run its safe test path inside Docker Compose;
- obvious committed provider keys, private key values, browser key includes, and
  raw serialized transaction logging patterns are rejected;
- legacy TradeInit manifests and config placeholders remain archived and
  non-secret;
- TradeInit dry-run fixtures preserve selected legacy traffic shapes without
  reviving signing or RPC;
- the active Express backend passes production dependency audit in the isolated
  dependency volume;
- the Express dry-run API returns plans without sending transactions;
- Go decoding, strategy helpers, backend posting, pending-window collection,
  round orchestration, and subscription setup have fixture-backed tests.

The optional local EVM suite additionally proves that the backend can build,
sign, and submit buy/sell transactions on a local mock chain when live mode is
explicitly enabled against Anvil.

## What Is Not Proven Yet

The current repo does not prove:

- real-chain profitability;
- real public-network live submission;
- compatibility with a specific deployed router/factory/WETH/test-token set;
- forked-mainnet or forked-testnet behavior;
- production-grade reconnect, unsubscribe, or cancellation behavior in the Go
  listener;
- that the archived browser demo should be treated as a current frontend.

Those are separate checkpoints. They should not be mixed into documentation or
structure cleanup.

## Recommended Next Work

The lowest-risk next changes remain documentation, test coverage, and fixture
coverage. Code refactors should continue to follow the current rule: prove the
existing behavior first, then make the smallest structure change that preserves
that behavior.

Reasonable future checkpoints are:

- add forked-network EVM tests with a user-owned RPC, kept behind an explicit
  profile;
- migrate more TradeInit traffic shapes into the dry-run CLI only after adding
  static fixtures;
- decide whether the browser demo should be archived more explicitly or replaced
  by a new frontend, but only after defining a frontend contract;
- revisit Go listener reconnect and subscription lifecycle only with tests that
  lock the existing behavior first.
