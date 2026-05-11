package main

import (
	"context"
	"log"
	"time"

	"github.com/ethereum/go-ethereum/common"
)

const listenerRoundSleep = 20 * time.Second

type arbitragePoster func(context.Context, ArbitrageParem) error
type listenerSleeper func(time.Duration)

func runListenerRound(
	ctx context.Context,
	config RuntimeConfig,
	state ListenerState,
	txch <-chan common.Hash,
	fetch pendingTxFetcher,
	post arbitragePoster,
	sleep listenerSleeper,
	window time.Duration,
) ListenerState {
	if sleep == nil {
		sleep = time.Sleep
	}

	txData := collectPendingWindow(ctx, txch, fetch, window)
	if len(txData) == 0 {
		log.Printf("no transaction")
		return state
	}

	var params []ArbitrageParem
	var strategySleep time.Duration
	state, params, strategySleep = runListenerStrategy(config, state, txData)
	for _, param := range params {
		postArbitrageParam(ctx, post, param)
	}
	if strategySleep > 0 {
		sleep(strategySleep)
	}
	sleep(listenerRoundSleep)
	return state
}
