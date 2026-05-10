# 项目说明

## 目标

这个 SDK 是一个 Ethereum 套利原型，主要分两部分：

- `TradeInit`：历史交易发起脚本，用来制造测试 swap 流量。
- `ArbitrageProject`：Go 监听 pending transactions，Express 后端准备套利 swap。

当前默认模式是 dry-run。dry-run 只生成脱敏执行计划，不签名、不发链上交易。

## 隔离环境

统一使用 Docker Compose 提供 Node + Go 隔离环境：

```sh
docker compose build
docker compose run --rm shell
docker compose run --rm test
```

除非明确需要非隔离本地调试，否则不要在宿主机全局安装 `cnpm` 或项目依赖。

默认测试命令刻意加了隔离保护。`npm test` 应通过 Docker Compose 运行，
因为 Compose 会设置 `ARBITRAGE_ISOLATED=1`：

```sh
docker compose run --rm test
```

依赖和缓存都放在 Docker volume，不应落进 repo 工作目录。用于 audit 的临时
`package-lock.json` 也只放在 Docker volume 的 `/deps/express-backend`。
运行后可以检查：

```sh
find . -name node_modules -type d -prune -print
find . -name package-lock.json -type f -print
find . -name .cache -type d -prune -print
```

这些命令应该没有输出。

## Dry-Run 后端

如果需要手动 dry-run 后端，请先进入 `docker compose run --rm shell`。
不要在宿主机直接 `npm install`，也不要在挂载的 backend 目录里安装依赖；
依赖应安装到 Docker volume：

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

预期结果：返回 `mode: dry-run` 和 `submitted: false`。

## Live 模式

Live 模式会发送真实签名交易，必须显式启用：

```sh
cp .env.example .env
# 填写 RPC_HTTP_URL、RPC_WS_URL、账户地址、合约地址、PRIVATE_KEY_1、PRIVATE_KEY_2。
docker compose --profile live up live-backend live-client
```

历史代码原本使用 Rinkeby + Uniswap V2。Rinkeby 现在是历史测试网；如果要实盘或新测试网运行，需要用户自己提供当前网络的 RPC、账户和合约地址。

## 测试

```sh
docker compose run --rm test
```

测试内容：

- 检查当前 tree 不应包含明显 provider key、私钥值、浏览器 key 引用或 raw signed transaction 日志；
- active Express 生产依赖通过 `npm audit`；
- Express 后端在 dry-run 下只返回计划，不发送交易；
- Go 解码和策略逻辑使用 fixture 做确定性验证。
