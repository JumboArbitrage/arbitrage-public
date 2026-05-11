# Refactor Notes

This file records known debt intentionally left for a later pass.

## Preserved Legacy Areas

- `sdk/TradeInit/loal-version/js/main*.js` contains many near-duplicate scripts.
  They should be consolidated into a single CLI after the dry-run/live boundary
  is stable.
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
  orchestration, pending-window collection, and one-round orchestration.
- `watch()` still owns live setup: config loading, live validation, HTTP/WS RPC
  dialing, per-round pending transaction subscription, and the outer long-running
  loop. Subscription lifecycle and reconnect behavior are intentionally
  preserved for now; this is not an accidental omission.
- Local EVM integration coverage uses Anvil and mock contracts. Forked-network
  testing remains a separate future step requiring an explicit user RPC. Current
  local-chain coverage does not prove real DEX profitability or network
  compatibility.

## Recommended Next Refactors

1. If continuing Go listener refactors, only consider the live setup and
   subscription boundary next. Do not change unsubscribe behavior, reconnect
   strategy, context cancellation, or the outer loop unless tests first prove the
   existing behavior and the desired new behavior is explicitly scoped.
2. Consolidate TradeInit scripts into a single dry-run-first CLI.
3. Add network-specific config examples for current testnets instead of Rinkeby.
4. Add an explicit forked-network EVM test profile once a user-owned RPC is
   available.
5. Decide whether to remove or archive the Nest scaffold and browser demo.

## Isolation Rule

Do not run host-side dependency commands during normal development. The default
entrypoint is `docker compose run --rm test`; generated npm and Go state should
stay in Docker volumes and not appear as `node_modules`, `package-lock.json`, or
`.cache` inside the repository.
