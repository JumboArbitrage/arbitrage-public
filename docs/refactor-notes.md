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
- Go strategy selection is now configurable, and backend posting is split into
  a helper. The listener still mixes subscription, block-window collection, and
  strategy orchestration.

## Recommended Next Refactors

1. Split Go listener subscription and block-window collection from strategy
   orchestration.
2. Consolidate TradeInit scripts into a single dry-run-first CLI.
3. Add network-specific config examples for current testnets instead of Rinkeby.
4. Decide whether to remove or archive the Nest scaffold and browser demo.

## Isolation Rule

Do not run host-side dependency commands during normal development. The default
entrypoint is `docker compose run --rm test`; generated npm and Go state should
stay in Docker volumes and not appear as `node_modules`, `package-lock.json`, or
`.cache` inside the repository.
