import { T } from './utils/lang'
// 菜单配置
// headerMenuConfig：头部导航配置
// asideMenuConfig：侧边导航配置

const headerMenuConfig = [
  {
    name: T('链上数据'),
    path: '/dashboard',
    icon: 'search',
  },
  {
    name: T('区块查询'),
    path: '/Block',
    icon: 'search',
  },
  {
    name: T('交易查询'),
    path: '/Transaction',
    icon: 'search',
  },
  // {
  //   name: T('资产'),
  //   path: '/assetOperator',
  //   icon: 'ul-list'
  // },
  // {
  //   name: T('合约开发工具'),
  //   path: '/contractDev',
  //   icon: 'code',
  // },
  {
    name: T('节点矿工'),
    path: '/producerList',
    icon: 'repair',
  },
  // {
  //   name: T('原始交易构造'),
  //   path: '/rawTxConstructor',
  // },
  // {
  //   name: T('自动化测试'),
  //   path: '/autoTest',
  // },
  // {
  //   name: T('应用体验'),
  //   path: '/dapp',
  //   icon: 'code',
  // },
  // {
  //   name: T('学习资料'),
  //   path: '/study',
  //   icon: 'code',
  // },
];

const asideMenuConfig = [ 
];

export { headerMenuConfig, asideMenuConfig };
