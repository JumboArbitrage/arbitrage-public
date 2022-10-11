package main

import (
	"context"
	"log"
	"math"
	"math/big"
	"net/http"
	ur "net/url"
	"os"
	"os/signal"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/ethclient/gethclient"
	"github.com/ethereum/go-ethereum/rpc"
)

const (
	url = "https://eth-rinkeby.alchemyapi.io/v2/PeWdDU96WNZQaIuLFLD_X8wInQ3iKWQf"
	wss = "wss://eth-rinkeby.alchemyapi.io/v2/PeWdDU96WNZQaIuLFLD_X8wInQ3iKWQf"
)

func watch() {
	logFile, err := os.OpenFile("./clientlog.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	log.SetOutput(logFile)
	log.SetFlags(log.Llongfile | log.Lmicroseconds | log.Ldate)
	flagofs3 := 0 //和第三笔策略有关
	backend, err := ethclient.Dial(url)
	if err != nil {
		log.Printf("failed to dial: %v", err)
		return
	}

	rpcCli, err := rpc.Dial(wss)
	if err != nil {
		log.Printf("failed to dial: %v", err)
		return
	}
	gcli := gethclient.New(rpcCli)
NEXT_BLOCK:
	txch := make(chan common.Hash, 100)
	_, err = gcli.SubscribePendingTransactions(context.Background(), txch)
	if err != nil {
		log.Printf("failed to SubscribePendingTransactions: %v", err)
		return
	}

	var txData Datas
	timeout := time.After(time.Second * 3) //设置为七秒后停止获取交易
	for {
		select {
		case txhash := <-txch:
			//log.Println("start")
			tx, _, err := backend.TransactionByHash(context.Background(), txhash)
			if err != nil {
				continue
			}
			txData = txData.Decodetxdata(tx)
			// if len(txData) == 1 {
			// 	log.Println("Let's run Strategy3")
			// 	goto FOR_STR3
			// }
			//log.Println("end")
		case <-timeout:
			goto A_BLOCK
		}

	}
A_BLOCK:
	if len(txData) == 0 {
		log.Printf("no transaction")
		//		time.Sleep(time.Second * 10)
		goto NEXT_BLOCK
	}
	sort.Slice(txData, func(i, j int) bool {
		p := txData[i].Gasprice.Cmp(txData[j].Gasprice)
		return p == 1
	}) // sort txData by Gasprice
	//FOR_STR3:
	function := 2 //设置选择哪种策略,目前还是需要手工设置
	// if len(txData) != 1 && function == 3 {
	// 	log.Println("len of txdata:", len(txData))
	// 	goto NEXT_BLOCK
	// }
	//fmt.Println(txData)
	switch function {
	case 1:
		AbitsPrs := txData.Strategy1()
		for _, Abit := range AbitsPrs {
			if Abit.InOrOut == BuyOut {
				//to do,暂时传的是字符串
				postData := ur.Values{}
				temp := BigIntToFloat(Abit.Gasprice).String() //得到形如1.00032e-9的字符串
				temp1 := strings.Split(temp, "e")             //按e进行分割
				p1 := temp1[0]                                //得到数值部分
				p2 := temp1[1]                                //得到指数部分
				p3 := strings.Split(p1, ".")[1]               //按小数点进行分割,得到小数点到e处的数字,重点是他的长度
				nump2, _ := strconv.Atoi(p2)
				GP := BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2))))
				//Text函数的第二个参数代表小数点后面保留的位数,感觉像上面这个1.00032e-9就应该是5+9
				//log.Println(BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2)))))
				log.Println("The GasPrice is", GP)
				postData.Add("Gasprice", GP)
				postData.Add("InOrOut", "false")
				log.Printf("true")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println(resp)
			} else if Abit.InOrOut == BuyIn {
				postData := ur.Values{}
				temp := BigIntToFloat(Abit.Gasprice).String() //得到形如1.00032e-9的字符串
				temp1 := strings.Split(temp, "e")             //按e进行分割
				p1 := temp1[0]                                //得到数值部分
				p2 := temp1[1]                                //得到指数部分
				p3 := strings.Split(p1, ".")[1]               //按小数点进行分割,得到小数点到e处的数字,重点是他的长度
				nump2, _ := strconv.Atoi(p2)
				GP := BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2))))
				log.Println("The GasPrice is", GP)
				//log.Println(BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2)))))
				postData.Add("Gasprice", GP)
				postData.Add("InOrOut", "true")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println("false")
				log.Println(resp)
			}
		}
		//fmt.Println(postData)
		// resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
		// if err != nil {
		// 	log.Println(err)
		// }
		// log.Println(resp)
	case 2:
		AbitsPrs := txData.Strategy2()
		// if AbitsPrs == nil {
		// 	log.Printf("the txData is not balanced")
		// 	goto NEXT_BLOCK
		// }
		//postData := ur.Values{}
		for _, Abit := range AbitsPrs {
			if Abit.InOrOut == BuyIn {
				//to do,暂时传的是字符串
				postData := ur.Values{}
				temp := BigIntToFloat(Abit.Gasprice).String() //得到形如1.00032e-9的字符串
				temp1 := strings.Split(temp, "e")             //按e进行分割
				p1 := temp1[0]                                //得到数值部分
				p2 := temp1[1]                                //得到指数部分
				p3 := strings.Split(p1, ".")[1]               //按小数点进行分割,得到小数点到e处的数字,重点是他的长度
				nump2, _ := strconv.Atoi(p2)
				GP := BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2))))
				//Text函数的第二个参数代表小数点后面保留的位数,感觉像上面这个1.00032e-9就应该是5+9
				//log.Println(BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2)))))
				log.Println("The GasPrice is", GP)
				postData.Add("Gasprice", GP)
				postData.Add("InOrOut", "true")
				//	log.Printf("true")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println(resp)
			} else if Abit.InOrOut == BuyOut {
				postData := ur.Values{}
				temp := BigIntToFloat(Abit.Gasprice).String() //得到形如1.00032e-9的字符串
				temp1 := strings.Split(temp, "e")             //按e进行分割
				p1 := temp1[0]                                //得到数值部分
				p2 := temp1[1]                                //得到指数部分
				p3 := strings.Split(p1, ".")[1]               //按小数点进行分割,得到小数点到e处的数字,重点是他的长度
				nump2, _ := strconv.Atoi(p2)
				GP := BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2))))
				//Text函数的第二个参数代表小数点后面保留的位数,感觉像上面这个1.00032e-9就应该是5+9
				//log.Println(BigIntToFloat(Abit.Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2)))))
				log.Println("The GasPrice is", GP)
				postData.Add("Gasprice", GP)
				postData.Add("InOrOut", "false")
				log.Printf("true")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println(resp)
			}
		}
		// resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
		// if err != nil {
		// 	log.Println(err)
		// }
		// log.Println(resp)
	case 3:
		// if txData[0].CheckInorOut() == BuyIn {
		// 	flagofs3++
		// 	// return a AbitPs of BuyIn
		// } else {
		// 	flagofs3--
		// 	// return a AbitPs of BuyOut
		// }
		divtemp := new(big.Int).SetInt64(10)
		p := new(big.Int)
		p.Div(txData[0].Gasprice, divtemp)
		p.Add(p, txData[0].Gasprice)
		temp := BigIntToFloat(p).String() //得到形如1.00032e-9的字符串
		temp1 := strings.Split(temp, "e") //按e进行分割
		p1 := temp1[0]                    //得到数值部分
		p2 := temp1[1]                    //得到指数部分
		p3 := strings.Split(p1, ".")[1]   //按小数点进行分割,得到小数点到e处的数字,重点是他的长度
		nump2, _ := strconv.Atoi(p2)
		Gasstring := BigIntToFloat(txData[0].Gasprice).Text('f', len(p3)+int(math.Abs(float64(nump2))))
		tempflag := flagofs3
		if flagofs3 == 0 {
			if txData[0].CheckInorOut() == BuyIn {
				//flagofs3++
				tempflag = flagofs3 + 1
				// return a AbitPs of BuyIn
				log.Println("BuyIn")
				postData := ur.Values{}
				postData.Add("Gasprice", Gasstring)
				postData.Add("InOrOut", "true")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println(resp)
			} else {
				log.Println("We need a BuyIn,but get a BuyOut")
			}
			// } else {
			// 	//flagofs3--
			// 	tempflag = flagofs3 - 1
			// 	// return a AbitPs of BuyOut
			// 	//postData.Add("Gasprice", BigIntToFloat(txData[0].Gasprice).String())
			// 	log.Println("Butout")
			// 	postData := ur.Values{}
			// 	postData.Add("Gasprice", Gasstring)
			// 	postData.Add("InOrOut", "false")
			// 	resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
			// 	if err != nil {
			// 		log.Println(err)
			// 	}
			// 	log.Println(resp)
			// }
		} else if flagofs3 == 1 {
			if txData[0].CheckInorOut() == BuyOut {
				//flagofs3--
				tempflag = flagofs3 - 1
				// return a AbtisPs of BuyOut
				//postData.Add("Gasprice", BigIntToFloat(txData[0].Gasprice).String())
				postData := ur.Values{}
				log.Println("Butout")
				postData.Add("Gasprice", Gasstring)
				postData.Add("InOrOut", "false")
				resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
				if err != nil {
					log.Println(err)
				}
				log.Println(resp)
				time.Sleep(time.Second * 10)
			} else {
				log.Println("We need a BuyOut,but get a BuyIn")
			}
			// } else if flagofs3 == -1 {
			// 	if txData[0].CheckInorOut() == BuyIn {
			// 		//flagofs3++
			// 		tempflag = flagofs3 + 1
			// 		// return a AbitsPs of BuyInS
			// 		//postData.Add("Gasprice", BigIntToFloat(txData[0].Gasprice).String())
			// 		postData := ur.Values{}
			// 		postData.Add("Gasprice", Gasstring)
			// 		postData.Add("InOrOut", "true")
			// 		log.Println("buyin")
			// 		resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
			// 		if err != nil {
			// 			log.Println(err)
			// 		}
			// 		log.Println(resp)
			// 	}
		}
		flagofs3 = tempflag
	}
	time.Sleep(time.Second * 20)
	goto NEXT_BLOCK
}

func main() {
	// type msg struct {
	// 	Name    string
	// 	Message string
	// }
	// r := gin.Default()
	// // 使用允许跨域请求中间件
	// r.Use(Cors())
	// // 设置一个get请求的路由，url为/arbitrageDeploy
	// // 处理函数（或者叫控制器函数）是闭包函数
	// r.GET("/arbitrageDeploy", func(c *gin.Context) {
	// 	// 首字母！
	// 	data := msg{
	// 		Name:    "Go语言",
	// 		Message: "Gin框架",
	// 	}
	// 	// 通过请求上下文对象Context, 直接往客户端返回一个json
	// 	c.JSON(http.StatusOK, data)
	// })
	// // 可认证分组:

	// //定义默认路由
	// r.NoRoute(func(c *gin.Context) {
	// 	c.JSON(http.StatusNotFound, gin.H{
	// 		"status": 404,
	// 		"error":  "404, page not exists!",
	// 	})
	// })
	// err := r.Run(":9090")
	// if err != nil {
	// 	return
	// }
	// postData := ur.Values{}
	// postData.Add("Gasprice", )
	// postData.Add("InOrOut", "true")
	// resp, err := http.Post("http://localhost:8081/arbitrage", "application/x-www-form-urlencoded", strings.NewReader(postData.Encode()))
	// if err != nil {
	// 	log.Println(err)
	// }
	// log.Println(resp)
	go watch()
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)
	<-signalChan
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		c.Header("Access-Control-Allow-Origin", "*")                                                       // 可将将 * 替换为指定的域名
		c.Header("Access-Control-Allow-Headers", "Content-Type, AccessToken, X-CSRF-Token, Authorization") // 放行的header（后面自行添加）
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")                // 我自己只使用 get post 所以只放行它
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		// 放行所有OPTIONS方法
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		// 处理请求
		c.Next()
	}
}

func Buy() {

}
