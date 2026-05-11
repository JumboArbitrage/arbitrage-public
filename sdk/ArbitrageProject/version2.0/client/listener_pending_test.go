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

func pendingTestTx(nonce uint64, gasPrice int64, selector string) *types.Transaction {
	return types.NewTransaction(
		nonce,
		common.HexToAddress("0x0000000000000000000000000000000000000001"),
		big.NewInt(1),
		21000,
		big.NewInt(gasPrice),
		common.FromHex(selector+"00000000"),
	)
}

func TestCollectPendingWindowFetchesAndDecodesTransactions(t *testing.T) {
	firstHash := common.HexToHash("0x1")
	secondHash := common.HexToHash("0x2")
	txch := make(chan common.Hash, 2)
	txch <- firstHash
	txch <- secondHash

	fetched := map[common.Hash]*types.Transaction{
		firstHash:  pendingTestTx(1, 1000, "0x7ff36ab5"),
		secondHash: pendingTestTx(2, 900, "0x18cbafe5"),
	}
	txData := collectPendingWindow(
		context.Background(),
		txch,
		func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
			return fetched[hash], nil
		},
		20*time.Millisecond,
	)

	if len(txData) != 2 {
		t.Fatalf("expected two decoded transactions, got %d", len(txData))
	}
	if txData[0].CheckInorOut() != BuyIn {
		t.Fatalf("expected first transaction to be buy-in")
	}
	if txData[1].CheckInorOut() != BuyOut {
		t.Fatalf("expected second transaction to be buy-out")
	}
}

func TestCollectPendingWindowSkipsFetchErrors(t *testing.T) {
	errorHash := common.HexToHash("0x1")
	goodHash := common.HexToHash("0x2")
	txch := make(chan common.Hash, 2)
	txch <- errorHash
	txch <- goodHash

	txData := collectPendingWindow(
		context.Background(),
		txch,
		func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
			if hash == errorHash {
				return nil, fmt.Errorf("missing tx")
			}
			return pendingTestTx(2, 900, "0x7ff36ab5"), nil
		},
		20*time.Millisecond,
	)

	if len(txData) != 1 {
		t.Fatalf("expected one decoded transaction after fetch error, got %d", len(txData))
	}
	if txData[0].Gasprice.Cmp(big.NewInt(900)) != 0 {
		t.Fatalf("unexpected gas price: %s", txData[0].Gasprice.String())
	}
}

func TestCollectPendingWindowEmptyWindowReturnsEmptyData(t *testing.T) {
	txData := collectPendingWindow(
		context.Background(),
		make(chan common.Hash),
		func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
			t.Fatalf("fetch should not be called for an empty window")
			return nil, nil
		},
		5*time.Millisecond,
	)

	if len(txData) != 0 {
		t.Fatalf("expected empty data, got %d", len(txData))
	}
}

func TestCollectPendingWindowDoesNotFetchLateHashes(t *testing.T) {
	txch := make(chan common.Hash, 1)
	sent := make(chan struct{})
	go func() {
		defer close(sent)
		time.Sleep(20 * time.Millisecond)
		txch <- common.HexToHash("0x1")
	}()

	fetches := 0
	txData := collectPendingWindow(
		context.Background(),
		txch,
		func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
			fetches++
			return pendingTestTx(1, 1000, "0x7ff36ab5"), nil
		},
		5*time.Millisecond,
	)
	<-sent

	if len(txData) != 0 {
		t.Fatalf("expected no data before late hash, got %d", len(txData))
	}
	if fetches != 0 {
		t.Fatalf("expected no late fetches, got %d", fetches)
	}
}

func TestCollectPendingWindowStopsAfterContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	firstHash := common.HexToHash("0x1")
	txch := make(chan common.Hash, 1)
	txch <- firstHash
	fetches := 0

	txData := collectPendingWindow(
		ctx,
		txch,
		func(ctx context.Context, hash common.Hash) (*types.Transaction, error) {
			fetches++
			cancel()
			return pendingTestTx(1, 1000, "0x7ff36ab5"), nil
		},
		time.Second,
	)

	if fetches != 1 {
		t.Fatalf("expected one fetch before cancellation, got %d", fetches)
	}
	if len(txData) != 1 {
		t.Fatalf("expected one decoded transaction before cancellation, got %d", len(txData))
	}
}
