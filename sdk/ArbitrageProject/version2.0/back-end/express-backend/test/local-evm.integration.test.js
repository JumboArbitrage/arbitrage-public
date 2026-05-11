const assert = require("assert");

const solc = require("solc");
const { Web3 } = require("web3");

const { createApp } = require("../app");

const localChainGasLimit = 8_000_000;

const anvilKeys = [
  `0x${"ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"}`,
  `0x${"59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"}`,
];

const mockSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(string memory tokenName, string memory tokenSymbol) {
        name = tokenName;
        symbol = tokenSymbol;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance");
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract MockRouter {
    receive() external payable {}

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        pure
        returns (uint256[] memory amounts)
    {
        amounts = new uint256[](path.length);
        amounts[0] = amountOut;
        amounts[path.length - 1] = amountOut;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        pure
        returns (uint256[] memory amounts)
    {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountIn;
    }

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        require(block.timestamp <= deadline, "expired");
        require(msg.value > 0, "value");
        MockERC20(path[path.length - 1]).mint(to, amountOut);
        amounts = new uint256[](path.length);
        amounts[0] = msg.value;
        amounts[path.length - 1] = amountOut;
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(block.timestamp <= deadline, "expired");
        MockERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        require(address(this).balance >= amountOutMin, "eth");
        payable(to).transfer(amountOutMin);
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOutMin;
    }
}
`;

function compileMocks() {
  const output = JSON.parse(
    solc.compile(
      JSON.stringify({
        language: "Solidity",
        sources: {
          "Mocks.sol": {
            content: mockSource,
          },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode.object"],
            },
          },
        },
      }),
    ),
  );

  const errors = (output.errors || []).filter((error) => error.severity === "error");
  if (errors.length) {
    throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
  }
  return output.contracts["Mocks.sol"];
}

async function waitForRpc(web3) {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      await web3.eth.getBlockNumber();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError || new Error("Anvil RPC did not become ready");
}

async function deploy(web3, contract, from, args = []) {
  const deployed = await new web3.eth.Contract(contract.abi)
    .deploy({
      data: `0x${contract.evm.bytecode.object}`,
      arguments: args,
    })
    .send({ from, gas: localChainGasLimit });
  return deployed;
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function postArbitrage(baseUrl, body) {
  const response = await fetch(`${baseUrl}/arbitrage`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const json = await response.json();
  return { response, json };
}

function assertNoSensitiveMaterial(payload) {
  const text = JSON.stringify(payload).toLowerCase();
  for (const key of anvilKeys) {
    assert.ok(!text.includes(key.replace(/^0x/, "").toLowerCase()));
  }
  assert.ok(!text.includes("rawtransaction"));
  assert.ok(!text.includes("serializedtx"));
}

(async () => {
  const rpcUrl = process.env.ANVIL_RPC_URL || "http://127.0.0.1:8545";
  const web3 = new Web3(rpcUrl);
  await waitForRpc(web3);

  const accounts = await web3.eth.getAccounts();
  const buyInAccount = accounts[0];
  const buyOutAccount = accounts[1];
  const deployer = accounts[2];

  const contracts = compileMocks();
  const testToken = await deploy(web3, contracts.MockERC20, deployer, [
    "Mock Test",
    "TEST",
  ]);
  const weth = await deploy(web3, contracts.MockERC20, deployer, ["Mock WETH", "WETH"]);
  const router = await deploy(web3, contracts.MockRouter, deployer);

  await web3.eth.sendTransaction({
    from: deployer,
    to: router.options.address,
    value: web3.utils.toWei("10", "ether"),
    gas: 100_000,
  });

  const sellAmount = web3.utils.toWei("1", "ether");
  await testToken.methods.mint(buyOutAccount, sellAmount).send({ from: deployer });

  const config = {
    liveTrading: true,
    backendPort: 0,
    rpcHttpUrl: rpcUrl,
    chainId: 31337,
    chainName: "anvil",
    privateKeyIn: anvilKeys[0],
    privateKeyOut: anvilKeys[1],
    buyInAccount,
    buyOutAccount,
    gasLimit: localChainGasLimit,
    testTokenAmount: "0.01",
    ethAmount: "0.005",
    contracts: {
      factory: accounts[9],
      router: router.options.address,
      weth: weth.options.address,
      testToken: testToken.options.address,
    },
  };

  const server = await listen(createApp({ config }));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const buy = await postArbitrage(baseUrl, {
      Gasprice: "0.000000001",
      InOrOut: "true",
    });
    assert.strictEqual(buy.response.status, 200, JSON.stringify(buy.json));
    assert.strictEqual(buy.json.mode, "live");
    assert.strictEqual(buy.json.submitted, true);
    assert.match(buy.json.transactionHash, /^0x[a-fA-F0-9]{64}$/);
    assertNoSensitiveMaterial(buy.json);

    const rejectedSell = await postArbitrage(baseUrl, {
      Gasprice: "0.000000001",
      InOrOut: "false",
    });
    assert.strictEqual(rejectedSell.response.status, 500, JSON.stringify(rejectedSell.json));
    assert.match(rejectedSell.json.error, /revert|allowance|Transaction has been reverted/i);
    assertNoSensitiveMaterial(rejectedSell.json);

    await testToken.methods
      .approve(router.options.address, sellAmount)
      .send({ from: buyOutAccount });

    const sell = await postArbitrage(baseUrl, {
      Gasprice: "0.000000001",
      InOrOut: "false",
    });
    assert.strictEqual(sell.response.status, 200, JSON.stringify(sell.json));
    assert.strictEqual(sell.json.mode, "live");
    assert.strictEqual(sell.json.submitted, true);
    assert.match(sell.json.transactionHash, /^0x[a-fA-F0-9]{64}$/);
    assertNoSensitiveMaterial(sell.json);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
