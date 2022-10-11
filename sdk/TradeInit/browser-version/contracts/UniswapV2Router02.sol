/**
 *Submitted for verification at Etherscan.io on 2020-06-05
 https:// etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#contracts
*/

pragma solidity =0.6.6;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);

    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);

    function allPairs(uint) external view returns (address pair);

    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;

    function setFeeToSetter(address) external;
}

interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function PERMIT_TYPEHASH() external pure returns (bytes32);

    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint);

    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);

    function price0CumulativeLast() external view returns (uint);

    function price1CumulativeLast() external view returns (uint);

    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);

    function burn(address to) external returns (uint amount0, uint amount1);

    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;

    function skim(address to) external;

    function sync() external;

    function initialize(address, address) external;
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);

    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
    external
    payable
    returns (uint[] memory amounts);

    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
    external
    returns (uint[] memory amounts);

    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    external
    returns (uint[] memory amounts);

    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
    external
    payable
    returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);

    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);

    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);

    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IWETH {
    function deposit() external payable;

    function transfer(address to, uint value) external returns (bool);

    function withdraw(uint) external;
}

contract UniswapV2Router02 is IUniswapV2Router02 {
    using SafeMath for uint;

    address public  immutable override factory;
    address public  immutable override WETH;
    // 交易时间是否过期，dapp中默认设置时20分钟内成交有效
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        _;
    }

    constructor(address _factory, address _WETH) public {
        factory = _factory;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH); //  only accept ETH via fallback from the WETH contract
    }

    //  **** ADD LIQUIDITY ****
    // 添加流动性内部方法，通过该方法计算出两个币的实际所需数量
    function _addLiquidity(
        address tokenA,// 代币地址A
        address tokenB,// 代币地址B
        uint amountADesired,// 代币A 期望添加量
        uint amountBDesired,// 代币B 期望添加量
        uint amountAMin,// 代币A 最小添加量(这两个min,收益添加的时候可以和Desired一样， 二次添加的时候，一般都是小于Desired，具体小多少，算法可以查看uniswap前端代码)
        uint amountBMin// 代币B 最小添加量
    ) internal virtual returns (uint amountA, uint amountB) {// 返回值是两个
        //  create the pair if it doesn't exist yet
        // 通过factory,查询pair,如果等于0地址，就表示还没有该交易对，调用创建方法
        if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
            IUniswapV2Factory(factory).createPair(tokenA, tokenB);// 创建交易对
        }
        // 可以先了解下UniswapV2Library 中相关方法的意思
        // 如果查询两个值都是0，首次添加，直接使用期望值
        (uint reserveA, uint reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);// 直接使用这两个值，比例就是相互的币价
        } else {
            // 如果两个储备量不为0，需要根据当前的价格/比例去新增流动性
            // 先通过quote计算如果输入A的数量，得出B的实际输入量
            uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
            // 如果B的实际输入量<=B的期望输入数量，
            if (amountBOptimal <= amountBDesired) {
                // 实际输入量需要大于等于参数中的最小数量
                require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);// 得到两个的实际添加量
            } else {
                // 如果上面计算的B的实际输入量大于期望输入量，就说明用户得B数量不够， 需要反过来，通过B计算A的数量， 看A的数量是否满足，
                // 通过B计算A的数量
                uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);// 
                assert(amountAOptimal <= amountADesired);// 需要计算得来的A量小于等于A的预期输入量
                require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');// 且实际输入量，需要大于等于最小数量
                (amountA, amountB) = (amountAOptimal, amountBDesired);// 得到两个的实际添加量
            }
        }
    }

    function addLiquidity(// 添加流动性，两个代币
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,// lp接收人，新版的uniswap前端好像不支持设置这个了
        uint deadline// 交易的成交时间，默认是当前时间+20分钟后的时间的秒值
    ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        // 调用内部方法_addLiquidity 获取到两个币实际所需要的数量
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);// 查找到pair地址
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);// 给pair转A数量
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);// 给pair转B数量
        liquidity = IUniswapV2Pair(pair).mint(to);// 调用pair的mint方法，会有添加的lp数量返回
    }

    function addLiquidityETH(// 添加流动性，其中一个币种是eth
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,// eth最小输入量；  对应的Desired在msg.value
        address to,
        uint deadline
    ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
        // 调用内部方法_addLiquidity 获取到两个币实际所需要的数量
        // eth使用 weth代币替代
        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,
            amountTokenDesired,
            msg.value,// ethDesired
            amountTokenMin,
            amountETHMin
        );
        address pair = UniswapV2Library.pairFor(factory, token, WETH);// 获取到pair地址
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);// 给pair转代币数量
        IWETH(WETH).deposit{value : amountETH}();// 调用weth的兑换方法，通过eth换weth
        assert(IWETH(WETH).transfer(pair, amountETH));// 给pair转weth数量
        liquidity = IUniswapV2Pair(pair).mint(to);// 调用pair的mint方法，会有添加的lp数量返回
        //  refund dust eth, if any
        // 如果传入的eth数量，大于实际所需的eth数量， 将剩余的eth返还给用户
        if (msg.value > amountETH) TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
    }

    //  **** REMOVE LIQUIDITY ****
    function removeLiquidity(// 移除流动性，该方法需要先将lp代币授权给路由合约，才能代扣lp
        address tokenA,
        address tokenB,
        uint liquidity,// 移除lp的数量，  转入lp得另外两个币
        uint amountAMin,// A的最小输出量
        uint amountBMin,// B的最小输出量
        address to,// 接收两个币的地址
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);// 获取pair地址
        IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity);// 将lp转到pair地址
        //  send liquidity to pair
        (uint amount0, uint amount1) = IUniswapV2Pair(pair).burn(to);// 调用pair的burn方法， 内部会将两个币的数量转给to,返回值就是两个代币的输出数量
        (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);// 通过排序确认两个amountA/B
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        // 校验A/B的输出量需要小于参数中要求的最小量，否则交易失败
        require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
    }

    function removeLiquidityETH(// 移除流动性（其中一个返还币是ETH），该方法需要先将lp代币授权给路由合约，才能代扣lp
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,// eth最小输出量
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
        // 调用上面的removeLiquidity方法，传入的是WETH
        (amountToken, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),// 注意！接收币的地址是路由
            deadline
        );
        // 将代币转给to
        TransferHelper.safeTransfer(token, to, amountToken);
        IWETH(WETH).withdraw(amountETH);// 将weth转换成eth
        TransferHelper.safeTransferETH(to, amountETH);// 将eth转给to
    }
    // WithPermit的方法 可以先了解下approveAndCall 链接https:// blog.csdn.net/weixin_34235105/article/details/88761932
    /*
    实际使用EIP-712
    链接 https:// soliditydeveloper.com/erc20-permit
        https:// learnblockchain.cn/article/1790
        https:// eips.ethereum.org/EIPS/eip-2612

    permit在前端的使用场景，就是移除流动性的时候， 有个授权实际没有发送交易，只是要求签名，签名会得到参数中的v/r/s
    在实际调用该移除的方法传进来， 内部验签，确认是该用户，就将移除的lp的数量，授权给路由，可以代扣lp

    */
    function removeLiquidityWithPermit(// 移除流动性，approve + transferFrom
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s// v,r,s 验签，通过就授权给路由
    ) external virtual override returns (uint amountA, uint amountB) {
        /*
           获取到pair,调用pair的permit(内部实际就是授权给路由),
        */
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        uint value = approveMax ? uint(- 1) : liquidity;
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        // 最终还是调用上面的removeLiquidity方法！
        (amountA, amountB) = removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
    }

    function removeLiquidityETHWithPermit(// WithPermit,移除时，其中一个返回eth
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountToken, uint amountETH) {
        /*
           获取到pair,调用pair的permit(内部实际就是授权给路由),
        */
        address pair = UniswapV2Library.pairFor(factory, token, WETH);
        uint value = approveMax ? uint(- 1) : liquidity;
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        // 最终还是调用上面的removeLiquidityETH方法！
        (amountToken, amountETH) = removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
    }

    //  **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
    // 移除流动性(需要先授权)，支持 转账会扣手续费的代币s
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountETH) {
        // 实际还是调用removeLiquidity，传入的是weth,
        (, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,// 实际就是这两个值，填很小，就可以成功
            amountETHMin,// 实际就是这两个值，填很小，就可以成功
            address(this),
            deadline
        );
        // removeLiquidity返回的第一个参数是代币数量， 由于代币转账会扣手续费，所以，实际到达路由的代币数量并没有这么多！直接取余额转出
        TransferHelper.safeTransfer(token, to, IERC20(token).balanceOf(address(this)));// 如果转账扣两次手续费..这里相当于扣两次，pair->router, router->to
        // 将weth转换eth,再转给to,
        IWETH(WETH).withdraw(amountETH);
        TransferHelper.safeTransferETH(to, amountETH);
    }
    // 同上， 先验签授权，再调用上面的removeLiquidityETHSupportingFeeOnTransferTokens
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external virtual override returns (uint amountETH) {
        address pair = UniswapV2Library.pairFor(factory, token, WETH);
        uint value = approveMax ? uint(- 1) : liquidity;
        IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        amountETH = removeLiquidityETHSupportingFeeOnTransferTokens(
            token, liquidity, amountTokenMin, amountETHMin, to, deadline
        );
    }

    //  **** SWAP ****
    //  requires the initial amount to have already been sent to the first pair
    // 交易方法
    // 需要先将amounts[0]的金额已经转到第一个pair地址(即path[0]+path[1]组成的pair)！
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {// 遍历整个path
            // 得到进/出token地址
            (address input, address output) = (path[i], path[i + 1]);
            // 排序得到token0
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            // 获取到output币种的输出量！
            uint amountOut = amounts[i + 1];
            // 根据token0，input得到amount0需要out,还是amount1是out,; 注意其中之一一定是0，即入token的金额，不需要pair转出
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            // 如果i小于path长度-2，就表示还需要继续交易，所以to是下一个交易对，如果一样就表示path结束了，to就是参数中的_to
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            // 调用pair的 swap方法，其中一个out是0，另一个是要转出的金额， 内部是转出输出量，并校验交易是否正确，更新储备量
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
    // 输入精确的token,换取另一个token(输出量不确定)
    function swapExactTokensForTokens(
        uint amountIn,// 输入金额
        uint amountOutMin,// 最小输出金额
        address[] calldata path,// 交易路径
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        // 通过getAmountsOut获取整个path完整路径的输入/出量，下标0是用户实际输入额，最后一个位置是实际输出额
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        // 需要满足计算得来最终输出量大于等于最小输出金额
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // 先将amounts[0]入金额转入第一个pair!!
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 调用内部_swap方法
        _swap(amounts, path, to);
    }
    // 输入不确定数量A，换取精确输出的B (例：精确输出1个token,正常100u可以换1个token, 由于发交易后其他人先交易过，导致价格变了，可能95或者105可以买1个token,95肯定交易通过， 如果amountInMax是102，该交易就无法成交，回退)
    function swapTokensForExactTokens(
        uint amountOut,// 精确的输出额
        uint amountInMax,// 最大允许的输入量
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        // 根据getAmountsIn 计算出输入输出量
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        // 需要第一个输入量小于等于计算来的实际输入量
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        // 将计算得来的金额amounts[0]转入第一个pair
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 调用内部_swap方法
        _swap(amounts, path, to);
    }
    // 输入精确的eth换取不定量的token,对应swapExactTokensForTokens，不过输入的是eth,换成weth就一样了
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
    external
    virtual
    override
    payable
    ensure(deadline)
    returns (uint[] memory amounts)
    {
        // 要求path[0]是weth地址
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 通过getAmountsOut，输入额是msg.value
        amounts = UniswapV2Library.getAmountsOut(factory, msg.value, path);
        // 需要满足计算得来最终输出量大于等于最小输出金额
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // pair中只会存weth,没有eth
        IWETH(WETH).deposit{value : amounts[0]}();// 兑换成weth
        // 将weth转入到第一个pair
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        // 调用内部_swap方法
        _swap(amounts, path, to);
    }
    // 输入不定量的A，换取精确的输出ETH，对应swapTokensForExactTokens，只是内部将weth转成eth再给用户
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
    external
    virtual
    override
    ensure(deadline)
    returns (uint[] memory amounts)
    {
        // path最后一个输出地址是weth
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        // 需要第一个输入量小于等于计算来的实际输入量
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        // 将计算得来的金额amounts[0]转入第一个pair
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 调用内部_swap方法，注意第三个参数改成了当前路由地址！
        _swap(amounts, path, address(this));
        // 交换成功后，将weth转换成eth,再转给to
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    // 输入精确的A换取不定量的eth swapExactTokensForTokens 只是输出是eth
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    external
    virtual
    override
    ensure(deadline)
    returns (uint[] memory amounts)
    {
        // path最后一个输出地址是weth
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        // 注意输出要大于最小输出
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        // 
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        // 调用内部_swap方法，注意第三个参数改成了当前路由地址！
        _swap(amounts, path, address(this));
        // 交换成功后，将weth转换成eth,再转给to
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    // 输入不定量的ETH换取精确的token输出，对应swapTokensForExactTokens，只是输入的是eth
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
    external
    virtual
    override
    payable
    ensure(deadline)
    returns (uint[] memory amounts)
    {
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        // 注意，实际输入需要小于msg.value,即eth输入量
        require(amounts[0] <= msg.value, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        IWETH(WETH).deposit{value : amounts[0]}();
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        //  refund dust eth, if any
        // 如果实际不需要那么多eth,将剩余返还用户
        if (msg.value > amounts[0]) TransferHelper.safeTransferETH(msg.sender, msg.value - amounts[0]);
    }

    //  **** SWAP (supporting fee-on-transfer tokens) ****
    //  requires the initial amount to have already been sent to the first pair
    // 交易方法，支持转账扣手续费的代币
    // 需要先将amounts[0]的金额已经转到第一个pair地址(即path[0]+path[1]组成的pair)！
    function _swapSupportingFeeOnTransferTokens(address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            // 得到进/出token地址
            (address input, address output) = (path[i], path[i + 1]);
            // 排序得到token0
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            // 获取pair
            IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output));
            uint amountInput;// 输入金额
            uint amountOutput;// 输入金额
            {//  scope to avoid stack too deep errors 避免堆栈太深错误，用{}括部分临时变量
                // 或许两个币的储备量
                (uint reserve0, uint reserve1,) = pair.getReserves();
                // 根据input,token0 得出 inToken的储备量,outToken的储备量
                (uint reserveInput, uint reserveOutput) = input == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
                // 查询交易对的inToken余额，减掉最后记录的储备量，就是交易对实际获取到的inToken数量(TODO 和_swap的区别就在这里，不是使用计算来的amounts[0]作为输入，而是通过查询pair余额再减去最后更新的储备量得到实际pair到账额！)
                amountInput = IERC20(input).balanceOf(address(pair)).sub(reserveInput);
                // 通过实际得到的input量，计算实际会输出的output数量
                amountOutput = UniswapV2Library.getAmountOut(amountInput, reserveInput, reserveOutput);
            }
            // 根据token0，input得到amount0需要out,还是amount1是out,; 注意其中之一一定是0，即入token的金额，不需要pair转出
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
            // 如果i小于path长度-2，就表示还需要继续交易，所以to是下一个交易对，如果一样就表示path结束了，to就是参数中的_to
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            // 调用pair的 swap方法，其中一个out是0，另一个是要转出的金额， 内部是转出输出量，并校验交易是否正确，更新储备量
            pair.swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }


    /**
        TODO 带supportingFeeOnTransfer方法都是通过余额的方式计算输入/出
        下面的三个方法， 都是swapExactXXXForXX, 而没有swapXXXForExactXX
        如果是自己开发合约调用，可以随意选用哪个swap

        在uniswap中，如果滑点改成49，会自动切换带supportingFeeOnTransfer的方法
        还有些其他情况也会自动切，这个会前端的可以看看代码，什么情况下，前端会选择使用带supportingFeeOnTransfer的方法去交易
    */

    // 输入精确的token,换取另一个token，支持转账时扣手续费的token
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,// 输入金额
        uint amountOutMin,// 最小输出金额，该金额只要够小，交易就一定可以成功
        address[] calldata path,// 交换路径
        address to,
        uint deadline
    ) external virtual override ensure(deadline) {
        // 将输入金额转到第一个pair地址
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn
        );
        // 查询to用户当前最终输出token的余额
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        // 调用内部交易方法
        _swapSupportingFeeOnTransferTokens(path, to);
        // 通过查询余额的方式，校验交易前后的余额差，大于等于最小输出！
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT'
        );
    }
    // 输入精确eth换取另一个token
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
    external
    virtual
    override
    payable
    ensure(deadline)
    {
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        // 将eth转成weth,并转给第一个pair地址
        uint amountIn = msg.value;
        IWETH(WETH).deposit{value : amountIn}();
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn));
        // 跟上面方法一样， 通过查询余额的方式校验
        uint balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        _swapSupportingFeeOnTransferTokens(path, to);
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >= amountOutMin,
            'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT'
        );
    }
    // 输入精确token换取输出eth,
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
    external
    virtual
    override
    ensure(deadline)
    {
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amountIn
        );
        _swapSupportingFeeOnTransferTokens(path, address(this));
        uint amountOut = IERC20(WETH).balanceOf(address(this));
        require(amountOut >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).withdraw(amountOut);
        TransferHelper.safeTransferETH(to, amountOut);
    }

    //  **** LIBRARY FUNCTIONS ****
    // 以下方法，都是library里面的方法，代调用UniswapV2Library
    function quote(uint amountA, uint reserveA, uint reserveB) public pure virtual override returns (uint amountB) {
        return UniswapV2Library.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
    public
    pure
    virtual
    override
    returns (uint amountOut)
    {
        return UniswapV2Library.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
    public
    pure
    virtual
    override
    returns (uint amountIn)
    {
        return UniswapV2Library.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint amountIn, address[] memory path)
    public
    view
    virtual
    override
    returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint amountOut, address[] memory path)
    public
    view
    virtual
    override
    returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsIn(factory, amountOut, path);
    }
}

//  a library for performing overflow-safe math, courtesy of DappHub (https:// github.com/dapphub/ds-math)

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}

library UniswapV2Library {
    using SafeMath for uint;

    //  returns sorted token addresses, used to handle return values from pairs sorted in this order
    // 两个token排序，address实际也是一个uint160，可以相关转换，所以可以比大小，排序,小是0，确认在交易对中的token0,token1
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
    }

    //  calculates the CREATE2 address for a pair without making any external calls
    //  通过create2的方式计算交易对的地址，注意initCode,每次部署的时候，可能都不一样，需要生成
    // 用法套格式即可，对应factory中的createPair， 要深入的，可以具体去了解下create2
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' //  init code hash
            ))));
    }

    //  fetches and sorts the reserves for a pair
    // 获取两个币的储备量， 通过pair查询， 内部返回值会根据入参的币种进行调整位置返回
    function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (address token0,) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1,) = IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    //  given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    //  添加流动性的时候，通过该方法查询输入A的数量，需要多少个B
    function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        // 判断数量， 首次添加流动性，随意定价，不需要查询该方法
        require(amountA > 0, 'UniswapV2Library: INSUFFICIENT_AMOUNT');
        require(reserveA > 0 && reserveB > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        // B数量 = 预期输入A的数量 * B的储备量 / A的储备量；  // 实际公式就是 A/B = reserveA/reserveB, 两个币的数量比例一致
        amountB = amountA.mul(reserveB) / reserveA;
    }

    //  given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    // 通过精确输入金额,输入币的储备量，输出币的储备量，计算输出币的最大输出量
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        // 具体看下面的公式推导，要看该公式，首先要理解uniswap AMM, X * Y= K
        uint amountInWithFee = amountIn.mul(997);// 手续费都是扣输入额的千三，所以需要去掉千三后才是实际用于交易的金额
        uint numerator = amountInWithFee.mul(reserveOut);// 套下面公式理解吧！！
        uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
        /*
        *   查看下面的由in计算out公式 out = in * f * rOut / rIn + in *f
        *   手续费是千三， 扣除手续费后去交易的金额是输入额的0.997, 公式中的f是0.997 内部计算用的uint,所以分子分母都 * 1000
        *   最终的公式是    out = in * 997 * rOut / ((rIn + in *f) * 1000)
        *                  out = in * 997 * rOut / (rIn*1000 + in * 997)
        */

    }
    /**
    *
    *
    * 推导公式
    * in 输入金额， out 输出金额
    * rIn tokenIn的流动性， rOut，tokenOut的流动性
    * fee 手续费，注：当前带入0.997   也就是997/1000
    *
    * 两个计算公式实际是一样的， 只是一个求in,一个求out
    * (rIn + in * f) * (rOut - out) = rIn * rOut
    *
    *
    * 由out计算in  getAmountIn
    * (rIn + in * f) * (rOut - out) = rIn * rOut
    * rIn * rOut + in * f * rOut  - rIn * out - in * f * out = rIn * rOut
    * rIn * out = in * f * rOut - in * f * out
    * in = rIn * out / (f * (rOut - out)) + 1  (尾部的 +1应该是避免精度计算，最后一位小了，会成交不了)
    *
    *
    * 由in计算out  getAmountOut
    * (rIn + in * f) * (rOut - out) = rIn * rOut
    * rIn * rOut + in * f * rOut  - rIn * out - in * f * out = rIn * rOut
    * in * f * rOut = rIn * out + in * f * out
    * out = in * f * rOut / rIn + in *f
    *
    */
    //  given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    // 通过精确的输出量，输入币的储备量，输出币的储备量，计算所需的输入币的数量
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn) {
        require(amountOut > 0, 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        // 先看上面的由out计算in 公式推导
        uint numerator = reserveIn.mul(amountOut).mul(1000);// 对应公式中的rIn * out, 乘以1000是0.997需要换算成整数
        uint denominator = reserveOut.sub(amountOut).mul(997);// 对应上面的分母 (f * (rOut - out)),乘以1000后就是 997 * (rOut - out)
        amountIn = (numerator / denominator).add(1);
    }

    //  performs chained getAmountOut calculations on any number of pairs
    //  根据path,计算出每个交易对的输入/输出量(如果path>2,前一个交易对的输出量，就是下一个交易对交易的输入量)
    // 内部实际还是调用的上面getAmountOut方法， 返回值amounts长度和path的长度一致，
    function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
        amounts = new uint[](path.length);// 创建数组
        amounts[0] = amountIn;// 0位置是输入量
        for (uint i; i < path.length - 1; i++) {// 每两个token组成一个交易对，计算out
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    //  performs chained getAmountIn calculations on any number of pairs
    //  根据path,计算出每个交易对的输入/输出量(如果path>2,前一个交易对的输出量，就是下一个交易对交易的输入量)
    // 内部实际还是调用的上面getAmountIn方法， 返回值amounts长度和path的长度一致，
    function getAmountsIn(address factory, uint amountOut, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
        amounts = new uint[](path.length);
        amounts[amounts.length - 1] = amountOut;// 最后一个是入参out,
        for (uint i = path.length - 1; i > 0; i--) {// 倒序遍历计算
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i - 1], path[i]);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }
}

//  helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
// 转账工具类
library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        //  bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }
    // 注：data.length == 0,主要针对的是usdt, 同时！该方法在波场不适用！！ 波场的的U 有返回data,但是一直是false!!
    function safeTransfer(address token, address to, uint value) internal {
        //  bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        //  bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value : value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        
    }
}
