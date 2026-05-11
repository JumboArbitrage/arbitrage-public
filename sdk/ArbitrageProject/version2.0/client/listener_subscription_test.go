package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

type subscriptionContextKey struct{}

func TestSubscribePendingTransactionsCreatesBufferedHashChannel(t *testing.T) {
	ctx := context.WithValue(context.Background(), subscriptionContextKey{}, "same-context")
	called := false

	txch, err := subscribePendingTransactions(
		ctx,
		func(gotCtx context.Context, gotCh chan<- common.Hash) error {
			called = true
			if gotCtx.Value(subscriptionContextKey{}) != "same-context" {
				t.Fatalf("subscriber did not receive the original context")
			}
			if cap(gotCh) != pendingTransactionChannelSize {
				t.Fatalf("expected channel capacity %d, got %d", pendingTransactionChannelSize, cap(gotCh))
			}
			gotCh <- common.HexToHash("0x1")
			return nil
		},
	)

	if err != nil {
		t.Fatalf("unexpected subscribe error: %v", err)
	}
	if !called {
		t.Fatalf("expected subscriber to be called")
	}
	if cap(txch) != pendingTransactionChannelSize {
		t.Fatalf("expected returned channel capacity %d, got %d", pendingTransactionChannelSize, cap(txch))
	}
	if got := <-txch; got != common.HexToHash("0x1") {
		t.Fatalf("unexpected hash from channel: %s", got.Hex())
	}
}

func TestSubscribePendingTransactionsReturnsSubscribeError(t *testing.T) {
	expected := fmt.Errorf("subscribe failed")

	txch, err := subscribePendingTransactions(
		context.Background(),
		func(ctx context.Context, gotCh chan<- common.Hash) error {
			if cap(gotCh) != pendingTransactionChannelSize {
				t.Fatalf("expected channel capacity %d, got %d", pendingTransactionChannelSize, cap(gotCh))
			}
			return expected
		},
	)

	if err != expected {
		t.Fatalf("expected original error, got %v", err)
	}
	if txch != nil {
		t.Fatalf("expected nil channel on subscribe error")
	}
}
