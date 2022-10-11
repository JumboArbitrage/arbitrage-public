# 1. Guidelines:

## 1. SDK

### 1. TradeInit

#### 1.1 browser version:

- Download [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb), copy the local project and run it as its notes.

- Or all you need to do is use a local web server. Popular choices include:
  
  - Live Server, a VS Code extension that adds a right-click option to run your pages with a local server.
  - Node static server, a simple http server to serve static resource files from a local directory.
  - Node live server is easy to install and use:
  
  ```shell
  npm install -g live-server // Install globally via npmlive-server                // Run in the html's directory
  ```

- Then you can run and debug your code on Chrome! (F12)

- The first function lets you modify your code on the web IDE, while on the other hand, you can modify the code locally or on the web IDE.

#### 1.2 local version:

How to run:

```shell
npm install -g cnpm --registry=https://registry.npm.taobao.orgcnpm inode ./js/main.js --testBuyCount=a --ethBuyCount=b --testSellCount=c --ethSellCount=d
# OR: any other js script in the same folder
# a, b, c, and d are the numbers you define yourself
```

### 2. ArbitrageProject (version 2.0)

#### 2.1 back-end:

- It is to accept client requests for arbitrage work.
- It is recommended to use express-backend (since the version with the nest framework has not yet been completed), developed using the express framework of node.js.
- How to run:

```shell
npm install -g cnpm --registry = https://registry.npm.taobao.orgcnpm inode ./app.js
```

#### 2.2 client:

- It is to retrieve unpackage trades from the txpool which is defined here, and then request the backend for arbitrage work.
- How to run:

```shell
go mod initgo mod tidygo run listener.go Decodetxdata.go func1.go func2.go utils.go
```

## 2. [gelato-uniswap](https://github.com/gelatodigital/gelato-uniswap) / [gelato-network](https://github.com/gelatodigital/gelato-network)

- Through it, you can use the Gelato Network to build an automated dapp.
- In this example, the dapp enables users to automatically swap DAI for ETH on Uniswap every 2 minutes using Gelato.
- You can think of it as a Dollar Cost Averaging Dapp built on Uniswap.

## 3. Uniswap sdk

(to be updated...)

# 2. Commit Rules:

- First, create a new branch from dev and push this branch to the repository.
- After your part of work, merge your temporary branch to dev (you can certainly create merge requests).
- The released version is on the main branch.
