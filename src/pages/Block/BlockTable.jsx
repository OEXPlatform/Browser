import React, { Component } from 'react';
import { Button, Grid, Input, Icon} from "@alifd/next";
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3'
import ReactJson from 'react-json-view';
import {compose} from 'redux';

import { Feedback } from '@icedesign/base';
import BigNumber from "bignumber.js";
import TransactionList from '../../TransactionList';
import { T } from '../../utils/lang';
import './local.scss';
import {withRouter, Route, Switch} from 'react-router-dom';
import cn from 'classnames';
import {withTranslation} from 'react-i18next';
import blockIcon from '../../components/Common/images/block-white.png';
import txIcon from '../../components/Common/images/tx-black.png';

const { Row, Col } = Grid;

class BlockTableComponent extends Component {
  static displayName = 'BlockTable';

  constructor(props) {
    super(props);
    this.state = {
        number: props.location.search.length > 1 ? props.location.search.substr(1) : null,
        filter: [
            {
              text: T("区块高度"),
              value: "height"
            },
            {
              text: T("区块哈希值"),
              value: "hash"
            }
        ],
        value: "",
        blockInfo: {},
        txNum: '',
        transactions: [],
        assetInfos: {},
        onePageNum: 10,
        txFrom: {},
        txRawData: {},
        txReceiptData: {},
    };
  }

  componentDidMount = async () => {
    if (this.state.number != null) {
      this.state.searchedBlock = this.state.number;
      this.onSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.number = nextProps.location.search.length > 1 ? nextProps.location.search.substr(1) : '';
    this.state.searchedBlock = this.state.number;
    if (this.state.number != null) {
      this.onSearch();
    }
  }

  onSearch = async () => {
    const {match} = this.props;
    const isBlock = Boolean(match.path.includes('Block'))
    const value = this.state.searchedBlock;
    var blockInfo = {};
    var blockInfo2 = {};
    if(isBlock){
      if (value.indexOf("0x") === 0) {
        blockInfo = await oexchain.oex.getBlockByHash(value, true);
        blockInfo2 = await oexchain.oex.getBlockByNum(blockInfo.number, false);
        if (blockInfo.hash != blockInfo2.hash) {
          Feedback.toast.prompt(T('注意：此区块已被回滚'));
        }
      } else {
        blockInfo = await oexchain.oex.getBlockByNum(value, true);
      }
      if (blockInfo != null) {
        this.setState({ blockInfo, txFrom: {blockHeight: blockInfo.number}, txNum: blockInfo.transactions.length });
      } else {
          Feedback.toast.prompt(T('区块不存在'));
      }
    }else{
      if (value.indexOf("0x") === 0) {
        let txInfo = await oexchain.oex.getTransactionByHash(value);
        if (txInfo != null) {
          var txReceiptData = await oexchain.oex.getTransactionReceipt(value);//formatHighlight(await oexchain.oex.getTransactionReceipt(hash), COLOR_OPTION);
          const txRawData = txInfo;//formatHighlight(txInfo, COLOR_OPTION);
          if (txReceiptData == null) {
            Feedback.toast.prompt(T('交易尚未执行'));
            txReceiptData = {};
          }
          this.setState({
            txFrom: { txHashArr: [value] },
            txRawData,
            txReceiptData
          });
        } else {
          Feedback.toast.error(T('无法获取到交易信息'));
        }
      } else {
        value.length && Feedback.toast.prompt(T('请输入十六进制的hash值'));
      }
    }
  }

  // value为filter的值，obj为search的全量值
  onBlockChange(v) {
    this.state.searchedBlock = v;
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
  onChange = (currentPage) => {
    var startNo = (currentPage - 1) * this.state.onePageNum;
    var transactions = this.state.transactions.slice(startNo, startNo + this.state.onePageNum);
    this.setState({
      transactionsOnePage: transactions,
    });
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
            <Input className={cn('search', subClass)} 
                  placeholder={t("searchPlaceholder",{context: isBlock ? 'bk' : 'tx'})} onChange={this.onBlockChange.bind(this)} onPressEnter={this.onSearch.bind(this)} defaultValue={this.state.number}/>
          </Row>  


          <Switch>
            <Route path='/Block' render={() => {
              return (
                <div>
                   <IceContainer className={cn('block-container', subClass)}>
                    <h4 className={cn('title', subClass)}> <img src={blockIcon} width='24'/>{T('区块原始信息')}</h4>
                    <ReactJson displayDataTypes={false} theme={isBlock ? 'ocean' : 'rjv-default'} style={{padding: '30px', backgroundColor: 'transparent'}}
                      src={this.state.blockInfo}
                    />
                  </IceContainer>
                  <IceContainer className={cn('block-container')}>
                    <h4 className={cn('title')}> <img src={txIcon} width='24'/>{T("交易")}</h4>
                    <TransactionList txFrom={this.state.txFrom}/>
                  </IceContainer>
                </div>
              )
            }} />
            <Route path='/Transaction' render={() => {
                return (
                  <div>
                    <IceContainer className={cn('block-container', subClass)}>
                      <h4 className={cn('title', subClass)}> <img src={txIcon} width='24'/>{T("交易")}</h4>
                      <TransactionList txFrom={this.state.txFrom}/>
                    </IceContainer>
                    <IceContainer className={cn('block-container')}>
                      <div>
                        <h4 className={cn('title', subClass)}>{T('交易原始信息')}</h4>
                        <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
                          src={this.state.txRawData}
                        />
                      </div>
                      <div>
                        <h4 className={cn('title', subClass)}>{T('交易Receipt信息')}</h4>
                        <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
                          src={this.state.txReceiptData}
                        />
                      </div>
                    </IceContainer>
                  </div>
                )
            }}/>
          </Switch>
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

  export default compose(
    withRouter,
    withTranslation()
  )(BlockTableComponent);