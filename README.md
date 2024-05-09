# **arbitrage-repo-for-public**

> **✨ This is a rudimentary version of an eth arbitrage repository. The advanced version is under development and is a private repository. We will regularly update the relevant content of the public warehouse, so stay tuned!**
> 
> **✨ For more information, please visit the [Wiki](https://github.com/JumboArbitrage/arbitrage-public/wiki/).**

## **Commit Rules:**

+ First create a new branch from `dev` and push this branch to the repository.
+ After your part of work, merge your temporary branch to `dev` (you can certainly create merge requests).
+ The release version is on the `main` branch.

## **Documentation Guidelines:**

### **SDK**

#### ✅ **TradeInit**

1. **browser version:**
   
   How to run:
+ Download  [**Web Server for Chrome**](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb), copy the local project and run it as its notes.
+ Or all you need to do is use a local web server. Popular choices include:
1. **Live Server**, a VS Code extension that adds a right-click option to run your pages with a local server.

2. **Node static server**, a simple http server to serve static resource files from a local directory.

3. **Node live server** is easy to install and use:
   
   ```shell
   npm install -g live-server // Install globally via npm
   live-server                // Run in the html's directory
   ```
+ Then you can run and debug your code on Chrome! **(`F12`)**
  
  The first function let you modify your code on the web IDE, while in the other way, you can modify the code locally or on the web IDE.
2. **local version:**
   
   How to run:
   
   ```shell
   npm install -g cnpm --registry=https://registry.npm.taobao.org
   cnpm i
   node ./js/main.js
   ```

#### ✅ **ArbitrageProject**

1. **Back-end:**
   
   It is to accept client requests for arbitrage work. 
   
   It is recommended to use **express-backend** (since the version with the nest framework has not yet been completed), developed using the express framework of node.js.
   
   How to run:
   
   ```shell
   npm install -g cnpm --registry = https://registry.npm.taobao.org
   cnpm i
   node ./app.js
   ```

2. **Client:**
   
   It is to retrieve unpackaged trades from the txpool is defined here, and then request the backend for arbitrage work.
   
   How to run:
   
   ```go
   go mod init
   go mod tidy
   go run listener.go Decodetxdata.go func1.go func2.go utils.go
   ```

### **[gelato-uniswap](https://github.com/gelatodigital/gelato-uniswap) or [gelato-network](https://github.com/gelatodigital/gelato-network)**

- Through it, you can use the **Gelato Network** to build an automated dapp. 

- In this example, the dapp enables Users to automatically swap DAI for ETH on Uniswap every 2 minutes using Gelato. 

- You can think of it as a Dollar Cost Averaging Dapp build on Uniswap.
