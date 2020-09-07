/* eslint-disable prefer-template */
/* eslint jsx-a11y/no-noninteractive-element-interactions:0 */
import React, { PureComponent } from 'react';
import { Icon, Input, Select, Dialog } from '@icedesign/base';
import Layout from '@icedesign/layout';
import StyledMenu, {
  Item as MenuItem,
  SubMenu
} from '@icedesign/styled-menu';

import { Button, Balloon } from '@alifd/next';
import cookie from 'react-cookies';
import axios from 'axios';
import { createHashHistory } from 'history';
import cx from 'classnames';
import { Link, NavLink } from 'react-router-dom';
import * as oexchain from 'oex-web3';
import { headerMenuConfig } from '../../menuConfig';
import Logo from '../Logo';
import * as utils from '../../utils/utils';
import * as constant from '../../utils/constant';
import { T, setLang } from '../../utils/lang';
import styles from './scss/base.scss';
import tabIcon from './tabIcon.png';

export const history = createHashHistory();
const keyMap = {'dashboard': '0', 'Block': '1', 'Transaction': '2', 'assetOperator': '3', 'contractDev': '4', 'producerList': '5'};

export default class Header extends PureComponent {
  constructor(props) {
    super(props);
    const nodeInfoCookie = cookie.load('nodeInfo');
    const defaultLang = cookie.load('defaultLang');

    let nodeInfo = nodeInfoCookie;
    if (utils.isEmptyObj(nodeInfo)) {
      nodeInfo = constant.mainNetRPCHttpsAddr;
    }
    this.state = {
      current: keyMap[props.location.pathname.substr(1)],
      menuColor: '#000000',
      nodeConfigVisible: false,
      nodeInfo,
      chainId: 0,
      customNodeDisabled: true,
      languages: [{value: 'ch', label:'中文'}, {value: 'en', label:'English'}],
      curLang: (defaultLang == null || defaultLang == 'ch') ? 'English' : '中文',
      defaultLang,
      nodes: [{value: constant.mainNetRPCHttpsAddr, label:T('主网：') + constant.mainNetRPCHttpsAddr}, 
              {value: constant.testNetRPCHttpsAddr, label:T('测试网：') + constant.testNetRPCHttpsAddr}, 
              {value: constant.LocalRPCAddr, label:T('本地节点：') + constant.LocalRPCAddr}, 
              {value: 'others', label: T('自定义')}],
    };
    setLang(this.state.defaultLang);
  }
  componentDidMount = () => {
    oexchain.oex.getChainConfig().then(chainConfig => {
      this.setState({chainId: chainConfig.chainId});
    })
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({current: keyMap[nextProps.location.pathname.substr(1)]});
  }

  openSetDialog = () => {
    this.setState({ nodeConfigVisible: true });
  }
  handleNodeInfoChange = (v) => {
    this.state.nodeInfo = v;
  }
  onChangeLanguage = () => {
    let languageType = 'ch';
    if (this.state.curLang == 'English') {
      languageType = 'en';
    }
    cookie.save('defaultLang', languageType, {path: '/', maxAge: 3600 * 24 * 360});
    setLang(languageType);
    history.go(0);
//    history.push('/');
  }
  onChangeNode = (type, value) => {
    cookie.save('defaultNode', value, {path: '/', maxAge: 3600 * 24 * 360});
    this.setState({customNodeDisabled: value != 'others', nodeInfo: value});
  }
  onConfigNodeOK = () => {
    const nodeInfo = (this.state.nodeInfo.indexOf('http://') == 0 || this.state.nodeInfo.indexOf('https://') == 0) ? this.state.nodeInfo : 'http://' + this.state.nodeInfo;
    cookie.save('nodeInfo', nodeInfo, {path: '/', maxAge: 3600 * 24 * 360});
    axios.defaults.baseURL = nodeInfo;
    this.setState({ nodeConfigVisible: false, nodeInfo });
    oexchain.utils.setProvider(nodeInfo);
    this.state.chainId = oexchain.oex.getChainId();
    //history.push('/');
    location.reload(true);
  }

  handleClick = e => {
    this.setState({
      current: e.key,
      menuColor: '#23c9a7'
    });
  };

  manageAccount = () => {
    this.setState({
      current: null
    });
    history.push('/AccountManager');
  }

  downloadAPP = () => {
    this.setState({
      current: null
    });
    history.push('/downloadApp');
  }

  render() {
    const defaultTrigger = <Button text type="normal" style={{color: '#808080'}} onClick={this.openSetDialog.bind(this)}><Icon type="set" />{T('设置接入节点')}</Button>;
    const { isMobile, theme, width, className, style, location } = this.props;  
    const { pathname } = location;

    return (
      <Layout.Header
        theme={theme}
        className={cx('ice-design-layout-header')}
        //style={{ ...style, width }}
      >
      <Logo />  
        <div
          className="ice-design-layout-header-menu"
          style={{ display: 'flex' }}
        >   
        {
          headerMenuConfig && headerMenuConfig.length > 0 ? (
            <StyledMenu 
              theme='light'
              onClick={this.handleClick} 
              selectedKeys={[this.state.current]} 
              style={{fontSize: '12px'}}
              mode="horizontal"
            >
            {headerMenuConfig.map((nav, idx) => {
                let subMenu = null;
                const linkProps = {};
                if (nav.children) {
                  subMenu = {items: []};
                  subMenu.label = T(nav.name);
                  nav.children.map(item => {
                    if (item.newWindow) {
                      subMenu.items.push({value: item.name, href: item.path, target: '_blank'});
                    } else if (item.external) {
                      subMenu.items.push({value: item.name, href: item.path});
                    } else {
                      subMenu.items.push({value: item.name, to: item.path});
                    }
                  });
                } else if (nav.newWindow) {
                  linkProps.href = nav.path;
                  linkProps.target = '_blank';
                } else if (nav.external) {
                  linkProps.href = nav.path;
                } else {
                  linkProps.to = nav.path;
                }
                if (subMenu !== null) {
                  return (<SubMenu title={<span>{subMenu.label}</span>}  key={idx}>                                                  
                            {subMenu.items.map((item, i) => 
                              <MenuItem  key={idx + '-' + i}>
                                {item.to ? (
                                  <Link to={item.to}>
                                    {item.value}
                                  </Link>
                                ) : (
                                  <a {...item}>
                                    {item.value}
                                  </a>
                                )}
                              </MenuItem>)}
                          </SubMenu>);
                }
                return (
                  <MenuItem key={idx} style={{display: 'flex', justifyContent: 'center'}}>
                    {linkProps.to ? (
                      <NavLink {...linkProps} className='navlinks' activeClassName='select'>
                        {!isMobile ? T(nav.name) : null}
                      </NavLink>
                    ) : (
                      <a {...linkProps}>
                        {!isMobile ? T(nav.name) : null}
                      </a>
                    )}
                    <img src={tabIcon} style={{position:'absolute', bottom: '-16px', width:'15px', display: pathname===linkProps.to ? 'block' : 'none'}} />
                  </MenuItem>
                );
              })}
            </StyledMenu>
          ) : null
        }     
          
        </div>
        <div
          className="ice-design-layout-header-menu"
          style={{ display: 'flex' }}
        >
          <Balloon trigger={defaultTrigger} closable={false}>
            {T('当前连接的节点')}:{this.state.nodeInfo}, ChainId:{this.state.chainId}
          </Balloon>
          &nbsp;&nbsp;
          <Button text type="normal" style={{color: '#808080', marginLeft: '30px'}} onClick={this.downloadAPP.bind(this)}><Icon type="account" />{T('钱包下载')}</Button>
          {/* <Button text type="normal" style={{color: '#808080', marginLeft: '30px'}} onClick={this.manageAccount.bind(this)}><Icon type="account" />{T('账号管理')}</Button> */}
          &nbsp;&nbsp;
          <Button text type="normal" style={{color: '#808080', marginLeft: '30px'}} onClick={this.onChangeLanguage.bind(this)}>{this.state.curLang}</Button>
          {/* &nbsp;&nbsp;
          <Select language={T('zh-cn')}
            style={{ width: 100 }}
            placeholder={T("语言")}
            onChange={this.onChangeLanguage.bind(this)}
            dataSource={this.state.languages}
            defaultValue={this.state.defaultLang}
          /> */}
          <Dialog language={T('zh-cn')}
            visible={this.state.nodeConfigVisible}
            title={T("配置需连接的节点")}
            footerActions="ok"
            footerAlign="center"
            closeable="true"
            onOk={this.onConfigNodeOK.bind(this)}
            onCancel={() => this.setState({ nodeConfigVisible: false })}
            onClose={() => this.setState({ nodeConfigVisible: false })}
          >
            <Select language={T('zh-cn')}
                style={{ width: 400 }}
                placeholder={T("选择节点")}
                onChange={this.onChangeNode.bind(this, 'nodeInfo')}
                value={this.state.nodeInfo}
                defaultValue={constant.testNetRPCHttpsAddr}
                dataSource={this.state.nodes}
            />
            <br />
            <br />
            <Input hasClear
              disabled={this.state.customNodeDisabled}
              onChange={this.handleNodeInfoChange.bind(this)}
              style={{ width: 400 }}
              addonBefore="RPC URL"
              size="medium"
              defaultValue={this.state.nodeInfo}
              maxLength={150}
              hasLimitHint
            />
          </Dialog>

          {/* <Search
            style={{ fontSize: '12px' }}
            size="large"
            inputWidth={400}
            searchText="Search"
            placeholder="Search by Address / Txhash / Block / Token / Ens"
          /> */}
          

          {/* Header 右侧内容块 */}

          {/* <Balloon
            visible={false}
            trigger={
              <div
                className="ice-design-header-userpannel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                }}
              >
                <IceImg
                  height={40}
                  width={40}
                  src={
                    profile.avatar ||
                    'https://img.alicdn.com/tfs/TB1L6tBXQyWBuNjy0FpXXassXXa-80-80.png'
                  }
                  className="user-avatar"
                />
                <div className="user-profile">
                  <span className="user-name" style={{ fontSize: '13px' }}>
                    {profile.name}
                  </span>
                  <br />
                  <span
                    className="user-department"
                    style={{ fontSize: '12px', color: '#999' }}
                  >
                    {profile.department}
                  </span>
                </div>
                <Icon
                  type="arrow-down-filling"
                  size="xxs"
                  className="icon-down"
                />
              </div>
            }
            closable={false}
            className="user-profile-menu"
          >
            <ul>
              <li className="user-profile-menu-item">
                <FoundationSymbol type="person" size="small" />我的主页
              </li>
              <li className="user-profile-menu-item">
                <FoundationSymbol type="repair" size="small" />设置
              </li>
              <li
                className="user-profile-menu-item"
                onClick={this.props.handleLogout}
              >
                <FoundationSymbol type="compass" size="small" />退出
              </li>
            </ul>
          </Balloon> */}
        </div>
      </Layout.Header>
    );
  }
}
