import React, { Component } from 'react';
import { Button, Grid, Input } from "@alifd/next";
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3'
import ReactJson from 'react-json-view';

import { Feedback } from '@icedesign/base';
import BigNumber from "bignumber.js";
import TransactionList from '../../TransactionList';
import { T } from '../../utils/lang';
import './local.scss';
import {withRouter, Route, Switch} from 'react-router-dom';
import searchImg from './images/Search_icon.png';
import cn from 'classnames';

const { Row, Col } = Grid;

class BlockTable extends Component {
  static displayName = 'BlockTable';

  constructor(props) {
    super(props);
    this.state = {
        number: props.location.search.length > 1 ? props.location.search.substr(3) : null,
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
    };
  }

  componentDidMount = async () => {
    if (this.state.number != null) {
      this.state.searchedBlock = this.state.number;
      this.onSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.number = nextProps.location.search.length > 1 ? nextProps.location.search.substr(3) : '';
    this.state.searchedBlock = this.state.number;
    if (this.state.number != null) {
      this.onSearch();
    }
  }

  onSearch = async () => {
    const value = this.state.searchedBlock;
    var blockInfo = {};
    var blockInfo2 = {};
    if (value.indexOf("0x") == 0) {
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

    const {match} = this.props;

    console.log(match);
    const isBlock = Boolean(match.path.includes('Block'))

    const subClass = isBlock ? 'bk' : 'tx';

    return (
      <div className={cn('contain', subClass)} style={styles.all}> 
        <div className='mainContainer'>
          <Row className='searchContain'>
            <Button className='searchIcon' text onClick={this.onSearch.bind(this)}><img style={{width: '50%', height: '70%'}}  src={searchImg}/></Button>                   
            <Input className={cn('search', subClass)} 
                  placeholder={T("高度/哈希")} onChange={this.onBlockChange.bind(this)} onPressEnter={this.onSearch.bind(this)} defaultValue={this.state.number}/>
          </Row>  

          <IceContainer className={cn('block-container', subClass)}>
            <h4 className={cn('title', subClass)} >{T('区块原始信息')}</h4>
            <ReactJson displayDataTypes={false} theme={isBlock ? 'ocean' : 'rjv-default'} style={{padding: '30px', backgroundColor: 'transparent'}}
              src={this.state.blockInfo}
            />
          </IceContainer>
          


          <Switch>
            <Route path='/Block' render={() => {
              return (
                <IceContainer style={{borderRadius: 20, marginTop: 20}}>
                  <TransactionList txFrom={this.state.txFrom}/>
                </IceContainer>
              )
            }} />
            <Route path='/Transaction' render={() => {
                return (
                  <IceContainer className={cn('block-container', subClass)}>
                    <IceContainer>
                      <h4 className={cn('title', subClass)}>{T('交易原始信息')}</h4>
                      <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
                        src={this.state.txRawData}
                      />
                    </IceContainer>
                    <IceContainer>
                      <h4 className={cn('title', subClass)}>{T('交易Receipt信息')}</h4>
                      <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
                        src={this.state.txReceiptData}
                      />
                    </IceContainer>
                  </IceContainer>
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

  export default withRouter(BlockTable);