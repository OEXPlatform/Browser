import React, { Component } from 'react';
import { Button, Grid, Input, Icon, Table} from "@alifd/next";
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
        onePageNum: 10,
        txFrom: {},
        txRawData: {},
        txReceiptData: {},
        assetList: []
    };
  }

  componentDidMount = async () => {
    if (this.state.number != null) {
      this.state.searchedBlock = this.state.number;
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
      })
      this.setState({accountInfo});
    })
  }

  onAccountChange(v) {
    this.setState({accountName: v});
  }

  getReadableNumber = (value, assetID) => {
    let {assetInfos} = this.state;
    var decimals = assetInfos[assetID].decimals;

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
                <Table.Column title={T("资产数量")} dataIndex="balance" width={100} />
              </Table>
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