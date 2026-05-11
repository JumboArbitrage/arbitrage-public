package main

import (
	"context"

	"github.com/ethereum/go-ethereum/common"
)

const pendingTransactionChannelSize = 100

type pendingTransactionSubscriber func(context.Context, chan<- common.Hash) error

func subscribePendingTransactions(
	ctx context.Context,
	subscribe pendingTransactionSubscriber,
) (<-chan common.Hash, error) {
	txch := make(chan common.Hash, pendingTransactionChannelSize)
	if err := subscribe(ctx, txch); err != nil {
		return nil, err
	}
	return txch, nil
}
