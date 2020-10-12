// 以下文件格式为描述路由的协议格式
// 你可以调整 routerConfig 里的内容
// 变量名 routerConfig 为 iceworks 检测关键字，请不要修改名称

import { getRouterData } from './utils/utils';
import { asideMenuConfig } from './menuConfig';

import BasicLayout from './layouts/BasicLayout';
import Dashboard from './pages/Dashboard';

import Block from './pages/Block';
import BlockList from './pages/BlockList';
import AccountSearch from './pages/AccountSearch';
import AssetSearch from './pages/AssetSearch';
import ProducerList from './pages/ProducerList';
import Download from './pages/Download';


const routerConfig = [
  {
    path: '/download',
    component: Download,
    layout: BasicLayout,
  },
  {
    path: '/dashboard',
    component: Dashboard,
    layout: BasicLayout,
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
    path: '/AccountSearch',
    layout: BasicLayout,
    component: AccountSearch,
  },
  {
    path: '/AssetSearch',
    layout: BasicLayout,
    component: AssetSearch,
  },
  {
    path: '/producerList',
    layout: BasicLayout,
    component: ProducerList,
  },
];

const routerData = getRouterData(routerConfig, asideMenuConfig);

export { routerData };
