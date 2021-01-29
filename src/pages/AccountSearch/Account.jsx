import React, { Component } from 'react';
import { Button, Grid, Input, Icon, Table, Pagination } from "@alifd/next";
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
import TransactionList from '../../TransactionList';
import * as utils from '../../utils/utils';
import * as txParser from '../../utils/transactionParser';
import blockIcon from '../../components/Common/images/block-white.png';
import txIcon from '../../components/Common/images/tx-black.png';
import Nodata from '../../components/Common/Nodata';

const { Row, Col } = Grid;

export default class AccountComponent extends Component {
  static displayName = 'Account';

  constructor(props) {
    super(props);
    this.state = {
        accountName: "",
        value: "",
        blockInfo: {},
        txNum: '',
        transactions: [],
        assetInfos: {},
        pageSize: 10,
        txFrom: {},
        txRawData: {},
        txReceiptData: {},
        assetList: [],
        current: 1,
        totalAccountTxsNum: 0
    };
  }

  componentDidMount = async () => {
    if (this.state.number != null) {
      this.state.searchedBlock = this.state.number;
      this.onSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.accountName = nextProps.location.search.length > 1 ? nextProps.location.search.substr(1) : null;
    if (this.state.accountName != null) {
      this.onSearch();
    }
  }

  onSearch = async () => {
    oexchain.account.getAccountByName(this.state.accountName).then(accountInfo => {
      if (accountInfo == null) {
        Feedback.toast.error(T('账号不存在'));
        return;
      }
      this.state.assetList = [];
      accountInfo.balances.map(balance => {
        oexchain.account.getAssetInfoById(balance.assetID).then(assetInfo => {
          this.state.assetList.push({assetName: assetInfo.assetName, symbol: assetInfo.symbol, balance: balance.balance, decimals: assetInfo.decimals});
          this.setState({assetList: this.state.assetList});
        })
      });
      let url = window.location.href;
      if (window.location.href.indexOf('?') > -1)
        url = window.location.href.substr(0, window.location.href.indexOf('?'));
      window.history.pushState(null, null, url + '?' + this.state.accountName);
      this.setState({accountInfo});
    });
    this.showAccountTxTable(this.state.accountName, 0);
  }

  onChange = (currentPage) => {
    this.setState({current: currentPage, isLoading: true});
    this.showAccountTxTable(this.state.accountName, currentPage);
  }

  showAccountTxTable = (accountName, pageIndex) => {
    fetch("https://api.oexchain.com/api/otransactioninfo/gettransactionforme?pageIndex=" + pageIndex + "&pageSize=" + this.state.pageSize + "&account=" + accountName).then(response => {
      return response.json();
    }).then(txInfo => {
      if (txInfo != null && txInfo.data != null) {
        console.log(txInfo.data.total);
        const txList = txInfo.data.list;
        this.setState({txList, totalAccountTxsNum: txInfo.data.total});
      }
    })
  }

  onAccountChange(v) {
    this.setState({accountName: v});
  }

  getReadableNumber = (value, decimals) => {
    var renderValue = new BigNumber(value);
    renderValue = renderValue.shiftedBy(decimals * -1);
    
    BigNumber.config({ DECIMAL_PLACES: 6 });
    renderValue = renderValue.toString(10);
    return renderValue;
  }

  searchOfficialAccount = (accountName) => {
    this.state.accountName = accountName;
    this.setState({accountName});
    this.onSearch();
  }

  symbolRender = (symbol) => {
    return symbol.toUpperCase();
  }

  balanceRender = (balance, index, assetInfo) => {
    const readableValue = this.getReadableNumber(balance, assetInfo.decimals);
    return readableValue + ' ' + assetInfo.symbol.toUpperCase() + ' [' + balance + ']';
  }

  txHashRender = (value) => {
    const displayValue = value.substr(0, 8) + '...' + value.substr(value.length - 6);
    return <a className='txHash' href={'/#/Transaction?' + value} target='_blank'>{displayValue}</a>;
  }

  blockHashRender = (value) => {
    const displayValue = value.substr(0, 8) + '...' + value.substr(value.length - 6);
    return <a className='blockHash' href={'/#/Block?' + value} target='_blank'>{displayValue}</a>;
  }

  txTypeRender = (value) => {
    return txParser.getActionTypeStr(value);
  }

  txResultRender = (value) => {
    value = JSON.parse(value);
    return (value.status == '1') ? T('成功') : T('失败');
  }

  timestampRender = (value) => {
    return utils.getBlockTime(value);
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
            <Input className={cn('search', subClass)} value={this.state.accountName}
                  placeholder={T("账户名")} onChange={this.onAccountChange.bind(this)} onPressEnter={this.onSearch.bind(this)}/>
          </Row>  
          <IceContainer className={cn('block-container', subClass)}>
            <h4 className={cn('title', subClass)}> <img src={blockIcon} width='24'/>{T('账号完整信息')}</h4>
            <ReactJson displayDataTypes={false} theme='rjv-default' style={{padding: '30px', backgroundColor: 'transparent'}}
              src={this.state.accountInfo}
            />
          </IceContainer>
          <IceContainer className={cn('block-container')}>
            <h4 className={cn('title')}> <img src={txIcon} width='24'/>{T("账号资产列表")}</h4>
            <Row style={{marginBottom: '10px', width: '100%'}}>
              <Table primaryKey="name" language={T('zh-cn')} style={{width: '100%'}}
                isZebra={false}  hasBorder={false} 
                dataSource={this.state.assetList}
                emptyContent={<Nodata />}
              >
                <Table.Column title={T("资产名")} dataIndex="assetName" width={100}/>
                <Table.Column title={T("资产符号")} dataIndex="symbol" width={100} cell={this.symbolRender.bind(this)}/>
                <Table.Column title={T("资产精度")} dataIndex="decimals" width={100} />
                <Table.Column title={T("资产数量")} dataIndex="balance" width={100} cell={this.balanceRender.bind(this)}/>
              </Table>
            </Row>
          </IceContainer>
          <IceContainer className={cn('block-container')}>
            <h4 className={cn('title')}> <img src={txIcon} width='24'/>{T("账号交易列表")}</h4>
            <Row style={{marginBottom: '10px', width: '100%'}}>
              <Table primaryKey="name" language={T('zh-cn')} style={{width: '100%'}}
                isZebra={false}  hasBorder={false} 
                dataSource={this.state.txList}
                emptyContent={<Nodata />}
              >
                <Table.Column title={T("交易hash")} dataIndex="actionhash" width={100} cell={this.txHashRender.bind(this)}/>
                <Table.Column title={T("区块hash")} dataIndex="blockhash" width={100} cell={this.blockHashRender.bind(this)}/>
                <Table.Column title={T("区块高度")} dataIndex="blocknumber" width={100} />
                <Table.Column title={T("交易时间")} dataIndex="transactiontime" width={100} cell={this.timestampRender.bind(this)}/>
                <Table.Column title={T("交易类型")} dataIndex="txtype" width={100} cell={this.txTypeRender.bind(this)}/>
                <Table.Column title={T("交易结果")} dataIndex="actiondata" width={100} cell={this.txResultRender.bind(this)}/>
                {/* <Table.Column title={T("交易详情")} dataIndex="actiondata" width={100} cell={this.txDetailRender.bind(this)}/> */}
              </Table>
            </Row>
            <Row justify='end'>
              <Pagination hideOnlyOnePage showJump={false} shape="arrow-only" current={this.state.current} pageSize={this.state.pageSize} total={this.state.totalAccountTxsNum} onChange={this.onChange} style={{marginTop: '10px'}} />
            </Row>
          </IceContainer>
          
          <Row>
          <font color='white'>{T('官方账户(点击账户名可查询)')}: </font>
            <Button text type="normal" style={{marginLeft: '10px'}} onClick={() => this.searchOfficialAccount('oexliquidity')}><font color='white'>oexliquidity</font></Button> 
            <Button text type="normal"  style={{marginLeft: '10px'}} onClick={() => this.searchOfficialAccount('oexfirstrelease')}><font color='white'>oexfirstrelease</font></Button> 
            <Button text type="normal"  style={{marginLeft: '10px'}} onClick={() => this.searchOfficialAccount('oexcommunityfund')}><font color='white'>oexcommunityfund</font></Button> 
            <Button text type="normal"  style={{marginLeft: '10px'}} onClick={() => this.searchOfficialAccount('oexconsultant')}><font color='white'>oexconsultant</font></Button> 
            <Button text type="normal"  style={{marginLeft: '10px'}} onClick={() => this.searchOfficialAccount('oexchainofficial')}><font color='white'>oexchainofficial</font></Button> 
          </Row>
        </div>
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
