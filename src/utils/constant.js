export const CALL_CONTRACT = 0;
export const CREATE_CONTRACT = 1;
export const CALL_CONTRACT_MULTIASSET = 0x02;

export const CREATE_NEW_ACCOUNT = 256;
export const UPDATE_ACCOUNT = 257;
export const DELETE_ACCOUNT = 258;
export const UPDATE_ACCOUNT_AUTHOR = 259;

export const INCREASE_ASSET = 512;
export const ISSUE_ASSET = 513;
export const DESTORY_ASSET = 514;
export const SET_ASSET_OWNER = 515;
export const SET_ASSET_FOUNDER = 516;
export const TRANSFER = 517;
export const UPDATE_ASSET_CONTRACT = 518;

export const REG_CANDIDATE = 768;
export const UPDATE_CANDIDATE = 769;
export const UNREG_CANDIDATE = 770;
export const REFUND_DEPOSIT = 771;
export const VOTE_CANDIDATE = 772;
export const UPDATE_CANDIDATE_PUBLIC = 773;
export const WITHDRAW_CANDIDATE = 774;

export const ADD_CANDIDATE_BL = 1024;
export const EXIT_TAKEOVER = 1025;

export const WITHDRAW_TX_FEE = 1280;

export const FT_ASSET_ID = 1;
export const FT_DECIMALS = 18;

export const AccountFile = 'accountInfo';
export const KeyStoreFile = 'keystoreInfo';
export const TxInfoFile = 'txInfo';
export const ContractABIFile = 'contractABI';
export const ContractNameFile = 'contractName';
export const TestSceneFile = 'testScene';
export const CurTestSceneCases = 'curTestSceneCases';

export const PublicKeyPrefix = '0x04';
export const ChainIdPrefix = 'ChainId-';

/* 交易状态：
* 1: 发送失败：无需更新
* 2：发送成功，但尚未执行：需更新
* 3：发送成功，执行成功：需检查是否被回滚
* 4：发送成功，执行失败：需检查是否被回滚
* 5：内部交易成功：需检查是否被回滚
* 6：内部交易失败：需检查是否被回滚
*/
export const TxStatus = { SendError:1, NotExecute:2, ExecuteSuccess:3, ExecuteFail:4, InnerSuccess:5, InnerFail:6 };

/* 区块状态：
    * 1: 可逆：   1   //初始默认的状态值
    * 2：不可逆   0
    * 3：被回滚  -1
*/
export const BlockStatus = { Rollbacked: -1, Irreversible: 0, Reversible: 1, Unknown: 2 };

export const SysTokenId = 0;
export const SysTokenDecimal = 18;

export const mainNetRPCHttpsAddr = 'https://mainnet.oexchain.com'; 
export const testNetRPCHttpsAddr = 'https://testnet.oexchain.com';
export const LocalRPCAddr = 'http://127.0.0.1:8545';

// 创建账户的代理服务器
export const proxySrvAddr = {1: 'http://oexchain.com:9000', 100: 'http://testnet.oexchain.com:9001'};

// 账户创建代理服务器会连接此RPC接口注册账户
export const chainId2RPC = {1: {rpcHost: 'mainnet.oexchain.com/', rpcPort: 8080}, 100: {rpcHost: 'testnet.oexchain.com', rpcPort: 8081}};

export const ShareCoding = {'ABI' : '[{"constant":false,"inputs":[{"name":"tokenIds","type":"uint256[]"}],"name":"removeAcceptToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"disableShare","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenIds","type":"uint256[]"}],"name":"addAcceptToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_toCoder","type":"address"}],"name":"giveReward","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"sharedAccounts","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"rewardMap","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"acceptTokenMap","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"enableShare","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"sharedAccountMap","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"rewards","outputs":[{"name":"from","type":"address"},{"name":"toCoder","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"amount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]'};
export const URC20ABI = [
  {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
          {
              "name": "",
              "type": "string"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_spender",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "approve",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
          {
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_from",
              "type": "address"
          },
          {
              "name": "_to",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "transferFrom",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
          {
              "name": "",
              "type": "uint8"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "name": "balance",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
          {
              "name": "",
              "type": "string"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_to",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "transfer",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          },
          {
              "name": "_spender",
              "type": "address"
          }
      ],
      "name": "allowance",
      "outputs": [
          {
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "name": "owner",
              "type": "address"
          },
          {
              "indexed": true,
              "name": "spender",
              "type": "address"
          },
          {
              "indexed": false,
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Approval",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "name": "from",
              "type": "address"
          },
          {
              "indexed": true,
              "name": "to",
              "type": "address"
          },
          {
              "indexed": false,
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Transfer",
      "type": "event"
  }
];