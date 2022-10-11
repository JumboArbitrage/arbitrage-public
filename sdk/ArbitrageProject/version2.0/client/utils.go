package main

import (
	"fmt"
	"log"
	"math"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

const (
	swapExactETHForTokens = iota
	swapExactTokensForETH
	swapETHForExactTokens
	swapTokensForExactETH
)

const (
	BuyIn            = 0
	BuyOut           = 1
	OtherMethod      = 2
	MaxexpectOfcount = 10
)

type ArbitrageParem struct {
	Gasprice *big.Int
	InOrOut  int
}

type Data struct {
	Type      uint8 // type of transaction, 0x0, 0x1, 0x2
	ChainID   *big.Int
	Nonce     uint64
	To        *common.Address
	From      common.Address
	InputData string
	Gas       uint64
	Gasprice  *big.Int
	GasTipCap *big.Float
	GasFeeCap *big.Float
	Value     *big.Float
	hash      common.Hash
	//method    MethodData // Here is the parsed inputdata
	method int
}
type Datas []Data

func Printdata(data *Data) {

	//log.Println("------------------------------------------")
	log.Printf("Hash: 0x%x\n", data.hash)
	//	fmt.Printf("To: 0x%x\n", *data.To)
	//log.Printf("Value: %v GWei\n", data.Value)
	//log.Printf("Gas Price: %v GWei\n", data.Gasprice)
	//log.Printf("Gas Limit: %v\n", data.Gas)
	//log.Printf("Gas Fees Max Priority: %v GWei\n", data.GasTipCap)
	//log.Printf("Gas Fees Max: %v GWei\n", data.GasFeeCap)
	//log.Printf("Nonce: %d\n", data.Nonce)
	//log.Printf("Type: %d\n", data.Type)
	//log.Printf("inputdata: %s\n", data.InputData)
	//fmt.Println(data.InputData)
	// fmt.Println(data.method.Name)
	// for _, param := range data.method.Params {
	// 	fmt.Println(param)
	// }
	//log.Println("-------------------------------------------")
}

func BigIntToFloat(bigi *big.Int) *big.Float {
	WeiToGWei := new(big.Float).SetFloat64(math.Pow(10, -18))
	temp := new(big.Float).SetInt(bigi)
	return temp.Mul(WeiToGWei, temp)
}

func BigIntToBigFloat(bigi *big.Int) *big.Float {
	WeiToGWei := new(big.Float).SetFloat64(math.Pow(10, -9))
	temp := new(big.Float).SetInt(bigi)
	return temp.Mul(WeiToGWei, temp)
}

func ByteArrToString(inputdata []byte) string {
	temp := fmt.Sprintf("%x", inputdata)
	return "0x" + temp
}

func (txData Data) CheckInorOut() int {
	if txData.method == swapETHForExactTokens || txData.method == swapExactETHForTokens {
		return BuyIn
	}
	if txData.method == swapExactTokensForETH || txData.method == swapTokensForExactETH {
		return BuyOut
	}
	return OtherMethod
}
