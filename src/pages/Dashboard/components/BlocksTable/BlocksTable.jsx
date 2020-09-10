/* eslint no-mixed-operators:0 */
import React, { Component } from 'react';
import { Progress, Feedback } from '@icedesign/base';
import { Table, Button, Dialog, Loading, Icon } from '@alifd/next';
import IceContainer from '@icedesign/container';
import copy from 'copy-to-clipboard';
import * as oexchain from 'oex-web3';

import * as utils from '../../../../utils/utils';
import { T } from '../../../../utils/lang';
import BlockList from '../../../BlockList';
import eventProxy from '../../../../utils/eventProxy';
import Nodata from '../../../../components/Common/Nodata';
import block from './images/block.png';
import './local.scss';
import blockIcon from '../../../../components/Common/images/block-black.png';


const indicator = (
  <div>
      <Icon type="loading" />
  </div>
);

const CustomLoading = (props) => (
    <Loading
        indicator={indicator}
        {...props}
    />
);

export default class BlocksTable extends Component {
  static displayName = 'BlocksTable';

  constructor(props) {
    super(props);

    this.state = {
      maxBlockNum: 17,
      blockList: [],
      intervalId: 0,
      blockListVisible: false,
      isLoading: true,
    };
  }

  componentDidMount() {
    this.updateBlockInfo();
    
    oexchain.oex.getChainConfig().then(chainConfig => {
      this.state.intervalId = setInterval(() => {
        this.updateBlockInfo();
      }, chainConfig.dposParams.blockInterval);
    });

  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  updateBlockInfo = () => {
    const blockList = [];
    oexchain.oex.getCurrentBlock(false).then(async(block) => {
      if (this.state.blockList.length > 0 && block.number <= this.state.blockList[0].number) {
        return;
      }
      block['txn'] = block.transactions.length;
      blockList.push(block);
      let nextBlockNum = block.number - 1;
      let count = 1;
      const len = this.state.blockList.length;
      for (let i = 0; count < this.state.maxBlockNum; i++, nextBlockNum--, count++) {
        if (i < len && this.state.blockList[i].number == nextBlockNum) {
          blockList.push(this.state.blockList[i]);
          continue;
        }
        var curBlockInfo = await oexchain.oex.getBlockByNum(nextBlockNum, false);
        curBlockInfo['txn'] = curBlockInfo.transactions.length;
        blockList.push(curBlockInfo);
        i--;
      }

      this.state.blockList = blockList;
      eventProxy.trigger('updateBlocks', blockList);
      this.setState({
        blockList: this.state.blockList,
        isLoading: false,
      });
    });
  }

  renderCellProgress = value => (
    <Progress showInfo={false} percent={parseInt(value, 10)} />
  );

  renderSize = value => {

  }
  copyValue = (value) => {
    copy(value);
    Feedback.toast.success(T('已复制到粘贴板'));
  }

  renderHash = (value) => {
    const displayValue = value.substr(0, 6) + '...' + value.substr(value.length - 6);
    return <address title={T('点击可复制')} onClick={ () => this.copyValue(value) }>{displayValue}</address>;
  }

  renderTimeStamp = (value) => {
    return utils.getValidTime(value);
  }

  renderHeader = () => {
    return <img src={block} width='32'></img>
  }

  renderBlockInfo = (value, index, record) => {
    const localTime = utils.getValidTime(record.timestamp);
    const reward = utils.getReadableNumber(record.reward, 18);
    return (<div>
        <div>
          {T('出块时间 ')}{localTime}
        </div>
        <div>
          {T('矿工 ') + ' '}<font className='blockNumber'>{record.miner}</font>
          {T(' 区块奖励 ') + ' '}<font className='blockNumber'>{reward} OEX</font>
        </div>
        <div>
        {T('交易量 ') + ' '}<font className='blockNumber'>{record.txn}{T('条')}</font>
        </div>
      </div>);
  }

  renderBlockNumber = (v,index, record) => {
    const localTime = utils.getValidTime(record.timestamp);
    return (
      <div>
        <a href={'/#/Block?h=' + v} className='blockNumber' >{v}</a>
        <p>{localTime}</p>
      </div>
      );
  }

  renderGas = (v) => {
    return T('Gas消耗') + ' ' + v;
  }

  render() {
    return (
      <div className="progress-table">
        <IceContainer className="tab-card" title={<span className='table-title'><img src={blockIcon}/>{T("区块")}</span>} >
          {
            (this.state.isLoading || !this.state.blockList.length) ? <Nodata/> : (
              <Table hasHeader={false} isZebra={false}  hasBorder={false}
                isLoading={this.state.isLoading}
                loadingComponent={CustomLoading}
                dataSource={this.state.blockList}
                primaryKey="number"
                language={T('zh-cn')}
              >
                <Table.Column width={60} cell={this.renderHeader.bind(this)}/>
                <Table.Column title={T("高度")} dataIndex="number" width={100} cell={this.renderBlockNumber.bind(this)}/>
                <Table.Column title={T("详情")} dataIndex="timestamp" width={200} cell={this.renderBlockInfo.bind(this)}/>
                <Table.Column title={T("Gas消耗")} dataIndex="gasUsed" width={100} cell={this.renderGas.bind(this)}/>
              </Table>
            ) 
          }
          <Button 
            type='primary' 
            style={{width: '100%', height: '40px', marginTop: '5px',}}
            onClick={() => {
              this.setState({blockListVisible: true});
            }}
            disabled={this.state.isLoading || !this.state.blockList.length}
          >
            {T('查看所有区块')}
          </Button>
        </IceContainer>
        <Dialog language={T('zh-cn')} style={{ width: '1000px', height: '80%', marginTop: '-50px'}}
          visible={this.state.blockListVisible}
          shouldUpdatePosition={true}
          title={T("全部区块")}
          closeable="esc,close"
          onOk={() => {this.setState({blockListVisible: false})}}
          onCancel={() => {this.setState({blockListVisible: false})}}
          onClose={() => {this.setState({blockListVisible: false})}}
          footer={<view></view>}
        >
          <BlockList />
        </Dialog>
      </div>
    );
  }
}

const styles = {
  paginationWrapper: {
    display: 'flex',
    padding: '20px 0 0 0',
    flexDirection: 'row-reverse',
  },
};
