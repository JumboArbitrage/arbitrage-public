# Refactor Notes

This file records known debt intentionally left for a later pass.

## Preserved Legacy Areas

- `sdk/TradeInit/loal-version/js/main*.js` contains many near-duplicate scripts.
  They should be consolidated into a single CLI only after there is a
  dry-run-only CLI contract and fixture coverage for the intended request
  shapes.
- `sdk/TradeInit/browser-version` is a historical browser demo. It is not the
  preferred execution path and should stay non-secret by default.
- `sdk/ArbitrageProject/version2.0/back-end/nest-backend` is still the original
  Nest scaffold and is not wired into the active backend. Its package manifest
  is archived without dependencies so accidental install does not pull stale
  Nest/Express packages.
- `sdk/package.json` and `sdk/TradeInit/loal-version/package.json` are archived
  without dependencies. Reviving those scripts needs a separate dependency and
  API migration, especially from old `web3` and `ethereumjs-tx`.
- `sdk/scripts/*.sh` are archived guard scripts. They intentionally refuse to
  run host-side Node or Go entrypoints.
- Go strategy selection is now configurable, backend posting is split into a
  helper, and the listener now has characterization-tested helpers for strategy
  orchestration, pending-window collection, one-round orchestration, and pending
  subscription setup.
- `watch()` still owns live setup: config loading, live validation, HTTP/WS RPC
  dialing, per-round pending transaction subscription, and the outer long-running
  loop. The pending subscription channel is still buffered at 100, and each
  round still creates a new subscription. Subscription lifecycle, unsubscribe,
  reconnect, and context-cancellation behavior are intentionally preserved for
  now; this is not an accidental omission.
- Local EVM integration coverage uses Anvil and mock contracts. Forked-network
  testing remains a separate future step requiring an explicit user RPC. Current
  local-chain coverage does not prove real DEX profitability or network
  compatibility.
- `.env.example` and the active docs now use Sepolia as the current application
  testnet example. Historical Rinkeby references inside archived TradeInit and
  browser-demo code are preserved as legacy context, not supported entrypoints.
- TradeInit legacy safety is now covered by a root test that checks archived
  package manifests, empty config placeholders, browser demo local-secret
  references, and secret-scan coverage for the legacy tree.
- A dry-run-only TradeInit CLI contract now exists for selected legacy traffic
  shapes. It is fixture-backed and intentionally avoids old script imports,
  signing, RPC, and dependency revival.

## Recommended Next Refactors

1. Pause deeper Go listener changes unless there is an explicit checkpoint for
   live setup, reconnect, or subscription lifecycle behavior.
2. Gradually migrate selected TradeInit traffic shapes into the dry-run CLI only
   after each shape has fixture coverage.
3. Add an explicit forked-network EVM test profile once a user-owned RPC is
   available.
4. Decide whether to remove or archive the Nest scaffold and browser demo.

## Isolation Rule

Do not run host-side dependency commands during normal development. The default
entrypoint is `docker compose run --rm test`; generated npm and Go state should
stay in Docker volumes and not appear as `node_modules`, `package-lock.json`, or
`.cache` inside the repository.
