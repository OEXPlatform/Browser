/**
 * 定义应用路由
 */
import { Switch, Route } from 'react-router-dom';
import React,{Suspense} from 'react';

import BasicLayout from './layouts/BasicLayout';

// 按照 Layout 归类分组可以按照如下方式组织路由
const router = () => {
  return (
    <Switch>
      <Suspense fallback='loading'>
       <Route path="/" component={BasicLayout} />
      </Suspense>
    </Switch>
  );
};

export default router;
