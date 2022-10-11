# 一、repo 提交规则

1. 从 `dev` 创建一个新分支并将此分支 `push` 到存储库；

2. 在您完成部分工作后，将您的临时分支合并到 `dev`（您当然可以创建 `merge request` ）；

3. 发布的版本在主分支上。

# 二、工具说明

## 2.1 SDK

**说明：**

1. 本SDK目前只针对ETH进行套利策略，分为**发起交易**、**套利**两个模块：

2. 其中交易发起模块分为网页版本以及本地版本，目前以本地版本为主；

3. 套利模块使用服务端进行套利交易的发起，客户端进行链上交易的捕捉。

4. 环境说明;

5. 测试网络：Rinkeby；

6. 基于协议：Uniswap V2；

7. 运行系统：不限，但是相关脚本程序目前只有linux系统下的版本。

### 交易发起模块`TradeInit`

#### 本地版本 `local version`

- 运行：
  
  ```shell
  npm install -g cnpm --registry=https://registry.npm.taobao.orgcnpm inode ./js/main.js --testBuyCount=a --ethBuyCount=b --testSellCount=c --ethSellCount=d
  # OR: any other js script in the same folder# a, b, c, and d are the numbers you define yourself
  ```

- 如果使用linux系统，可运行自动发送交易脚本`sdk/scripts`文件夹下的`tradeInit_0x.sh`脚本程序，其中x代表策略号；

- 注意事项：
  
  1. Gas price 目前是自定义状态，可在`mainx_y.js`文件中修改；
  
  2. 使用`web3.js`或者`ether.js`时要注意API有所不同；
  
  3. 要区分转账和swap的区别，最大不同体现在交易数据txData上，打包一笔交易时候要根据所需判断是否需要修改/写`to`和`value`这两个数据成员；
  
  4. 同一时间发送交易过多，或者由于网络问题，可能会出现**交易发起失败**的现象比如涉及到nonce值、gas费超过交易费用等等；
  
  5. **解决方法**包括但不限于：增加nonce值、增大gas price值、检查测试账户上是否还有余额、去app.uniswap上查看流动性等。

- 相关技巧：
  
  1. 同一区块不能发太多笔交易；
  
  2. 利用异步函数等使得新的一组交易位于同一区块；
  
  3. 先打包交易后以一组为单位统一发送，使用异步函数查看交易结果；
  
  4. 可利用`js`文件夹下的`ethGenerator.js`生成多个测试账户；
  
  5. 模块化设计，基本信息只需改动`config.json`；

#### 网页版本 `browser version` （仍需完善）

- 下载 [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)，复制本地项目并将其作为注释运行；

- 或者您需要做的就是使用本地 Web 服务器。 流行的选择包括：
  
  1. Live Server，一个 VS Code 扩展，它添加了一个右键单击选项来使用本地服务器运行您的页面；
  
  2. Node static server，一个简单的 http 服务器，用于从本地目录提供静态资源文件；

        其中 Node static server 易于安装和使用：`npm install -g live-server // 通过 npm 全局安装live-server // 在 html 目录下运行`

    然后你就可以在 Chrome 上运行和调试你的代码了！ (F12)

    第一个功能允许您在 Web IDE 上修改代码，而另一方面，您可以在本地或 Web IDE 上修改代码；

- 其余注意事项大致与本地版本相同。

### 套利模块 `ArbitrageProject`

#### 客户端

- 运行：
  
  ```shell
  go mod initgo mod tidygo run listener.go Decodetxdata.go func1.go func2.go utils.go
  ```
  
  如果使用linux系统，可运行`sdk/scripts`文件夹下的`client.sh`脚本程序来启动对交易的监听处理程序

- 说明：
  
  - 使用geth提供的接口向结点获取交易，并进行解码得到交易数据
  
  - 实现了三种套利方法，根据监听到的交易生成套利交易的数据，将交易数据发给后端进行套利

- 注意事项：
  
  - 有可能出现套利失败的情况，需要进一步完善对套利失败情况的避免
  
  - 就监听而言，很有可能出现监听时间时间不足导致监听到的交易较少，最终套利失败的问题
  
  - geth通过请求结点来监听交易，但是结点不支持并发请求，即使本地并发，结点也是串行处理的
  
  - 解决方法包括但不限于：请求多个结点、搭建私链等。

#### 服务端

- 运行：
  
  ```shell
  npm install -g cnpm --registry = https://registry.npm.taobao.orgcnpm inode ./app.js --testCount=x
  # x is the number of you define yourself
  ```

   或者如果使用linux系统，可运行自动发送交易脚本`sdk/scripts`文件夹下的`arbitrage.sh`脚本程序；

- 说明：
  
  1. 使用express框架进行编写；
  
  2. 模块化设计，基本信息可以通过修改`config`文件夹以及环境变量文件`.env`内容；
  
  3. 发送套利交易与交易发起大致实现没有区别，所踩坑也大同小异；

## 2.2 [gelato-uniswap](https://github.com/gelatodigital/gelato-uniswap) / [gelato-network](https://github.com/gelatodigital/gelato-network)

**说明：**

这是一个使用 Gelato 和 Uniswap 构建的自动交易 dapp；

功能是使用户能够使用 Gelato 每 x 分钟在 Uniswap 上自动将 DAI等代币换成 ETH；

您可以将其视为基于 Uniswap 构建的美元成本平均 Dapp。

具体实现请点击链接查看仓库的 readme。

## 2.3 Uniswap自带SDK使用

**说明：**

结合uniswap官方文档和官方sdk进行相关配置；

其中v3版本基本可以正常使用，但是v2版本首先由于只允许在主网上运行，其次有一些奇奇妙妙的bug所以我们选择了自己造轮子，暂时（永久）放弃使用官方SDK。
