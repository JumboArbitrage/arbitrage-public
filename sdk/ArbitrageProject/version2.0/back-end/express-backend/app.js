const express = require("express");

const { loadRuntimeConfig } = require("./config/runtime");
const { createArbitrageService } = require("./services/arbitrageService");

function createApp(options = {}) {
  const config = options.config || loadRuntimeConfig();
  const arbitrageService = options.arbitrageService || createArbitrageService(config);
  const app = express();

  app.use((req, res, next) => {
    if (req.path !== "/" && !req.path.includes(".")) {
      res.set({
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": req.headers.origin || "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Content-Length, Authorization, Accept, X-Requested-With",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Content-Type": "application/json; charset=utf-8",
      });
    }
    req.method === "OPTIONS" ? res.status(204).end() : next();
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      service: "arbitrage-backend",
      mode: config.liveTrading ? "live" : "dry-run",
    });
  });

  app.post("/arbitrage", async (req, res, next) => {
    try {
      const result = await arbitrageService.handleArbitrageRequest(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
    });
  });

  return app;
}

if (require.main === module) {
  const config = loadRuntimeConfig();
  const app = createApp({ config });
  app.listen(config.backendPort, () => {
    console.log(
      `arbitrage backend listening on ${config.backendPort} (${config.liveTrading ? "live" : "dry-run"})`,
    );
  });
}

module.exports = { createApp };
