import React, { Component } from 'react';
import { Dialog, Input, Table, Button, Tag, Balloon, Grid } from '@alifd/next';
import { Select, Feedback, Icon } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import BigNumber from 'bignumber.js';
import { encode } from 'rlp';
import * as oexchain from 'oex-web3';
import * as utils from '../../utils/utils';
import { T, isChinese } from '../../utils/lang';
import * as Constant from '../../utils/constant';
import TxSend from "../TxSend";
import './local.scss';
import leftBg from './images/dot-left-bg.png';
import leftBgEn from './images/dot-left-bg-en.png';
import Nodata from '../../components/Common/Nodata';
import {withTranslation} from 'react-i18next';

const VOTER = 1;
const PRODUCER = 2;
const OTHER = 3;
const { Row, Col } = Grid;


const alternativenodesImg = require('./images/miners_icon_Alternativenodes.png');
const isapieceofImg = require('./images/miners_icon_Isapieceof.png');
const myImg = require('./images/miners_icon_my.png');
const pieceImg = require('./images/miners_icon_piece.png');

class CandidateList extends Component {
  static displayName = 'CandidateList';


  constructor(props) {
    super(props);

    this.state = {
      rowSelection: {
        mode: 'single',
        onChange: this.onChange.bind(this),
        onSelect: (selected, record, records) => {
          console.log('onSelect', selected, record, records);
        },
        selectedRowKeys: [],
        getProps: (record) => {
          return {
            disabled: record.id === 100306660941,
          };
        },
      },
      chainConfig: {},
      accounts: [],
      validProducerList: [],
      producerList: [],
      myVoteInfoSet: {},
      voteVisible: false,
      maxStakeTooltip: '',
      curAccount: { accountName: '' },
      toRegisterAccount: null,
      canVoteAccounts: [],
      canRegisterAccounts: [],
      dposInfo: {},
      accountMaxStake: 0,
      url: '',
      curBlock: {},

      txSendVisible: false,
      sendResult: null,
      txInfo: {},
      inputPasswordVisible: false,
      removeVoterVisible: false,
      registerProducerVisible: false,
      updateProducerVisible: false,
      unRegisterProducerVisible: false,
      changeProducerVisible: false,

      cancelVoteDisable: false,
      bMyProducer: false,
      bUnRegProducer: false,

      myProducers: [],
      myVoterAccounts: [],
      otherAccounts: [],

      passwordTooltip: '',

      myVoters2Producer: [],
      myRestVoters2Producer: [],

      keystoreList: [],

      votersOfAllCandidate: {},  // 所有候选者的投票者信息，包括我自己的候选者（如有的话）
      votersOfMyAccount: {},     // 所有本地账户的投票信息

      syncInterval: 5000,

      curSelectedCandidate: null,
      curEpoch: 0,
      duration: 0,

      curEpochDataOfCandiate: {},
    };
  }
  onChange(ids, records) {
    this.state.rowSelection.selectedRowKeys = ids;
    const candidateName = ids[0];
    this.state.bMyProducer = false;
    for (const account of this.state.accounts) {
      if (account.accountName == candidateName) {
        this.state.bMyProducer = true;
        break;
      }
    }
    this.state.bUnRegProducer = false;
    for (const candidate of this.state.producerList) {
      if (candidate.name == candidateName && candidate.type == 'freeze') {
        this.state.bUnRegProducer = true;
        break;
      }
    }
    this.setState({ curSelectedCandidate: records[0], rowSelection: this.state.rowSelection, bMyProducer: this.state.bMyProducer });
  }

  onSort(dataIndex, order) {
    const producerList = this.state.producerList.sort((a, b) => {
      const result = a[dataIndex] - b[dataIndex];
      return (order === 'asc') ? (result > 0 ? 1 : -1) : (result > 0 ? -1 : 1);
    });
    this.setState({
      producerList,
    });
  }
  componentDidMount = async () => {
    try {
      this.state.chainConfig = await oexchain.oex.getChainConfig();
      this.state.chainConfig.sysTokenID = 0;
  
      this.state.keystoreList = utils.loadKeystoreFromLS();
      const accountInfos = await utils.loadAccountsFromLS()
      for (const account of accountInfos) {
        account.label = account.accountName;
        account.value = account.accountName;
        const voters = await oexchain.dpos.getVotersByVoter(0, account.accountName, true);
        this.state.votersOfMyAccount[account.accountName] = voters == null ? [] : voters;
      }
      this.state.accounts = accountInfos;
  
      this.updateInfo();
      
      this.state.dposInfo = await oexchain.dpos.getDposInfo();
      this.state.duration = utils.getDuration(this.state.dposInfo.epochInterval);
    } catch (error) {
      Feedback.toast.error(error);
      console.log(error);
    }
  }

  updateCandidateInfo = () => {
    oexchain.dpos.getCandidates(0, true).then(candidates => {
      oexchain.dpos.getValidCandidates(0).then(validCandidates => {
        validCandidates.activatedCandidateSchedule.map(validCandidate => {
          this.state.votersOfAllCandidate[validCandidate] = [];
        });
        candidates.map(candidate => {
          candidate.isValid = this.state.votersOfAllCandidate[candidate.name] != null;
          candidate.isMyAccount = this.state.votersOfMyAccount[candidate.name] != null;
          oexchain.dpos.getEpochByHeight(candidate.number).then(epoch => {
            candidate.lastOpEpoch = epoch;
            this.setState({ producerList: candidates, txSendVisible: false });
          })          
        })

        let index = 0;
        validCandidates.activatedCandidateSchedule.map(validCandidate => {
          oexchain.dpos.getVotersByCandidate(0, validCandidate, true).then(voters => {
            this.state.votersOfAllCandidate[validCandidate] = voters;
          });
          oexchain.dpos.getActivedCandidate(0, index++).then(candidateData => {
            this.state.curEpochDataOfCandiate[candidateData.candidate] = candidateData;
          })
        });
        
        this.setState({ producerList: candidates, validProducerList: validCandidates.activatedCandidateSchedule, txSendVisible: false });
      });
    });
  }

  updateStatus = () => {
    this.updateInfo();
  }


  updateInfo = () => {
    oexchain.oex.getCurrentBlock(false).then(block => {
      this.state.curBlock = block;
      oexchain.dpos.getEpochByHeight(block.number).then(epoch => {
        this.setState({curEpoch: epoch, txSendVisible: false});
      });
    });
    this.updateCandidateInfo();
    //setTimeout(() => { this.updateInfo(); }, this.state.syncInterval);
  }

  vote = () => {
    if (this.state.rowSelection.selectedRowKeys.length === 0) {
      Feedback.toast.error(T('请选择需要投票的候选者账号'));
      return;
    }

    this.state.canVoteAccounts = [];
    this.state.accounts.map(account => this.state.canVoteAccounts.push({ label: account.accountName, value: account.accountName, originValue: account }));
    this.setState({ voteVisible: true, stake: 0, curAccount: { accountName: '' }, maxStakeTooltip: '' })
  }

  onVoteOK = () => {
    if (this.state.curAccount.accountName == '') {
      Feedback.toast.error(T('请选择投票账户'));
      return;
    }
    let stake = parseInt(this.state.stake);
    if (stake <= 0 || stake > this.state.accountMaxStake) {
      Feedback.toast.error(T('请输入有效的投票数'));
      return;
    }
    const candidateName = this.state.rowSelection.selectedRowKeys[0];
    stake = '0x' + new BigNumber(stake).shiftedBy(this.state.chainConfig.sysTokenDecimal).multipliedBy(new BigNumber(this.state.dposInfo.unitStake)).toString(16);
    const payload = '0x' + encode([candidateName, stake]).toString('hex');
    let txInfo = {actionType: Constant.VOTE_CANDIDATE, 
                  accountName: this.state.curAccount.accountName, 
                  toAccountName: this.state.dposInfo.accountName,
                  assetId: this.state.chainConfig.sysTokenID,
                  amount: 0,
                  payload};
    this.setState({ txSendVisible: true, txInfo, sendResult: this.onVoteClose.bind(this)})
  }

  onVoteClose = () => {
    this.setState({ voteVisible: false, txSendVisible: false, })
  }

  registerProducer = () => {
    this.state.canRegisterAccounts = [];
    this.state.accounts.map(account => {
      let existCandidate = false;
      for (let i = 0; i < this.state.producerList.length; i++) {
        if (this.state.producerList[i].name == account.accountName) {
          existCandidate = true;
          break;
        }
      }
      if (!existCandidate) {
        this.state.canRegisterAccounts.push({ label: account.accountName, value: account.accountName, originValue: account });
      }
    });
    this.setState({ maxStakeTooltip: '', registerProducerVisible: true, curAccount: { accountName: '' }, stake: 0, txSendVisible: false })
  }

  onRegisterProducerOK = () => {
    if (this.state.curAccount.accountName == '') {
      Feedback.toast.error(T('请选择注册账户'));
      return;
    }

    let stake = parseInt(this.state.stake);
    if (stake != this.state.dposInfo.candidateMinQuantity) {
      Feedback.toast.error(T('请输入有效的抵押票数:' + this.state.dposInfo.candidateMinQuantity));
      return;
    }

    stake = new BigNumber(stake).shiftedBy(this.state.chainConfig.sysTokenDecimal).multipliedBy(new BigNumber(this.state.dposInfo.unitStake));
    if (stake.comparedTo(new BigNumber(0)) > 0) {
      stake = '0x' + stake.toString(16);
    } else {
      stake = 0;
    }
    const payload = '0x' + (!utils.isEmptyObj(this.state.url) ? encode([this.state.url]).toString('hex') : encode(['']).toString('hex'));

    let txInfo = {actionType: Constant.REG_CANDIDATE, 
      accountName: this.state.curAccount.accountName, 
      toAccountName: this.state.dposInfo.accountName,
      assetId: this.state.chainConfig.sysTokenID,
      amount: stake,
      payload};
    this.setState({ txSendVisible: true, txInfo, sendResult: this.onRegisterProducerClose.bind(this)})
  }

  onRegisterProducerClose = () => {
    this.setState({ registerProducerVisible: false, txSendVisible: false })
  }

  updateProducer = () => {
    if (this.state.rowSelection.selectedRowKeys.length === 0) {
      Feedback.toast.error(T('请选择需要更新的候选者账号'));
      return;
    }
    const candidateName = this.state.rowSelection.selectedRowKeys[0];
    for (const candidate of this.state.producerList) {
      if (candidate.name == candidateName) {
        this.state.url = candidate.url;
        break;
      }
    }
    oexchain.account.getAccountByName(candidateName, true).then(async (account) => {
      const ftBalance = await this.getAccountStake(account);
      const accountMaxStake = ftBalance.shiftedBy(this.state.chainConfig.sysTokenDecimal * -1).dividedBy(this.state.dposInfo.unitStake).toNumber();
      this.setState({ updateProducerVisible: true, curAccount: { accountName: candidateName }, stake: 0, maxStakeTooltip: T('最多可增加的抵押票数') + ':' + accountMaxStake, accountMaxStake, txSendVisible: false });
    });
  }

  onUpdateProducerOK = () => {
    let stake = parseInt(this.state.stake);
    if (stake > this.state.accountMaxStake) {
      Feedback.toast.error(T('新增抵押票数不可超过最大可抵押票数'));
      return;
    }
    stake = new BigNumber(stake).shiftedBy(this.state.chainConfig.sysTokenDecimal).multipliedBy(new BigNumber(this.state.dposInfo.unitStake));
    if (stake.comparedTo(new BigNumber(0)) > 0) {
      stake = stake.toString(16);
    } else {
      stake = 0;
    }
    const payload = '0x' + (!utils.isEmptyObj(this.state.url) ? encode([this.state.url]).toString('hex') : '');

    let txInfo = {actionType: Constant.UPDATE_CANDIDATE, 
      accountName: this.state.curAccount.accountName, 
      toAccountName: this.state.dposInfo.accountName,
      assetId: this.state.chainConfig.sysTokenID,
      amount: stake,
      payload};
    this.setState({ txSendVisible: true, txInfo, sendResult: this.onUpdateProducerClose.bind(this)});
  }

  onUpdateProducerClose = () => {
    this.setState({ updateProducerVisible: false, txSendVisible: false });
  }

  unRegisterProducer = () => {
    if (this.state.rowSelection.selectedRowKeys.length === 0) {
      Feedback.toast.error(T('请选择需要注销的候选者账号'));
      return;
    }
    const accountName = this.state.rowSelection.selectedRowKeys[0];
    let txInfo = {actionType: Constant.UNREG_CANDIDATE, 
      accountName, 
      toAccountName: this.state.dposInfo.accountName,
      assetId: this.state.chainConfig.sysTokenID,
      amount: 0,
      payload: '0x'};
    this.setState({ txSendVisible: true, txInfo, curAccount: { accountName: accountName }, sendResult: () => {this.setState({ txSendVisible: false })} });
  }

  refundReposit = async () => {
    if (this.state.rowSelection.selectedRowKeys.length === 0) {
      Feedback.toast.error(T('请选择已注销的候选者账号'));
      return;
    }

    const freezeEpoch = await oexchain.dpos.getEpochByHeight(this.state.curSelectedCandidate.number);
    let passedEpochNum = 0;
    try {
      let nextEpoch = await oexchain.dpos.getNextEpoch(freezeEpoch);
      while (nextEpoch <= this.state.curEpoch) {
        passedEpochNum++;
        nextEpoch = await oexchain.dpos.getNextEpoch(nextEpoch);
      }
    } catch (error) {
      console.log(error);
    }

    if (passedEpochNum < this.state.dposInfo.freezeEpochSize) {
      Feedback.toast.error(T('当前周期无法提取抵押金，还需') + (this.state.dposInfo.freezeEpochSize - passedEpochNum) + T('个周期后才能提取'));
      return;
    }

    const accountName = this.state.rowSelection.selectedRowKeys[0];
    let txInfo = {actionType: Constant.REFUND_DEPOSIT, 
      accountName, 
      toAccountName: this.state.dposInfo.accountName,
      assetId: this.state.chainConfig.sysTokenID,
      amount: 0,
      payload: '0x'};
    this.setState({ txSendVisible: true, txInfo, curAccount: { accountName: accountName }, sendResult: () => {this.setState({ txSendVisible: false })}});
  }

  getReward = () => {
    if (this.state.rowSelection.selectedRowKeys.length === 0) {
      Feedback.toast.error(T('请选择已注销的候选者账号'));
      return;
    }
    const accountName = this.state.rowSelection.selectedRowKeys[0];
    const payload = '0x' + oexchain.utils.getContractPayload('producersGetReward', [], []);
    this.state.txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: 'dposcontract.reward',
      assetId: this.state.chainConfig.sysTokenID,
      amount: 0,
      payload };
    this.setState({ txSendVisible: true, curAccount: { accountName: accountName } });
  }

  getAccountStake = async (account) => {
    const stake = await oexchain.dpos.getAvailableStake(0, account.accountName);
    return new BigNumber(stake);
  }

  onAccountChange = async (value, option) => {
    this.state.curAccount = option.originValue;
    const unitStake = new BigNumber(this.state.dposInfo.unitStake);
    
    const ftBalance = await this.getAccountStake(this.state.curAccount);    
    const accountMaxStake = ftBalance.shiftedBy(this.state.chainConfig.sysTokenDecimal * -1).dividedBy(unitStake).toNumber();
    this.setState({ maxStakeTooltip: T('最大可投票数') + accountMaxStake, accountMaxStake, txSendVisible: false });
  };

  handleStakeChange = (v) => {
    this.state.stake = v;
  }

  handleURLChange = (v) => {
    this.state.url = v;
  }

  onProducerChange = async (value, option) => {
    this.state.curAccount = option.originValue;
    const unitStake = new BigNumber(this.state.dposInfo.unitStake);
    const ftBalance = await this.getAccountStake(this.state.curAccount);    
    
    const accountMaxStake = ftBalance.shiftedBy(this.state.chainConfig.sysTokenDecimal * -1).dividedBy(unitStake).toNumber();
    if (this.state.dposInfo.candidateMinQuantity > accountMaxStake) {
      Feedback.toast.error(T('此账户无足够抵押票数，不可申请候选者，最低抵押票数为:') + this.state.dposInfo.candidateMinQuantity);
      return;
    }
    this.setState({ maxStakeTooltip: this.state.dposInfo.candidateMinQuantity + T('<= 可抵押票数 <=') + accountMaxStake, accountMaxStake, txSendVisible: false });
  }

  onVoterChange = (v) => {
    this.state.voter = v;
    this.setState({ passwordTooltip: v });
  }

  counterRender = (value, index, record) => {
    if (record.shouldCounter == 0) {
      return value;
    }

    const counterRatio = new BigNumber(record.actualCounter).div(new BigNumber(record.shouldCounter))
                        .multipliedBy(new BigNumber(100)).toFixed(2) + '%';

    let curEpochData = this.state.curEpochDataOfCandiate[record.name];
    let curEpochActualCounter = 0;
    let curEpochRatio = 0;
    if (curEpochData != null) {
      curEpochActualCounter = curEpochData.actualCount;
      if (curEpochData.shouldCount > 0) {
        curEpochRatio = new BigNumber(curEpochData.actualCount).div(new BigNumber(curEpochData.shouldCount))
                        .multipliedBy(new BigNumber(100)).toFixed(2) + '%';
      }
    }
    
    return <view>
            [{T('总出块数')}:{value}]<p/>[{T('总出块率')}:{counterRatio}]
            <p/>
            [{T('本周期出块数')}:{curEpochActualCounter}]<p/>[{T('本周期出块率')}:{curEpochRatio}]
           </view>; 
  }
  shouldCounterRender = (value, index, record) => {
    let curEpochData = this.state.curEpochDataOfCandiate[record.name];
    let curEpochShouldCounter = 0;
    if (curEpochData != null) {
      curEpochShouldCounter = curEpochData.shouldCount;
    }
    return <view>
            [{T('总应出块数')}:{value}]<p/>[{T('本周期应出块数')}:{curEpochShouldCounter}]
           </view>; 
  }

  typeRender = (value, index, record) => {
    if (value == 'normal') {
      return T('正常');
    }
    if (value == 'freeze') {
      return T('已注销，尚未提取抵押金');
    }
  }

  numberRender =  (value, index, record) => {
    return <view>{value}<p/>[{T('所在周期')}:{record.lastOpEpoch}]</view>;
  }

  nameRender = (value, index, record) => {
    if (record.isValid) {
      if (record.isMyAccount) {
        return (
          <div>
            <img src={myImg} style={{ marginRight: '10px' }} />
            <img src={isapieceofImg} style={{ marginRight: '10px' }} />
            <p/>
            {value}
          </div>
        );
      }
      return (
        <div>
          <img src={isapieceofImg} style={{ marginRight: '10px' }} />
          <p/>
          {value}
        </div>
      );
    }
    if (record.isMyAccount) {
      return (
        <div>
          <img src={myImg} style={{ marginRight: '10px' }} />
          <img src={alternativenodesImg} style={{ marginRight: '10px' }} />
          <p/>
          {value}
        </div>
      );
    } else {
      return (
        <div>
          <img src={alternativenodesImg} style={{ marginRight: '10px' }} />
          <p/>
          {value}
        </div>
      );
    }
  }
  renderMyVote = (candidateName) => {
    let render = [];
    Object.keys(this.state.votersOfMyAccount).forEach(accountName => {
      for (const voteInfo of this.state.votersOfMyAccount[accountName]) {
        if (voteInfo.candidate == candidateName) {
          const defaultTrigger = <Tag type="normal" size="small">{voteInfo.name}{T('投')}{voteInfo.quantity}{T('票')}</Tag>;
          render.push(<div><Balloon trigger={defaultTrigger} closable={false}>{T('我的投票账户')}:{voteInfo.name}, {T('投票数')}:{voteInfo.quantity}</Balloon><p/></div>);
          break;
        }
      }
    });
    return render;
  }
  render() {
    const {t} = this.props;
    return (
      <div className='contain' sytle={styles.all}>
        <div className='mainContainer'> 
          <div className='leftBg'><img src={isChinese() ? leftBg : leftBgEn} width='519'/></div>
          <div className='cicles'>
            <div class='titleSign'></div>
            <div className='titles'>
              <div className='mainText'>{t('cicles',{cicle: this.state.curEpoch})}</div>
              <div className='subText'>{T('一个周期时长')}:{this.state.duration}</div>
            </div>
          </div>
          <IceContainer className='listContain' style={{...styles.table}}>
            <Row justify="space-between" align='center' style={{borderRadius: 20, padding: '20px'}}>
              <Button type="primary" onClick={this.updateStatus.bind(this)} style={styles.btn}>
                <Icon type="refresh" />{T('刷新')}
              </Button>
              <Row align='center'>
                <img src={pieceImg} style={{ marginRight: '5px' }}/>{T("可出块节点")}
                <img src={isapieceofImg} style={{ marginLeft: '20px', marginRight: '5px' }} />{T("正在出块的节点")}
                <img src={myImg} style={{ marginLeft: '20px', marginRight: '5px' }} />{T("我的节点")}
                <img src={alternativenodesImg} style={{ marginLeft: '20px', marginRight: '5px' }} />{T("备选节点")}
              </Row>
              {/* <Button style={styles.btn} type="primary" onClick={this.vote.bind(this)} disabled={this.state.bUnRegProducer}>
              {T('投票')}
              </Button>
              <Button style={styles.btn} type="secondary" onClick={this.registerProducer.bind(this)}>
              {T('注册候选者')}
              </Button>
              <Button style={styles.btn} type="secondary" onClick={this.updateProducer.bind(this)} disabled={!this.state.bMyProducer || this.state.bUnRegProducer}>
              {T('更新候选者')}
              </Button>
              <Button style={styles.btn} type="secondary" onClick={this.unRegisterProducer.bind(this)} disabled={!this.state.bMyProducer || this.state.bUnRegProducer}>
              {T('注销候选者')}
              </Button>
              <Button style={styles.btn} type="secondary" onClick={this.refundReposit.bind(this)} disabled={!this.state.bMyProducer || !this.state.bUnRegProducer}>
              {T('取回抵押金')}
              </Button> */}
                {/* &nbsp;&nbsp;
              <Button type="primary" onClick={this.getReward.bind(this)} disabled={!this.state.bMyProducer || this.state.bUnRegProducer}>
              {T('提取奖励')}
              </Button> */}
                
            </Row>
            <Row style={{marginBottom: '10px', width: '100%'}}>
              <Table primaryKey="name" language={T('zh-cn')} style={{width: '100%'}}
                isZebra={false}  hasBorder={false} 
                dataSource={this.state.producerList}
                rowSelection={this.state.rowSelection}
                onSort={this.onSort.bind(this)}
                emptyContent={<Nodata />}
              >
                <Table.Column title={T("候选者账号")} dataIndex="name" width={100} cell={this.nameRender.bind(this)} />
                <Table.Column title="URL" dataIndex="url" width={80} />
                <Table.Column title={T("状态")} dataIndex="type" width={120} cell={this.typeRender.bind(this)}/>
                <Table.Column title={T("抵押票数")} dataIndex="quantity" width={90} sortable />
                <Table.Column title={T("总投票数")} dataIndex="totalQuantity" width={60} sortable />
                <Table.Column title={T("最近一次DPOS相关操作的区块高度")} dataIndex="number" width={130} cell={this.numberRender.bind(this)} />
                <Table.Column title={T("实出块数")} dataIndex="actualCounter" width={160} sortable cell={this.counterRender.bind(this)} />
                <Table.Column title={T("应出块数")} dataIndex="shouldCounter" width={130} sortable cell={this.shouldCounterRender.bind(this)}  />
                <Table.Column title={T("我的投票")} dataIndex="name" width={100} cell={this.renderMyVote.bind(this)} />
              </Table>
            </Row>
            
          </IceContainer>
        </div>
        <Dialog language={T('zh-cn')}
          visible={this.state.voteVisible}
          title={T("投票")}
          footerActions={['ok', 'cancel']}
          footerAlign="center"
          closeable="esc,mask,close"
          onOk={this.onVoteOK.bind(this)}
          onCancel={this.onVoteClose.bind(this)}
          onClose={this.onVoteClose.bind(this)}
        >
          <Select language={T('zh-cn')} style={{...styles.selectBoder, width: '100%'}}
            placeholder={T("选择您可投票的账户")}
            onChange={this.onAccountChange.bind(this)}
            dataSource={this.state.canVoteAccounts}
          />
          <br />
          <br />
          <Input hasClear trim  style={styles.inputBoder}
            placeholder={this.state.maxStakeTooltip}
            onChange={this.handleStakeChange.bind(this)}
            innerBefore={T("投票数")}
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onVoteOK.bind(this)}
          />
        </Dialog>

        <Dialog language={T('zh-cn')}
          visible={this.state.registerProducerVisible}
          title={T("注册候选者")}
          footerActions={['ok', 'cancel']}
          footerAlign="center"
          closeable="esc,mask,close"
          onOk={this.onRegisterProducerOK.bind(this)}
          onCancel={this.onRegisterProducerClose.bind(this)}
          onClose={this.onRegisterProducerClose.bind(this)}
        >
          <Select language={T('zh-cn')}
            style={{...styles.selectBoder, width: '100%'}}
            placeholder={T("选择待注册为候选者的账户")}
            onChange={this.onProducerChange.bind(this)}
            dataSource={this.state.canRegisterAccounts}
          />
          <br />
          <br />
          <Input hasClear style={styles.inputBoder}
            onChange={this.handleURLChange.bind(this)}
            innerBefore={T("节点信息(可选)")}
            defaultValue=""
            maxLength={this.state.dposInfo.maxURLLen}
            hasLimitHint
          />
          <br />
          <br />
          <Input hasClear style={styles.inputBoder}
            trim
            placeholder={T('抵押票数固定为50万OEX')}
            onChange={this.handleStakeChange.bind(this)}
            innerBefore={T("抵押票数")}
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onRegisterProducerOK.bind(this)}
          />
        </Dialog>
        <Dialog language={T('zh-cn')}
          visible={this.state.updateProducerVisible}
          title={T("更新候选者")}
          footerActions={['ok', 'cancel']}
          footerAlign="center"
          closeable="esc,mask,close"
          onOk={this.onUpdateProducerOK.bind(this)}
          onCancel={this.onUpdateProducerClose.bind(this)}
          onClose={this.onUpdateProducerClose.bind(this)}
        >
          <Input hasClear style={styles.inputBoder}
            onChange={this.handleURLChange.bind(this)}
            innerBefore="节点信息"
            defaultValue={this.state.url}
            maxLength={this.state.dposInfo.maxURLLen}
            hasLimitHint
          />
          <br />
          <br />
          <Input hasClear trim style={styles.inputBoder}
            placeholder={this.state.maxStakeTooltip}
            onChange={this.handleStakeChange.bind(this)}
            innerBefore={T("增加抵押票数")}
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onUpdateProducerOK.bind(this)}
          />
        </Dialog>
        <TxSend sendResult={this.state.sendResult} visible={this.state.txSendVisible} accountName={this.state.curAccount.accountName} txInfo={this.state.txInfo}/>
      </div>
    );
  }
}

const styles = {
  all: {
    height: 'auto',
    background: '#f5f6fa',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop:'334px',
  },
  banner: {
    width: '100%', 
    height: '310px', 
    paddingBottom: '-30px',
    backgroundColor: '#080a20',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center'
  },
  table: {
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    //alignItems: 'start'
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
  btn: {
    marginRight: '20px',
    borderRadius: '20px'
  },
  inputBoder: {
    borderBottom: '1px solid #dbdbdb',
    borderTop: '0px',
    borderLeft: '0px',
    borderRight: '0px',
  },
  selectBoder: {
    borderBottom: '1px solid #dbdbdb',
    borderTop: '0px',
    borderLeft: '0px',
    borderRight: '0px',
  },
  dialogBtn: {
    width: '100%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: '#5c67f2'
  }
};

export default withTranslation()(CandidateList);