import { T } from './utils/lang'
import {useTranslation} from 'react-i18next';
// 菜单配置
// headerMenuConfig：头部导航配置
// asideMenuConfig：侧边导航配置

const headerMenuConfig = [
  {
    name: 'dashboard',
    path: '/dashboard',
    icon: 'search',
  },
  {
    name: 'blockInfo',
    path: '/Block',
    icon: 'search',
  },
  {
    name: 'txSearch',
    path: '/Transaction',
    icon: 'search',
  },
  {
    name: 'accountSearch',
    path: '/AccountSearch',
    icon: 'search',
  },
  // {
  //   name: '资产',
  //   path: '/assetOperator',
  //   icon: 'ul-list'
  // },
  // {
  //   name: '合约开发工具',
  //   path: '/contractDev',
  //   icon: 'code',
  // },
  {
    name: 'producers',
    path: '/producerList',
    icon: 'repair',
  },
  // {
  //   name: '原始交易构造',
  //   path: '/rawTxConstructor',
  // },
  // {
  //   name: '自动化测试',
  //   path: '/autoTest',
  // },
  // {
  //   name: '应用体验',
  //   path: '/dapp',
  //   icon: 'code',
  // },
  // {
  //   name: '学习资料',
  //   path: '/study',
  //   icon: 'code',
  // },
];

const asideMenuConfig = [ 
];

export { headerMenuConfig, asideMenuConfig };
