/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import React, { Component, useState } from 'react';
import { Grid, Feedback } from '@icedesign/base';
import { Tag, Balloon, Input, Button } from '@alifd/next';
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3'
import ReactJson from 'react-json-view';
import TransactionList from '../../TransactionList';
import { T } from '../../utils/lang';
import searchImg from './images/Search_icon.png';


const { Row, Col } = Grid;

class TransactionTable extends Component {
  static displayName = 'TransactionTable';

  constructor(props) {
    super(props);
    this.state = {
      searchedTx: props.location.search.length > 1 ? props.location.search.substr(1) : null,
      txInfo: {},
      assetInfos: {},
      actions: [],
      txFrom: {},
      txRawData: {},
      txReceiptData: {},
      src: null,
      setSrc: null,
    };
  }

  componentDidMount = async () => {
    if (this.state.searchedTx != null) {
      this.onSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.searchedTx = nextProps.location.search.length > 1 ? nextProps.location.search.substr(1) : null;
    if (this.state.searchedTx != null) {
      this.onSearch();
    }
  }

  onSearch = async () => {
    const hash = this.state.searchedTx;
    if (hash.indexOf('0x') === 0) {
      let txInfo = await oexchain.oex.getTransactionByHash(hash);
      if (txInfo != null) {
        const txReceiptData = await oexchain.oex.getTransactionReceipt(hash);//formatHighlight(await oexchain.oex.getTransactionReceipt(hash), COLOR_OPTION);
        const txRawData = txInfo;//formatHighlight(txInfo, COLOR_OPTION);
        if (txReceiptData == null) {
          Feedback.toast.prompt(T('交易尚未执行'));
          txReceiptData = {};
        }
        this.setState({
          txFrom: { txHashArr: [hash] },
          txRawData,
          txReceiptData
        });
      } else {
        Feedback.toast.error(T('无法获取到交易信息'));
      }
    } else {
      Feedback.toast.prompt(T('请输入十六进制的hash值'));
    }
    let url = window.location.href;
    if (window.location.href.indexOf('?') > -1)
      url = window.location.href.substr(0, window.location.href.indexOf('?'));
    window.history.pushState(null, null, url + '?' + this.state.searchedTx);
  }

  // value为filter的值，obj为search的全量值
  onTxChange = (v) => {
    this.state.searchedTx = v;
  }

  renderGasAllot = (value, index, record) => {
    return record.gasAllot.map((gasAllot) => {
      const defaultTrigger = <Tag type="normal" size="small">{gasAllot.account}->{gasAllot.gas}aft</Tag>;
      return <Balloon trigger={defaultTrigger} closable={false}>{gasAllot.account}->{gasAllot.gas}aft</Balloon>;
    });
  }


  render() {
    return (
      <div style={styles.all}>
        <IceContainer style={styles.banner}>
          <Row justify='space-around' style={{width: '80%', height: '50px', backgroundColor: '#5c67f2', alignItems: 'center'}}>
            <Input style={{borderRadius: '10px', padding: '7px 5px', marginLeft: '-1.5%', width: '98%', height: '80%'}} 
                   placeholder={T("哈希")} onChange={this.onTxChange.bind(this)} onPressEnter={() => this.onSearch.bind(this)} defaultValue={this.state.searchedTx}/>
            <Button text style={{marginLeft: '-9%', marginTop: '5px'}} onClick={this.onSearch.bind(this)}><img style={{width: '50%', height: '70%'}} src={searchImg}/></Button>                   
          </Row>  
        </IceContainer>
        <IceContainer style={{...styles.container}}>
          <TransactionList txFrom={this.state.txFrom}/>
        </IceContainer>
        <IceContainer style={{...styles.container, margin: '0'}}>
          <h4 style={styles.title}>{T('交易原始信息')}</h4>
          <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
            src={this.state.txRawData}
          />
          {/* <div dangerouslySetInnerHTML={{__html: this.state.txRawData}} /> */}
        </IceContainer>
        <IceContainer style={{...styles.container, margin: '0 0 20% 0'}}>
          <h4 style={styles.title}>{T('交易Receipt信息')}</h4>
          <ReactJson  displayDataTypes={false} style={{backgroundColor: '#fff', padding: '30px'}}
            src={this.state.txReceiptData}
          />
          {/* <div dangerouslySetInnerHTML={{__html: this.state.txReceiptData}} /> */}
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
const COLOR_OPTION = {
  keyColor: 'red',
  numberColor: '#ff8c00',
  stringColor: 'green'
};

export default TransactionTable;

