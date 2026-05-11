package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/ethclient/gethclient"
	"github.com/ethereum/go-ethereum/rpc"
)

func watch() {
	logFile, err := os.OpenFile("./clientlog.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("failed to open log file: %v", err)
		return
	}
	log.SetOutput(logFile)
	log.SetFlags(log.Llongfile | log.Lmicroseconds | log.Ldate)
	config := LoadRuntimeConfig()
	if err := config.ValidateLive(); err != nil {
		log.Printf("listener not started: %v", err)
		return
	}
	listenerState := ListenerState{} //和第三笔策略有关
	backend, err := ethclient.Dial(config.RPCHTTPURL)
	if err != nil {
		log.Printf("failed to dial: %v", err)
		return
	}

	rpcCli, err := rpc.Dial(config.RPCWSURL)
	if err != nil {
		log.Printf("failed to dial: %v", err)
		return
	}
	gcli := gethclient.New(rpcCli)
	backendClient := NewBackendClient(config)
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
	var params []ArbitrageParem
	var strategySleep time.Duration
	listenerState, params, strategySleep = runListenerStrategy(config, listenerState, txData)
	for _, param := range params {
		postArbitrageParam(backendClient, param)
	}
	if strategySleep > 0 {
		time.Sleep(strategySleep)
	}
	time.Sleep(time.Second * 20)
	goto NEXT_BLOCK
}

func postArbitrageParam(backendClient BackendClient, param ArbitrageParem) {
	gasPrice, err := FormatGasPriceWei(param.Gasprice)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("The GasPrice is", gasPrice)
	if err := backendClient.PostArbitrage(context.Background(), param); err != nil {
		log.Println(err)
		return
	}
	log.Println("posted arbitrage request")
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
