package main

import (
	"fmt"
	"os"
	"strconv"
)

type RuntimeConfig struct {
	RPCHTTPURL string
	RPCWSURL   string
	BackendURL string
	Strategy   int
	Live       bool
}

func envString(name string, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func envInt(name string, fallback int) int {
	raw := envString(name, "")
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func LoadRuntimeConfig() RuntimeConfig {
	return RuntimeConfig{
		RPCHTTPURL: envString("RPC_HTTP_URL", ""),
		RPCWSURL:   envString("RPC_WS_URL", ""),
		BackendURL: envString("BACKEND_URL", "http://localhost:8081/arbitrage"),
		Strategy:   envInt("ARBITRAGE_STRATEGY", 2),
		Live:       envString("LIVE_TRADING", "0") == "1",
	}
}

func (config RuntimeConfig) ValidateLive() error {
	if !config.Live {
		return fmt.Errorf("client listener requires LIVE_TRADING=1 because it subscribes to a real txpool")
	}
	if config.RPCHTTPURL == "" {
		return fmt.Errorf("RPC_HTTP_URL is required")
	}
	if config.RPCWSURL == "" {
		return fmt.Errorf("RPC_WS_URL is required")
	}
	if config.BackendURL == "" {
		return fmt.Errorf("BACKEND_URL is required")
	}
	return nil
}
