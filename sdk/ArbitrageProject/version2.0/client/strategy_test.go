package main

import (
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func TestDecodeTxDataClassifiesSwapMethods(t *testing.T) {
	tx := types.NewTransaction(
		1,
		common.HexToAddress("0x0000000000000000000000000000000000000001"),
		big.NewInt(1),
		21000,
		big.NewInt(1000),
		common.FromHex("0x7ff36ab500000000"),
	)

	var data Datas
	data = data.Decodetxdata(tx)

	if len(data) != 1 {
		t.Fatalf("expected one decoded swap, got %d", len(data))
	}
	if data[0].method != swapExactETHForTokens {
		t.Fatalf("expected swapExactETHForTokens, got %d", data[0].method)
	}
	if data[0].CheckInorOut() != BuyIn {
		t.Fatalf("expected buy-in classification")
	}
}

func TestDecodeTxDataNegatesTokenForEthValue(t *testing.T) {
	tx := types.NewTransaction(
		1,
		common.HexToAddress("0x0000000000000000000000000000000000000001"),
		big.NewInt(1),
		21000,
		big.NewInt(1000),
		common.FromHex("0x18cbafe500000000"),
	)

	var data Datas
	data = data.Decodetxdata(tx)

	if len(data) != 1 {
		t.Fatalf("expected one decoded swap, got %d", len(data))
	}
	if data[0].CheckInorOut() != BuyOut {
		t.Fatalf("expected buy-out classification")
	}
	if !data[0].Value.Signbit() {
		t.Fatalf("expected token-for-eth value to be negative")
	}
}

func TestStrategy2BumpsGasAndEmitsOnDirectionChange(t *testing.T) {
	txData := Datas{
		{Gasprice: big.NewInt(1000), method: swapExactETHForTokens},
		{Gasprice: big.NewInt(900), method: swapExactETHForTokens},
		{Gasprice: big.NewInt(800), method: swapExactTokensForETH},
	}

	result := txData.Strategy2()

	if len(result) != 2 {
		t.Fatalf("expected two arbitrage params, got %d", len(result))
	}
	if result[0].InOrOut != BuyIn || result[0].Gasprice.Cmp(big.NewInt(1100)) != 0 {
		t.Fatalf("unexpected first param: %+v", result[0])
	}
	if result[1].InOrOut != BuyOut || result[1].Gasprice.Cmp(big.NewInt(880)) != 0 {
		t.Fatalf("unexpected second param: %+v", result[1])
	}
}

func TestConfigDefaultsToDryRun(t *testing.T) {
	t.Setenv("LIVE_TRADING", "0")
	t.Setenv("RPC_HTTP_URL", "")
	t.Setenv("RPC_WS_URL", "")
	t.Setenv("ARBITRAGE_STRATEGY", "")

	config := LoadRuntimeConfig()
	if config.Live {
		t.Fatalf("default config should not be live")
	}
	if config.Strategy != 2 {
		t.Fatalf("expected default strategy 2, got %d", config.Strategy)
	}
	if err := config.ValidateLive(); err == nil {
		t.Fatalf("dry-run listener should refuse to start without LIVE_TRADING=1")
	}
}
