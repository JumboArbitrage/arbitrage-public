package main

import (
	"github.com/ethereum/go-ethereum/core/types"
)

func (txData Datas) Decodetxdata(tx *types.Transaction) Datas {
	//Parse inputdata with the methods provided by the package abi-decoder
	inputdata := ByteArrToString(tx.Data())
	if len(inputdata) <= 10 {
		return txData
	}
	data := Data{
		//Type:      tx.Type(),
		//ChainID:   tx.ChainId(),
		//Nonce:     tx.Nonce(),
		//To:        tx.To(),
		//Gas:       tx.Gas(),
		Gasprice: tx.GasPrice(),
		//GasTipCap: BigIntToBigFloat(tx.GasTipCap()),
		//GasFeeCap: BigIntToBigFloat(tx.GasFeeCap()),
		Value: BigIntToBigFloat(tx.Value()),
		hash:  tx.Hash(),
	}
	decodeSig := inputdata[2:10]
	switch decodeSig {
	case "7ff36ab5":
		data.method = swapExactETHForTokens
	case "18cbafe5":
		data.method = swapExactTokensForETH
	case "fb3bdb41":
		data.method = swapETHForExactTokens
	case "4a25d94a":
		data.method = swapTokensForExactETH
	default:
		data.method = 100
	}
	if data.method != 100 {
		if data.method == swapTokensForExactETH || data.method == swapExactTokensForETH {
			data.Value.Neg(data.Value)
		}

		txData = append(txData, data)
		Printdata(&data) //print data fields
	}
	//else {
	//	log.Println("this is not we need")
	//	Printdata(&data)
	//	log.Println("end")
	//}
	return txData
}
