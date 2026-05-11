const assert = require("assert");

const { createApp } = require("../app");

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function postArbitrage(baseUrl) {
  const response = await fetch(`${baseUrl}/arbitrage`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ Gasprice: "0.000000001", InOrOut: "true" }),
  });
  return { response, json: await response.json() };
}

(async () => {
  const sensitiveHex = "a".repeat(64);
  const app = createApp({
    config: { liveTrading: true },
    arbitrageService: {
      async handleArbitrageRequest() {
        const error = new Error(
          `send failed rawTransaction=0x${sensitiveHex}${sensitiveHex} https://node.example/v3/provider-token`,
        );
        error.code = 402;
        error.reason = `revert 0x${sensitiveHex}`;
        throw error;
      },
    },
  });

  const server = await listen(app);
  try {
    const { response, json } = await postArbitrage(
      `http://127.0.0.1:${server.address().port}`,
    );
    const payload = JSON.stringify(json).toLowerCase();

    assert.strictEqual(response.status, 500);
    assert.strictEqual(json.code, "402");
    assert.ok(json.error.includes("rawTransaction=[redacted]"));
    assert.ok(json.error.includes("/v3/[redacted]"));
    assert.ok(json.reason.includes("[redacted-hex]"));
    assert.ok(!payload.includes(sensitiveHex));
    assert.ok(!payload.includes("provider-token"));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
