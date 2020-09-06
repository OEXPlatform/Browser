import React, { PureComponent } from 'react';
import Layout from '@icedesign/layout';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import twitter from './images/twitter.png';
import telegram from './images/telegram.png';
import sina from './images/sina.png';
import facebook from './images/facebook.png';
import oex from './images/oex.png';
import './footer.scss';
import { T } from '../../utils/lang';



const logo = require('./images/bottom_logo.png');

export default class Footer extends PureComponent {
  render() {
    const { className, style } = this.props;
    return (
      <Layout.Footer
        className={cx('ice-design-layout-footer', className)}
        style={{
          ...style,
        }}
      >
        <div className="ice-design-layout-footer-body">
          <div className="logo">
            <Link to="/" className="logo-text">
              OEXChain Explore
            </Link>
            <div className="links">
              <a href='#'><img src={telegram} alt='' width={25}/></a>
              <a href='#'><img src={sina} alt=''  width={25}/></a>
              <a href='#'><img src={facebook} alt=''  width={25}/></a>
              <a href='#'><img src={twitter}  alt='' width={25}/></a>
              <a href='#'><img src={oex}  alt='' width={25}/></a>
            </div>
            <div className="copyright">
              © 2019 Theme designed by oex.com
            </div>
          </div>
          <div className="siteService">
            <div class='listContain'>
              <div class='listTitle'>{T('工具')}</div>
              <a href='#'>{T('客户端下载')}</a> 
              <a href='#'>{T('官方人员验证通道')}</a> 
              <a href='#'>{T('API文档')}</a> 
            </div>
            <div class='listContain'>
              <div class='listTitle'>{T('服务')}</div>
              <a href='#'>{T('费率')}</a> 
              <a href='#'>{T("帮助中心")}</a> 
              <a href='#'>{T("OEX介绍")}</a> 
            </div>
            <div class='listContain'>
              <div class='listTitle'>{T('支持')}</div>
              <a href='#'>{T('上币申请')}</a> 
              <a href='#'>{T('机构与招商账户')}</a> 
              <a href='#'>{T('广告申请合作')}</a> 
            </div>
            <div class='listContain'>
              <div class='listTitle'>{T('条款说明')}</div>
              <a href='#'>{T('用户协议')}</a> 
              <a href='#'>{T('隐私条款')}</a> 
              <a href='#'>{T('交易规则')}</a> 
            </div>
          </div>
        </div>
      </Layout.Footer>
    );
  }
}
