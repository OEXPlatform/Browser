import React, { Component } from 'react';
import { Button, Grid, Input } from "@alifd/next";
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3'
import ReactJson from 'react-json-view';

import { Feedback } from '@icedesign/base';
import BigNumber from "bignumber.js";
import TransactionList from '../../TransactionList';
import { T } from '../../utils/lang';

const { Row, Col } = Grid;
const searchImg = require('./images/Search_icon.png');

export default class BlockTable extends Component {
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
    return (
      <div style={styles.all}> 
        <IceContainer style={styles.banner}>
          <Row justify='space-around' style={{width: '80%', height: '50px', backgroundColor: '#5c67f2', alignItems: 'center'}}>
            <Input style={{borderRadius: '10px', marginLeft: '-1.5%', padding: '7px 5px', width: '98%', height: '80%'}} 
                   placeholder={T("高度/哈希")} onChange={this.onBlockChange.bind(this)} onPressEnter={this.onSearch.bind(this)} defaultValue={this.state.number}/>
            <Button text style={{marginLeft: '-9%', marginTop: '5px'}} onClick={this.onSearch.bind(this)}><img style={{width: '50%', height: '70%'}}  src={searchImg}/></Button>                   
          </Row>  
        </IceContainer>

        <IceContainer style={styles.container}>
          <h4 style={styles.title}>{T('区块原始信息')}</h4>
          <ReactJson displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
            src={this.state.blockInfo}
          />
        </IceContainer>
        
        <IceContainer style={{...styles.container, margin: '0 0 30% 0'}}>
          <TransactionList txFrom={this.state.txFrom}/>
        </IceContainer>
      </div>
    );
  }
}

const styles = {
    all: {
      height: 'auto',
      backgroundColor: '#f5f6fa',
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column',
      alignItems: 'center'
    },
    banner: {
      width: '100%', 
      height: '310px', 
      backgroundColor: '#080a20',
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column',
      alignItems: 'center'
    },
    container: {
      width: '78%', 
      margin: '-240px 0 20px 0',
      padding: '0',
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column',
    },
    title: {
      margin: '0',
      padding: '15px 20px',
      fonSize: '16px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: 'rgba(0,0,0,.85)',
      fontWeight: '500',
      borderBottom: '1px solid #eee',
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