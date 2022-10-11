## The Code

+ `Decodetxdata.go`. The function called Decodetxdata that parses the transaction data is defined here. 
+ `func1.go`. The strategy1 is defined here.
+ `utils.go`. Some types and conversion functions are defined here.
+ `listerner.go`. The function called watch which retrieves unpackaged trades from the txpool is defined here.
+ `fun2.go`. The strategy2 is defined here.
+ Because strategy 3 is special, I did not use a separate function to implement strategy 3, but put it directly into the `watch` function.

-----

## How to Run

```shell
go mod init
go mod tidy
go run listener.go
```