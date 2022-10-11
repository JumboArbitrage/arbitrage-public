package main

import (
	"log"
	"math/big"
)

var MaxexpectOfvalue *big.Float
var BuyinOrOut []int

func (txData Datas) check() bool {
	n := len(txData)
	//var expectValue *big.Float
	//expectValue.SetFloat64(0)
	//expectcount := 0
	for i := 0; i < n; i++ {
		temp := txData[i]
		if temp.method == swapExactETHForTokens || temp.method == swapETHForExactTokens {
			// expectcount--
			// expectValue.Sub(expectValue, temp.Value)
			BuyinOrOut[i] = BuyIn
		} else if temp.method == swapExactTokensForETH || temp.method == swapTokensForExactETH {
			// expectcount++
			// expectValue.Add(expectValue, temp.Value)
			BuyinOrOut[i] = BuyOut
		}
	}
	// if expectcount <= MaxexpectOfcount && expectValue.Cmp(MaxexpectOfvalue) != 1 {
	// 	return true
	// }
	return true
}
func (txData Datas) Strategy2() []ArbitrageParem {
	//MaxexpectOfvalue.SetFloat64(10000)
	BuyinOrOut = make([]int, len(txData))
	if txData.check() {
		n := len(txData)
		var ArbitPs []ArbitrageParem
		divtemp := new(big.Int).SetInt64(10)
		p := new(big.Int)
		p.Div(txData[0].Gasprice, divtemp)
		p.Add(p, txData[0].Gasprice)
		ArbitPs = append(ArbitPs, ArbitrageParem{
			Gasprice: p,
			InOrOut:  BuyinOrOut[0],
		})
		for i := 1; i < n; i++ {
			if BuyinOrOut[i] != BuyinOrOut[i-1] {
				log.Println("the index is", i)
				tp := new(big.Int)
				tp.Div(txData[i].Gasprice, divtemp)
				tp.Add(tp, txData[i].Gasprice)
				ArbitPs = append(ArbitPs, ArbitrageParem{
					Gasprice: tp,
					InOrOut:  BuyinOrOut[i],
				})
			}
		}
		return ArbitPs
	}
	return nil
}
