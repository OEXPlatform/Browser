// 以下文件格式为描述路由的协议格式
// 你可以调整 routerConfig 里的内容
// 变量名 routerConfig 为 iceworks 检测关键字，请不要修改名称

import { getRouterData } from './utils/utils';
import { asideMenuConfig } from './menuConfig';

import BasicLayout from './layouts/BasicLayout';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Portlets from './pages/Portlets';
import Terms from './pages/Terms';
import Result from './pages/Result';
import Fail from './pages/Fail';
import ServerError from './pages/ServerError';
import Forbidden from './pages/Forbidden';
import Empty from './pages/Empty';
import List from './pages/List';
import CardList from './pages/CardList';
import BasicTable from './pages/BasicTable';
import TableDisplay from './pages/TableDisplay';

import Performance from './pages/Performance';
import AccountManager from './pages/AccountManager';
import KeystoreManager from './pages/KeystoreManager';
import ContractManager from './pages/ContractManager';
import ContractDev from './pages/ContractDev';

import Configure from './pages/Configure';
import NotFound from './pages/NotFound';

import Block from './pages/Block';
import BlockList from './pages/BlockList';
import SearchAsset from './pages/SearchAsset';
import OperateAsset from './pages/OperateAsset';
import Transaction from './pages/Transaction';
import ProducerList from './pages/ProducerList';
import RawTxConstructor from './pages/RawTxConstructor';
import AutoTest from './pages/AutoTest';
import Study from './pages/Study';
import Dapp from './pages/Dapp';
import Download from './pages/Download';


const routerConfig = [
  {
    path: '/exception/403',
    component: Forbidden,
    layout: BasicLayout,
  },
  {
    path: '/download',
    component: Download,
    layout: BasicLayout,
  },
  {
    path: '/portlets/base',
    component: Portlets,
    layout: BasicLayout,
  },
  {
    path: '/table/table-display',
    component: TableDisplay,
    layout: BasicLayout,
  },
  {
    path: '/chart/chart-list',
    component: Charts,
    layout: BasicLayout,
  },
  {
    path: '/list/article-list',
    component: List,
    layout: BasicLayout,
  },
  {
    path: '/list/card-list',
    component: CardList,
    layout: BasicLayout,
  },
  {
    path: '/result/success',
    component: Result,
    layout: BasicLayout,
  },
  {
    path: '/result/fail',
    component: Fail,
    layout: BasicLayout,
  },
  {
    path: '/dashboard',
    component: Dashboard,
    layout: BasicLayout,
  },
  {
    path: '/table/basic-table',
    component: BasicTable,
    layout: BasicLayout,
  },
  {
    path: '/exception/500',
    component: ServerError,
    layout: BasicLayout,
  },
  {
    path: '/portlets/terms',
    component: Terms,
    layout: BasicLayout,
  },
  {
    path: '/exception/204',
    component: Empty,
    layout: BasicLayout,
  },
  {
    path: '/exception/404',
    component: NotFound,
    layout: BasicLayout,
  },
  {
    path: '/page17',
    layout: BasicLayout,
    component: Performance,
  },
  {
    path: '/Configure',
    layout: BasicLayout,
    component: Configure,
  },
  {
    path: '/AccountManager',
    layout: BasicLayout,
    component: AccountManager,
  },
  {
    path: '/KeystoreManager',
    layout: BasicLayout,
    component: KeystoreManager,
  },
  {
    path: '/Block',
    layout: BasicLayout,
    component: Block,
  },
  {
    path: '/BlockList',
    layout: BasicLayout,
    component: BlockList,
  },
  {
    path: '/Transaction',
    layout: BasicLayout,
    component: Block,
  },
  {
    path: '/assetSearch',
    layout: BasicLayout,
    component: SearchAsset,
  },
  {
    path: '/assetOperator',
    layout: BasicLayout,
    component: OperateAsset,
  },
  {
    path: '/contractManager',
    layout: BasicLayout,
    component: ContractManager,
  },
  {
    path: '/contractDev',
    layout: BasicLayout,
    component: ContractDev,
  },
  {
    path: '/rawTxConstructor',
    layout: BasicLayout,
    component: RawTxConstructor,
  },
  {
    path: '/autoTest',
    layout: BasicLayout,
    component: AutoTest,
  },
  {
    path: '/producerList',
    layout: BasicLayout,
    component: ProducerList,
  },
  {
    path: '/study',
    layout: BasicLayout,
    component: Study,
  },
  {
    path: '/dapp',
    layout: BasicLayout,
    component: Dapp,
  },
];

const routerData = getRouterData(routerConfig, asideMenuConfig);

export { routerData };
