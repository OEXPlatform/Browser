/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint react/jsx-no-target-blank: 0 */
import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Balloon, Grid, Feedback } from '@icedesign/base';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as oexchain from 'oex-web3';
import './DisplayCard.scss';
import injectReducer from '../../../../utils/injectReducer';
import { getLatestBlock, getTransactionsNum } from './actions';
import reducer from './reducer';
import { T } from '../../../../utils/lang';

const { Row, Col } = Grid;
const block = require('../../../../components/Common/images/block-white.png');
const tx = require('../../../../components/Common/images/tx-white.png');
const producer = require('./images/producers.png');
const votes = require('./images/vote.png');

class BlockTxLayout extends Component {
  static displayName = '';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      blockInfoList: [],
      curBlockInfo: {number: 0},
      latestEpchoInfo: {},
      irreversible: {bftIrreversible: 0},
      curProducerList: [],
      activeProducers: [],
      txNum: 0,
      curTps:  0,
      txInfos: [],
      dposInfo: {},
      intervalId: 0,
    };
  }

  componentDidMount = () => {
    this.updateBlockChainInfo();
    this.state.intervalId = setInterval(() => {
      this.updateBlockChainInfo();
    }, 3000);
  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  updateBlockChainInfo = () => {
    try {
      const self = this;
      oexchain.dpos.getDposIrreversibleInfo().then(irreversibleInfo => {
        this.setState({ irreversible: irreversibleInfo });
      });
      oexchain.dpos.getNextValidCandidates().then(latestEpchoInfo => {
        this.setState({ latestEpchoInfo, activeProducers: latestEpchoInfo.activatedCandidateSchedule });
      });
      oexchain.dpos.getCandidates(0, false).then(candidates => {
        this.setState({ curProducerList: candidates });
      });
      oexchain.dpos.getDposInfo().then(dposInfo => {
        oexchain.oex.getCurrentBlock(false).then(curBlockInfo => {
          const txNum = curBlockInfo.transactions.length;
          const curTps = Math.round(txNum * 1000 / dposInfo.blockInterval);
          this.setState({ curTps, txNum, curBlockInfo });
        });
      });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  caculateTxNums = async (curHeight, interval, maxSpan) => {
    const txNums = [];
    let totalNum = 0;
    let maxTxNum = 0;
    for (let from = curHeight; from > curHeight - maxSpan + interval;) {
      const resp = await getTotalTxNumByBlockNum([from, interval]);
      const txNum = resp.data.result;
      txNums.push(txNum);
      totalNum += txNum;
      if (txNum > maxTxNum) {
        maxTxNum = txNum;
      }
      from -= interval;
    }
    return { txNums, totalNum, maxTxNum };
  }

  render() {
    return (
      <IceContainer style={styles.container}>
        <div className='containMain'>
          <div className='borderContent'>
            <div className='realContent'>
              <Row className='content'>
                <Col span='4' style={{...styles.item, textAlign:'left'}}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={block} width='24'/>
                    <div style={styles.title}>
                      {T('最新区块')}
                    </div>
                  </Row>
                </Col>
                <Col span='4' style={styles.item}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={tx} width='24'/>
                    <div style={styles.title}>
                      {T('交易信息')}
                    </div>
                  </Row>
                </Col>
                <Col span='4' style={styles.item}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={producer} width='24'/>
                    <div style={styles.title}>
                      {T('生产者')}
                    </div>
                  </Row>
                </Col>
                <Col span='4' style={{...styles.item, }}>
                  <Row align='center' style={{...styles.titleRow, justifyContent: 'flex-end'}}>
                    <img src={votes} width='24'/>
                    <div style={styles.title}>
                      {T('投票数')}
                    </div>
                  </Row>
                </Col>
              </Row>
              <Row style={{width: '100%',  display:'flex', justifyContent:'space-between'}}>
                <Col span="4" style={{...styles.item, textAlign:'left'}}>
                  <div style={styles.countTitle}>
                  {T('最新区块高度')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.curBlockInfo.number}
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('不可逆区块高度')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {this.state.irreversible.bftIrreversible}
                  </div>
                </Col>
                <Col span="4" style={styles.item}>
                  
                  <div style={styles.countTitle}>
                  {T('最新区块的TPS')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.curTps} TPS
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('最新区块交易量')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {this.state.txNum} Txns
                  </div>
                </Col>
                <Col span="4" style={styles.item}>
                  
                  <div style={styles.countTitle}>
                  {T('注册为生产者的节点数量')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.curProducerList.length}
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('出块节点数量')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {this.state.activeProducers.length}
                  </div>
                </Col>
                <Col span="4" style={{...styles.item, textAlign: 'right'}}>
                  
                  <div style={styles.countTitle}>
                  {T('总投出的票数')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.latestEpchoInfo.totalQuantity} OEX
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('出块节点获得的总票数')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {this.state.latestEpchoInfo.activatedTotalQuantity} OEX
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </IceContainer>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    padding: '30px 10%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '5px',
  },
  containMain:{
    backgroundColor: '#080a20', 
    width: '100%', 
    borderRadius: '5px',
    padding: '0 70px', 
    border: '2px solid rgba(35, 201, 167, 0.10196078431372549)', 
  },
  item: {
    height: '100%', 
    width: '100%', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleRow: {
    margin: '28px 0 24px 0',
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    marginLeft: '8px'
  },
  countTitle: {
    fontSize: '14px', 
    marginTop:'8px',
    color: '#fff'
  },
  count: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '38px',
  },
  smallCountTitle: {
    fontSize: '14px', 
    color: '#fff'
  },
  smallCount: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '28px',
  },
  desc: {
    fontSize: '12px',
  },
  down: {
    width: '6px',
    height: '9px',
  },
  up: {
    width: '6px',
    height: '9px',
  },
  extraIcon: {
    marginLeft: '5px',
    position: 'relative',
    top: '1px',
  },
};


const mapDispatchToProps = {
  getLatestBlock,
  getTransactionsNum,
};

// 参数state就是redux提供的全局store，而loginResult会成为本组件的this.props的其中一个成员
const mapStateToProps = (state) => {
  return { lastBlockInfo: state.lastBlockInfo };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

const withReducer = injectReducer({ key: 'blockTxLayout', reducer });

export default compose(
  withReducer,
  withConnect
)(BlockTxLayout);
