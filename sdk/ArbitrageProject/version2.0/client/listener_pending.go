package main

import (
	"context"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

type pendingTxFetcher func(context.Context, common.Hash) (*types.Transaction, error)

func collectPendingWindow(
	ctx context.Context,
	txch <-chan common.Hash,
	fetch pendingTxFetcher,
	window time.Duration,
) Datas {
	var txData Datas
	timeout := time.NewTimer(window)
	defer timeout.Stop()

	for {
		select {
		case <-ctx.Done():
			return txData
		case txhash := <-txch:
			tx, err := fetch(ctx, txhash)
			if err != nil {
				continue
			}
			txData = txData.Decodetxdata(tx)
		case <-timeout.C:
			return txData
		}
	}
}
