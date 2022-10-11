package main

import (
	"log"
	"math/big"
)

func (txData Datas) GetInterval() (low int, high int) {
	n := len(txData)
	start := 0
	end := 0
	tempend := 0
	tempstart := 0
	ans := new(big.Float)
	*ans = *txData[0].Value
	tempans := new(big.Float)
	*tempans = *txData[0].Value
	for i := 1; i < n; i++ {
		if !tempans.Signbit() {
			//	log.Println("case 1", tempans.String())
			tempend = i
			tempans.Add(tempans, txData[i].Value)
		} else {
			//log.Println("case 2", tempans.String())
			tempans = txData[i].Value
			tempstart = i
			tempend = i
		}
		//log.Println("ans", ans.String())
		//log.Println("ans.Cmp(tempans)", ans.Cmp(tempans))
		if ans.Cmp(tempans) == -1 {
			//	log.Println("ans", ans.String())
			//	log.Println("tempans", tempans.String())
			start = tempstart
			end = tempend
			*ans = *tempans
		}
	}
	return start, end
}

func (txData Datas) Strategy1() []ArbitrageParem {
	left, right := txData.GetInterval()
	n := len(txData)
	var ArbitPrs []ArbitrageParem
	log.Println("the Interval is [", left, " ", right, "]")
	// for i := 0; i < n; i++ {
	// 	txData[i].Value.Neg(txData[i].Value)
	// }
	//left1, right1 := txData.GetInterval()
	thisgas1 := txData[left].Gasprice
	lastgas1 := new(big.Int)
	temp := big.NewInt(2)
	temp1 := big.NewInt(10)
	if left == 0 {
		lastgas1.Div(thisgas1, temp1)
		lastgas1.Mul(lastgas1, temp)
		lastgas1.Add(thisgas1, lastgas1)
	} else {
		lastgas1 = txData[left-1].Gasprice
	}
	gas1 := new(big.Int)
	gas1.Add(thisgas1, lastgas1)
	gas1.Div(gas1, temp)
	ArbitPrs = append(ArbitPrs, ArbitrageParem{
		Gasprice: gas1,
		InOrOut:  BuyIn,
	})
	thisgas2 := txData[right].Gasprice
	nextgas2 := new(big.Int)
	if right == n-1 {
		nextgas2 = thisgas2
	} else {
		nextgas2 = txData[right+1].Gasprice
	}
	gas2 := new(big.Int)
	gas2.Add(thisgas2, nextgas2)
	gas2.Div(gas2, temp)
	ArbitPrs = append(ArbitPrs, ArbitrageParem{
		Gasprice: gas2,
		InOrOut:  BuyOut,
	})
	// thisgas3 := txData[left1].Gasprice
	// lastgas3 := new(big.Int)
	// if left1 == 0 {
	// 	lastgas3.Add(thisgas3, temp)
	// } else {
	// 	lastgas3 = txData[left1-1].Gasprice
	// }
	// gas3 := new(big.Int)
	// gas3.Add(lastgas3, thisgas3)
	// gas3.Div(gas3, temp)
	// ArbitPrs = append(ArbitPrs, ArbitrageParem{
	// 	Gasprice: gas3,
	// 	InOrOut:  BuyOut,
	// })
	// thisgas4 := txData[right1].Gasprice
	// nextgas4 := new(big.Int)
	// if right1 == n-1 {
	// 	nextgas4 = thisgas4
	// } else {
	// 	nextgas4 = txData[right1+1].Gasprice
	// }
	// gas4 := new(big.Int)
	// gas4.Add(thisgas4, nextgas4)
	// gas4.Div(gas4, temp)
	// ArbitPrs = append(ArbitPrs, ArbitrageParem{
	// 	Gasprice: gas4,
	// 	InOrOut:  BuyIn,
	// })
	return ArbitPrs
}
