package main

import (
	"math/big"
	"testing"
	"time"
)

func listenerTx(gas int64, method int) Data {
	return Data{
		Gasprice: big.NewInt(gas),
		Value:    new(big.Float).SetFloat64(1),
		method:   method,
	}
}

func assertParam(t *testing.T, param ArbitrageParem, gas int64, direction int) {
	t.Helper()
	if param.Gasprice.Cmp(big.NewInt(gas)) != 0 {
		t.Fatalf("expected gas %d, got %s", gas, param.Gasprice.String())
	}
	if param.InOrOut != direction {
		t.Fatalf("expected direction %d, got %d", direction, param.InOrOut)
	}
}

func TestRunListenerStrategyKeepsStrategy1Behavior(t *testing.T) {
	state, params, sleepFor := runListenerStrategy(
		RuntimeConfig{Strategy: 1},
		ListenerState{},
		Datas{
			listenerTx(1000, swapExactETHForTokens),
			listenerTx(800, swapExactTokensForETH),
		},
	)

	if state.Strategy3Flag != 0 {
		t.Fatalf("strategy 1 should not change strategy3 flag")
	}
	if sleepFor != 0 {
		t.Fatalf("strategy 1 should not request sleep")
	}
	if len(params) != 2 {
		t.Fatalf("expected two params, got %d", len(params))
	}
	assertParam(t, params[0], 1100, BuyIn)
	assertParam(t, params[1], 800, BuyOut)
}

func TestRunListenerStrategyKeepsStrategy2Behavior(t *testing.T) {
	state, params, sleepFor := runListenerStrategy(
		RuntimeConfig{Strategy: 2},
		ListenerState{},
		Datas{
			listenerTx(900, swapExactETHForTokens),
			listenerTx(1000, swapExactETHForTokens),
			listenerTx(800, swapExactTokensForETH),
		},
	)

	if state.Strategy3Flag != 0 {
		t.Fatalf("strategy 2 should not change strategy3 flag")
	}
	if sleepFor != 0 {
		t.Fatalf("strategy 2 should not request sleep")
	}
	if len(params) != 2 {
		t.Fatalf("expected two params, got %d", len(params))
	}
	assertParam(t, params[0], 1100, BuyIn)
	assertParam(t, params[1], 880, BuyOut)
}

func TestRunListenerStrategy3StateMachine(t *testing.T) {
	state, params, sleepFor := runListenerStrategy(
		RuntimeConfig{Strategy: 3},
		ListenerState{},
		Datas{listenerTx(1000, swapExactETHForTokens)},
	)
	if state.Strategy3Flag != 1 {
		t.Fatalf("expected strategy3 flag 1, got %d", state.Strategy3Flag)
	}
	if sleepFor != 0 {
		t.Fatalf("buy-in should not request sleep")
	}
	if len(params) != 1 {
		t.Fatalf("expected one buy-in param, got %d", len(params))
	}
	assertParam(t, params[0], 1000, BuyIn)

	state, params, sleepFor = runListenerStrategy(
		RuntimeConfig{Strategy: 3},
		state,
		Datas{listenerTx(900, swapExactTokensForETH)},
	)
	if state.Strategy3Flag != 0 {
		t.Fatalf("expected strategy3 flag 0, got %d", state.Strategy3Flag)
	}
	if sleepFor != 10*time.Second {
		t.Fatalf("expected 10s strategy3 sleep, got %s", sleepFor)
	}
	if len(params) != 1 {
		t.Fatalf("expected one buy-out param, got %d", len(params))
	}
	assertParam(t, params[0], 900, BuyOut)
}

func TestRunListenerStrategy3DirectionMismatchDoesNotSubmit(t *testing.T) {
	state, params, sleepFor := runListenerStrategy(
		RuntimeConfig{Strategy: 3},
		ListenerState{},
		Datas{listenerTx(1000, swapExactTokensForETH)},
	)
	if state.Strategy3Flag != 0 {
		t.Fatalf("expected unchanged strategy3 flag, got %d", state.Strategy3Flag)
	}
	if len(params) != 0 {
		t.Fatalf("expected no params, got %d", len(params))
	}
	if sleepFor != 0 {
		t.Fatalf("direction mismatch should not request sleep")
	}

	state, params, sleepFor = runListenerStrategy(
		RuntimeConfig{Strategy: 3},
		ListenerState{Strategy3Flag: 1},
		Datas{listenerTx(1000, swapExactETHForTokens)},
	)
	if state.Strategy3Flag != 1 {
		t.Fatalf("expected unchanged strategy3 flag, got %d", state.Strategy3Flag)
	}
	if len(params) != 0 {
		t.Fatalf("expected no params, got %d", len(params))
	}
	if sleepFor != 0 {
		t.Fatalf("direction mismatch should not request sleep")
	}
}

func TestRunListenerStrategyEmptyAndUnsupportedCases(t *testing.T) {
	state, params, sleepFor := runListenerStrategy(
		RuntimeConfig{Strategy: 2},
		ListenerState{Strategy3Flag: 1},
		nil,
	)
	if state.Strategy3Flag != 1 {
		t.Fatalf("empty data should preserve state")
	}
	if len(params) != 0 {
		t.Fatalf("expected no params, got %d", len(params))
	}
	if sleepFor != 0 {
		t.Fatalf("empty data should not request sleep")
	}

	state, params, sleepFor = runListenerStrategy(
		RuntimeConfig{Strategy: 99},
		ListenerState{Strategy3Flag: 1},
		Datas{listenerTx(1000, swapExactETHForTokens)},
	)
	if state.Strategy3Flag != 1 {
		t.Fatalf("unsupported strategy should preserve state")
	}
	if len(params) != 0 {
		t.Fatalf("expected no params, got %d", len(params))
	}
	if sleepFor != 0 {
		t.Fatalf("unsupported strategy should not request sleep")
	}

	params = filterArbitrageParams([]ArbitrageParem{
		{Gasprice: big.NewInt(1), InOrOut: BuyIn},
		{Gasprice: big.NewInt(2), InOrOut: OtherMethod},
		{Gasprice: big.NewInt(3), InOrOut: BuyOut},
	})
	if len(params) != 2 {
		t.Fatalf("expected invalid direction to be filtered, got %d params", len(params))
	}
	assertParam(t, params[0], 1, BuyIn)
	assertParam(t, params[1], 3, BuyOut)
}
