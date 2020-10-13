import React, { Component } from 'react';
import { Button, Grid, Input, Icon, Table, Dialog, Pagination } from "@alifd/next";
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3'
import ReactJson from 'react-json-view';
import {compose} from 'redux';

import { Feedback } from '@icedesign/base';
import BigNumber from "bignumber.js";
import { T } from '../../utils/lang';
import './local.scss';
import {withRouter, Route} from 'react-router-dom';
import cn from 'classnames';
import {withTranslation} from 'react-i18next';
import blockIcon from '../../components/Common/images/block-white.png';
import txIcon from '../../components/Common/images/tx-black.png';
import Nodata from '../../components/Common/Nodata';

const { Row } = Grid;

export default class AssetComponent extends Component {
  static displayName = 'Account';

  constructor(props) {
    super(props);
    this.state = {
        assetName: "",
        value: "",
        blockInfo: {},
        txNum: '',
        transactions: [],
        assetInfo: {},
        onePageNum: 10,
        txFrom: {},
        txRawData: {},
        txReceiptData: {},
        assetList: [],
        accountListVisible: false,
        assetAccountList: [],
        curAssetInfo: {},
        current: 1,
        totalAccountsNum: 0,
        pageSize: 10,
        isLoading: true,
    };
  }

  componentDidMount = () => {
    fetch("https://api.oexchain.com/api/rpc/gettokens?pageIndex=0&pageSize=100").then(response => {
      return response.json();
    }).then(tokensInfo => {
      if (tokensInfo != null && tokensInfo.data != null) {
        const assetList = tokensInfo.data.list;
        this.setState({assetList});
      }
    })
  }

  onSearch = () => {
    oexchain.account.getAssetInfoByName(this.state.assetName).then(assetInfo => {
      if (assetInfo == null) {
        Feedback.toast.error(T('资产不存在'));
        return;
      }
      console.log(assetInfo);
      this.setState({assetInfo});
    })
  }

  onAssetChange(v) {
    this.setState({assetName: v});
  }

  getReadableNumber = (value, decimals) => {
    var renderValue = new BigNumber(value);
    renderValue = renderValue.shiftedBy(decimals * -1);
    
    BigNumber.config({ DECIMAL_PLACES: 6 });
    renderValue = renderValue.toString(10);
    return renderValue;
  }

  searchAsset = (assetName) => {
    this.state.assetName = assetName;
    this.setState({assetName});
    this.onSearch();
  }

  assetNameRender = (assetName) => {
    return <Button text onClick={() => this.searchAsset(assetName)}>{assetName}</Button>
  }

  balanceRender = (balance, index, assetInfo) => {
    const readableValue = this.getReadableNumber(balance, assetInfo.decimals);
    return readableValue + ' ' + assetInfo.symbol.toUpperCase();
  }

  accountAssetBalanceRender = (balance) => {
    return this.balanceRender(balance, null, this.state.curAssetInfo);
  }

  accountStatRender = (stat, index, assetInfo) => {
    return <Button text onClick={() => this.showAccountsTable(assetInfo, 0)}>{stat}</Button>
  }

  showAccountsTable = (assetInfo, pageIndex) => {
    fetch("https://api.oexchain.com/api/rpc/getassetinfo?pageIndex=" + pageIndex + "&pageSize=" + this.state.pageSize + "&assetid=" + assetInfo.assetId).then(response => {
      return response.json();
    }).then(tokensInfo => {
      if (tokensInfo != null && tokensInfo.data != null) {
        const assetAccountList = tokensInfo.data.list;
        this.setState({assetAccountList, accountListVisible: true, curAssetInfo: assetInfo, totalAccountsNum: tokensInfo.data.total, isLoading: false});
      }
    })
  }

  onChange = (currentPage) => {
    this.setState({current: currentPage, isLoading: true});
    this.showAccountsTable(this.state.curAssetInfo, currentPage);
  }

  render() {

    const {match, t} = this.props;

    const isBlock = Boolean(match.path.includes('Block'))

    const subClass = isBlock ? 'bk' : 'tx';

    return (
      <div className={cn('contain', subClass)} style={styles.all}> 
        <div className='mainContainer'>
          <Row className='searchContain'>
            <Button text iconSize='small' onClick={this.onSearch.bind(this)} className='searchIcon'><Icon type="search"/></Button>              
            <Input className={cn('search', subClass)} value={this.state.assetName}
                  placeholder={T("资产名")} onChange={this.onAssetChange.bind(this)} onPressEnter={this.onSearch.bind(this)}/>
          </Row>  
          <IceContainer className={cn('block-container', subClass)}>
            <h4 className={cn('title', subClass)}> <img src={blockIcon} width='24'/>{T('资产完整信息')}</h4>
            <ReactJson displayDataTypes={false} theme='rjv-default' style={{padding: '30px', backgroundColor: 'transparent'}}
              src={this.state.assetInfo}
            />
          </IceContainer>
          <IceContainer className={cn('block-container')}>
            <h4 className={cn('title')}> <img src={txIcon} width='24'/>{T("所有资产列表")}</h4>
            <Row style={{marginBottom: '10px', width: '100%'}}>
              <Table primaryKey="name" language={T('zh-cn')} style={{width: '100%'}}
                isZebra={false}  hasBorder={false} 
                dataSource={this.state.assetList}
                emptyContent={<Nodata />}
              >
                <Table.Column title={T("资产名")} dataIndex="assetName" width={100} cell={this.assetNameRender.bind(this)}/>
                <Table.Column title={T("流通量")} dataIndex="amount" width={100} cell={this.balanceRender.bind(this)}/>
                <Table.Column title={T("可发行总量")} dataIndex="upperLimit" width={100} cell={this.balanceRender.bind(this)}/>
                <Table.Column title={T("持有账户数")} dataIndex="stats" width={100}  cell={this.accountStatRender.bind(this)}/>
                <Table.Column title={T("交易数量")} dataIndex="transfers" width={100}/>
              </Table>
            </Row>
          </IceContainer>
        </div>
        <Dialog language={T('zh-cn')} style={{ width: '70%', height: '80%', marginTop: '-50px'}}
          visible={this.state.accountListVisible}
          shouldUpdatePosition={true}
          title={T("账户列表")}
          closeable="esc,close"
          onOk={() => {this.setState({accountListVisible: false})}}
          onCancel={() => {this.setState({accountListVisible: false})}}
          onClose={() => {this.setState({accountListVisible: false})}}
          footer={<view></view>}
        >
          <IceContainer className="tab-card">
            <Table isZebra={false}  hasBorder={false}
              isLoading={this.state.isLoading}
              dataSource={this.state.assetAccountList}
              primaryKey="number"
              language={T('zh-cn')}
              emptyContent={<Nodata />}
            >
              <Table.Column title={T("账户")} dataIndex="account" width={100}/>
              <Table.Column title={T("资产")} dataIndex="quantity" width={150} cell={this.accountAssetBalanceRender.bind(this)}/>
            </Table>
          <Row justify='end'>
            <Pagination hideOnlyOnePage showJump={false} shape="arrow-only" current={this.state.current} pageSize={this.state.pageSize} total={this.state.totalAccountsNum} onChange={this.onChange} style={{marginTop: '10px'}} />
          </Row>
        </IceContainer>
        </Dialog>
      </div>
    );
  }
}

const styles = {
    all: {
      height: 'auto',
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column',
      alignItems: 'center'
    },
    title: {
      margin: '0',
      padding: '15px 0',
      fonSize: '16px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: 'rgba(255,255,255,.85)',
      fontWeight: '500',
      borderBottom: '1px solid rgba(255,255,255,.21)',
      margin:'0 30px'
    },
    summary: {
      padding: '20px',
    },
    item: {
      height: '40px',
      lineHeight: '40px',
    },
    label: {
      display: 'inline-block',
      fontWeight: '500',
      minWidth: '74px',
      width: '150px',
    },
  };