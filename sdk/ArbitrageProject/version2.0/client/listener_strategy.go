package main

import (
	"log"
	"sort"
	"time"
)

const strategy3BuyOutSleep = 10 * time.Second

type ListenerState struct {
	Strategy3Flag int
}

func runListenerStrategy(config RuntimeConfig, state ListenerState, txData Datas) (ListenerState, []ArbitrageParem, time.Duration) {
	if len(txData) == 0 {
		return state, nil, 0
	}

	sort.Slice(txData, func(i, j int) bool {
		return txData[i].Gasprice.Cmp(txData[j].Gasprice) == 1
	})

	switch config.Strategy {
	case 1:
		return state, filterArbitrageParams(txData.Strategy1()), 0
	case 2:
		return state, filterArbitrageParams(txData.Strategy2()), 0
	case 3:
		return runStrategy3(state, txData[0])
	default:
		return state, nil, 0
	}
}

func filterArbitrageParams(params []ArbitrageParem) []ArbitrageParem {
	var filtered []ArbitrageParem
	for _, param := range params {
		if param.InOrOut == BuyIn || param.InOrOut == BuyOut {
			filtered = append(filtered, param)
		}
	}
	return filtered
}

func runStrategy3(state ListenerState, first Data) (ListenerState, []ArbitrageParem, time.Duration) {
	tempFlag := state.Strategy3Flag
	switch state.Strategy3Flag {
	case 0:
		if first.CheckInorOut() == BuyIn {
			tempFlag = state.Strategy3Flag + 1
			log.Println("BuyIn")
			return ListenerState{Strategy3Flag: tempFlag}, []ArbitrageParem{{
				Gasprice: first.Gasprice,
				InOrOut:  BuyIn,
			}}, 0
		}
		log.Println("We need a BuyIn,but get a BuyOut")
	case 1:
		if first.CheckInorOut() == BuyOut {
			tempFlag = state.Strategy3Flag - 1
			log.Println("Butout")
			return ListenerState{Strategy3Flag: tempFlag}, []ArbitrageParem{{
				Gasprice: first.Gasprice,
				InOrOut:  BuyOut,
			}}, strategy3BuyOutSleep
		}
		log.Println("We need a BuyOut,but get a BuyIn")
	}
	return ListenerState{Strategy3Flag: tempFlag}, nil, 0
}
