# Security Policy

## Default Safety Model

This repository defaults to dry-run mode. Dry-run mode must not sign or submit
transactions.

Live chain writes require:

- `LIVE_TRADING=1`
- Docker Compose `--profile live`
- user-provided RPC URLs, account addresses, contract addresses, and private keys

Live submission has not been verified on a real chain in this safety pass. Sell
requests require the buy-out account to approve the configured router for the
configured test token before live use; this repository does not automatically
send approval transactions.

## Secrets

Do not commit:

- private keys
- RPC provider project keys
- `.env`
- generated wallet files
- raw serialized signed transactions

Use `.env.example` as the template and keep real values in a local `.env`.

## Historical Exposure

This cleanup removes secrets from the current working tree only. It does not
rewrite git history. If any committed historical key was real, rotate it with
the provider or wallet owner before using this repository again.

## Local Checks

Run:

```sh
docker compose run --rm test
```

The first step is `tools/secret-scan.js`, which fails on common hard-coded RPC
keys, private key values, browser key includes, and raw serialized transaction
logging.

The default test also audits active Express production dependencies inside a
Docker volume. Historical SDK, TradeInit, and Nest package manifests are
archived without dependencies to avoid pulling stale vulnerable packages during
this safety-first pass. Historical shell scripts under `sdk/scripts` are
archived and intentionally exit instead of running host-side Node or Go
commands.

## Reporting

If you find a security issue in this public repository, do not open an issue
that includes secrets. Report the affected file path, risk summary, and the
minimum reproduction details without private key or account material.
