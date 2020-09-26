import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { createHashHistory } from 'history';
import axios from 'axios';
import { Feedback } from '@icedesign/base';
import * as oexchain from 'oex-web3';

// 载入默认全局样式 normalize 、.clearfix 和一些 mixin 方法等
import '@icedesign/base/reset.scss';

import router from './router';
import configureStore from './configureStore';
import cookie from 'react-cookies';
import { setLang } from './utils/lang';
import * as constant from './utils/constant';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';

const defaultLang = cookie.load('defaultLang');
if (defaultLang != null) {
  setLang(defaultLang);
}

// Create redux store with history
const initialState = {};
const history = createHashHistory();
const store = configureStore(initialState, history);
const ICE_CONTAINER = document.getElementById('ice-container');
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = constant.testNetRPCHttpsAddr;

let nodeInfo = cookie.load('nodeInfo');
if (nodeInfo != null && nodeInfo !== '') {
  axios.defaults.baseURL = nodeInfo;
  oexchain.utils.setProvider(nodeInfo);
} else {
  nodeInfo = constant.mainNetRPCHttpsAddr;
  cookie.save('nodeInfo', nodeInfo, {path: '/', maxAge: 3600 * 24 * 360});
  oexchain.utils.setProvider(nodeInfo);
}

if (!window.localStorage) {
  Feedback.toast.warn(T('请升级浏览器，当前浏览器无法保存交易结果'));
}
if (!ICE_CONTAINER) {
  throw new Error('当前页面不存在 <div id="ice-container"></div> 节点.');
}

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <ConnectedRouter history={history}>{router()}</ConnectedRouter>
    </I18nextProvider>
  </Provider>,
  ICE_CONTAINER
);
