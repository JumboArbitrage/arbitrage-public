package main

import (
	"context"
	"fmt"
	"math/big"
	"testing"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func roundFetcher(t *testing.T, txs map[common.Hash]*types.Transaction) pendingTxFetcher {
	t.Helper()
	return func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
		tx, ok := txs[hash]
		if !ok {
			return nil, fmt.Errorf("missing tx")
		}
		return tx, nil
	}
}

func TestRunListenerRoundEmptyWindowDoesNotPostOrSleep(t *testing.T) {
	posts := 0
	var sleeps []time.Duration
	state := runListenerRound(
		context.Background(),
		RuntimeConfig{Strategy: 2},
		ListenerState{Strategy3Flag: 1},
		make(chan common.Hash),
		roundFetcher(t, nil),
		func(ctx context.Context, param ArbitrageParem) error {
			posts++
			return nil
		},
		func(duration time.Duration) {
			sleeps = append(sleeps, duration)
		},
		5*time.Millisecond,
	)

	if state.Strategy3Flag != 1 {
		t.Fatalf("empty round should preserve state")
	}
	if posts != 0 {
		t.Fatalf("expected no posts, got %d", posts)
	}
	if len(sleeps) != 0 {
		t.Fatalf("expected no sleeps, got %v", sleeps)
	}
}

func TestRunListenerRoundPostsStrategy2ParamsInOrder(t *testing.T) {
	firstHash := common.HexToHash("0x1")
	secondHash := common.HexToHash("0x2")
	thirdHash := common.HexToHash("0x3")
	txch := make(chan common.Hash, 3)
	txch <- firstHash
	txch <- secondHash
	txch <- thirdHash

	var posts []ArbitrageParem
	var sleeps []time.Duration
	state := runListenerRound(
		context.Background(),
		RuntimeConfig{Strategy: 2},
		ListenerState{},
		txch,
		roundFetcher(t, map[common.Hash]*types.Transaction{
			firstHash:  pendingTestTx(1, 900, "0x7ff36ab5"),
			secondHash: pendingTestTx(2, 1000, "0x7ff36ab5"),
			thirdHash:  pendingTestTx(3, 800, "0x18cbafe5"),
		}),
		func(ctx context.Context, param ArbitrageParem) error {
			posts = append(posts, param)
			return nil
		},
		func(duration time.Duration) {
			sleeps = append(sleeps, duration)
		},
		20*time.Millisecond,
	)

	if state.Strategy3Flag != 0 {
		t.Fatalf("strategy2 should not change state")
	}
	if len(posts) != 2 {
		t.Fatalf("expected two posts, got %d", len(posts))
	}
	assertParam(t, posts[0], 1100, BuyIn)
	assertParam(t, posts[1], 880, BuyOut)
	if len(sleeps) != 1 || sleeps[0] != listenerRoundSleep {
		t.Fatalf("expected only round sleep, got %v", sleeps)
	}
}

func TestRunListenerRoundStrategy3BuyOutSleepsBeforeRoundSleep(t *testing.T) {
	hash := common.HexToHash("0x1")
	txch := make(chan common.Hash, 1)
	txch <- hash

	var posts []ArbitrageParem
	var sleeps []time.Duration
	state := runListenerRound(
		context.Background(),
		RuntimeConfig{Strategy: 3},
		ListenerState{Strategy3Flag: 1},
		txch,
		roundFetcher(t, map[common.Hash]*types.Transaction{
			hash: pendingTestTx(1, 900, "0x18cbafe5"),
		}),
		func(ctx context.Context, param ArbitrageParem) error {
			posts = append(posts, param)
			return nil
		},
		func(duration time.Duration) {
			sleeps = append(sleeps, duration)
		},
		20*time.Millisecond,
	)

	if state.Strategy3Flag != 0 {
		t.Fatalf("expected strategy3 flag 0, got %d", state.Strategy3Flag)
	}
	if len(posts) != 1 {
		t.Fatalf("expected one post, got %d", len(posts))
	}
	assertParam(t, posts[0], 900, BuyOut)
	if len(sleeps) != 2 {
		t.Fatalf("expected strategy sleep and round sleep, got %v", sleeps)
	}
	if sleeps[0] != strategy3BuyOutSleep || sleeps[1] != listenerRoundSleep {
		t.Fatalf("unexpected sleep order: %v", sleeps)
	}
}

func TestRunListenerRoundPostErrorDoesNotInterruptLaterParams(t *testing.T) {
	firstHash := common.HexToHash("0x1")
	secondHash := common.HexToHash("0x2")
	txch := make(chan common.Hash, 2)
	txch <- firstHash
	txch <- secondHash

	var posts []ArbitrageParem
	state := runListenerRound(
		context.Background(),
		RuntimeConfig{Strategy: 1},
		ListenerState{},
		txch,
		roundFetcher(t, map[common.Hash]*types.Transaction{
			firstHash:  pendingTestTx(1, 1000, "0x7ff36ab5"),
			secondHash: pendingTestTx(2, 800, "0x18cbafe5"),
		}),
		func(ctx context.Context, param ArbitrageParem) error {
			posts = append(posts, param)
			if len(posts) == 1 {
				return fmt.Errorf("backend failed")
			}
			return nil
		},
		func(duration time.Duration) {},
		20*time.Millisecond,
	)

	if state.Strategy3Flag != 0 {
		t.Fatalf("strategy1 should not change state")
	}
	if len(posts) != 2 {
		t.Fatalf("expected post error not to interrupt later params, got %d posts", len(posts))
	}
	if posts[0].Gasprice.Cmp(big.NewInt(1100)) != 0 || posts[1].Gasprice.Cmp(big.NewInt(900)) != 0 {
		t.Fatalf("unexpected posts: %+v", posts)
	}
}
