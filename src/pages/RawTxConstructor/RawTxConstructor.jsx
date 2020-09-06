/* eslint-disable no-restricted-syntax */
import React, { Component } from 'react';
import { Input, Feedback, Select } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import { Button } from '@alifd/next';
import { encode } from 'rlp';
import * as oexchain from 'oex-web3';
import * as ethUtil from 'ethereumjs-util';
import BigNumber from 'bignumber.js';
import copy from 'copy-to-clipboard';
import cookie from 'react-cookies';
import * as Constant from '../../utils/constant';
import * as utils from '../../utils/utils';
import { T } from '../../utils/lang';

const txTypes = [{ value: Constant.TRANSFER, label: '转账'},{value: Constant.CREATE_CONTRACT,label: '创建合约'},
                { value: Constant.CREATE_NEW_ACCOUNT, label: '创建账户' },{ value: Constant.UPDATE_ACCOUNT, label: '更新账户'},
                { value: Constant.UPDATE_ACCOUNT_AUTHOR, label: '更新账户权限' },
                { value: Constant.ISSUE_ASSET, label: '发行资产' },{ value: Constant.INCREASE_ASSET, label: '增发资产' },
                { value: Constant.DESTORY_ASSET, label: '销毁资产' },{ value: Constant.UPDATE_ASSET_CONTRACT, label: '更新资产合约' },
                { value: Constant.SET_ASSET_OWNER, label: '设置资产所有者' },{ value: Constant.SET_ASSET_FOUNDER, label: '设置资产创办者' },
                { value: Constant.REG_CANDIDATE, label: '注册候选者' },
                { value: Constant.UPDATE_CANDIDATE, label: '更新候选者' },{ value:  Constant.UNREG_CANDIDATE, label: '注销候选者' },
                { value: Constant.VOTE_CANDIDATE, label: '给候选者投票' },
                { value: Constant.REFUND_DEPOSIT, label: '取回抵押金' }];

const getMethods = ['account_accountIsExist',
                    'account_getAccountByName',
                    'account_getAccountByID',
                    'account_getCode',
                    'account_getNonce',
                    'account_getAssetInfoByName',
                    'account_getAssetInfoByID',
                    'account_getAccountBalanceByID',
                    'account_getAccountBalanceByTime',
                    'account_getAssetAmountByTime',
                    'account_getSnapshotTime',
                    'ft_sendRawTransaction',
                    'ft_getBlockByHash',
                    'ft_getBlockByNumber',
                    'ft_getCurrentBlock',
                    'ft_getTransactionByHash',
                    'ft_getTransactionReceipt',
                    'ft_getBlockAndResultByNumber',
                    'ft_getTxsByAccount',
                    'ft_getTxsByBloom',
                    'ft_getInternalTxByAccount',
                    'ft_getInternalTxByBloom',
                    'ft_getInternalTxByHash',
                    'ft_gasPrice',
                    'ft_call',
                    'ft_estimateGas',
                    'ft_getChainConfig',
                    'dpos_info',
                    'dpos_irreversible',
                    'dpos_votersByCandidate',
                    'dpos_votersByCandidateByNumber',
                    'dpos_votersByVoter',
                    'dpos_votersByVoterByNumber',
                    'dpos_candidates',
                    'dpos_candidate',
                    'dpos_availableStake',
                    'dpos_availableStakeByNumber',
                    'dpos_validCandidates',
                    'dpos_validCandidatesByHeight',
                    'dpos_nextValidCandidates',
                    'dpos_nextValidCandidatesByNumber',
                    'dpos_snapShotTime',
                    'dpos_snapShotTimeByNumber',
                    'fee_getObjectFeeByName',
                    'fee_getObjectFeeResult',
                    'fee_getObjectFeeResultByTime'];

const checkMethods = [ 'equalstr', 'equalint', 'equalbool', 'add', 'sub', 'mul', 'div', 'muladd' ];

const testSceneTag = 'testScene';

export default class RawTxConstructor extends Component {
  static displayName = 'RawTxConstructor';

  constructor(props) {
    super(props);

    const privateKeyStr = cookie.load('privateKey');
    const actionCookieObj = cookie.load('actionHistoryInfo');
    const privateKeyInfoSet = cookie.load('privateKeyInfoSet');
    this.state = {
      htmlType: 'password',
      showPrivateKeyTip: '显示私钥',
      txResult: '',
      txInfo: '',
      payload: '',
      privateKey: privateKeyStr,
      receipt: '',
      txTypeInfos: txTypes,
      selectedTypeValue: null,
      payloadInfos: [],
      payloadElements: [],
      updateAuthorTypes: [{value:0, label:'添加权限'}, {value:1, label:'更新权限'}, {value:2, label:'删除权限'}],
      resultTypes: [{value:0, label:'失败'}, {value:1, label:'成功'}],
      checkProcedure: '',
      historyInfo: {},
      testScene: '',
      privateKeyInfoSet: privateKeyInfoSet != null ? JSON.stringify(privateKeyInfoSet) : '',
      actionCookie: actionCookieObj != null ? actionCookieObj : {},
      sendObjIndex: 0,
      getObjIndex: 0,
      checkObjIndex: 0,
      zeroNum: 18,

      accountPrefix: '',
    };
    if (actionCookieObj != null) {
      Object.keys(actionCookieObj).map(key => {
        this.state[key] = actionCookieObj[key];
      });
    }
  }
  componentDidMount = async () => {
    const chainConfig = await oexchain.oex.getChainConfig();
    oexchain.oex.setChainId(chainConfig.chainId);
    const testSceneStr = JSON.stringify(cookie.load(testSceneTag));
    if (!utils.isEmptyObj(testSceneStr)) {
      this.setState({ testScene: testSceneStr });
    }
  }
  rlpEncode = () => {
    const payloadInfos = this.state.payload.split(',');
    const encodeInfos = [];
    for (const payloadInfo of payloadInfos) {
      let payload = payloadInfo.trim();
      if (payload.charAt(0) === '"' && payload.charAt(payload.length - 1) === '"') {
        payload = payload.substr(1, payload.length - 2);
        encodeInfos.push(payload);
      } else {
        const number = new BigNumber(payload);
        encodeInfos.push(number.toNumber());
      }
    }
    let rlpData = encode(encodeInfos);
    rlpData = `0x${rlpData.toString('hex')}`;
    copy(rlpData);
    Feedback.toast.success('rlp编码结果已拷贝到剪贴板');
  }

  handlePayloadChange = (v) => {
    this.state.payload = v;
  }

  handlePrivateKeyChange = (v) => {
    this.state.privateKey = v;
    cookie.save('privateKey', v);
  }

  handleTxUriChange = (v) => {
    this.state.txUri = v;
  }

  parseUri = async () => {
    if (utils.isEmptyObj(this.state.txUri)) {
      Feedback.toast.error('请输入交易URI');
      return;
    }
    let txUri = this.state.txUri.trim();
    const startHeadStr = 'oex://oexchain/';
    if (txUri.indexOf(startHeadStr) != 0) {
      Feedback.toast.error('URI格式有误');
      return;
    } else {
      txUri = txUri.substr(startHeadStr.length);
    }
    let index = txUri.indexOf('/');
    const typestr = txUri.substr(0, index);
    let contractAccount = null;
    if (typestr != 'oexchain.account' && typestr != 'oexchain.asset' && typestr != 'oexchain.dpos' && typestr != 'oex.contract') {
      contractAccount = await oexchain.account.getAccountByName(typeStr);
      if (contractAccount == null) {
        Feedback.toast.error('URI内容有误:' + typestr);
        return;
      } else if (contractAccount.codeSize == 0) {        
        Feedback.toast.error('此账号尚未部署合约，无法进行接口调用');
        return;
      }
    }
    txUri = txUri.substr(index + 1);
    index = txUri.indexOf('?');
    if (index < 1) {
      Feedback.toast.error('URI格式有误');
      return;
    }
    let functionName = '';
    const actionStr = txUri.substr(0, index);
    txUri = txUri.substr(index + 1);
    const reg = /([^?&=]+)=([^?&=]+)*/g;
    let kvs = this.getKeyValues(txUri, reg);
    this.state['assetId'] = kvs['__assetId'];
    this.state['amount'] = kvs['__amount'];
    this.state['remark'] = kvs['__remark'];
    switch(actionStr) {
      case 'createAccount':
        this.state.selectedTypeValue = Constant.CREATE_NEW_ACCOUNT;
        this.state['toAccountName'] = 'oexchain.account';
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 0] = { value: kvs['accountName'], isNumber: false, payloadName: 'newAccountName' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 1] = { value: kvs['founder'], isNumber: false, payloadName: 'founder' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 2] = { value: kvs['publicKey'], isNumber: false, payloadName: 'publicKey' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 3] = { value: kvs['description'], isNumber: false, payloadName: 'desc' };
        break;
      case 'updateAccount':
        this.state.selectedTypeValue = Constant.UPDATE_ACCOUNT;
        this.state['toAccountName'] = 'oexchain.account';
        this.state[Constant.UPDATE_ACCOUNT  + '-' + 0] = { value: kvs['founder'], isNumber: false, payloadName: 'founder' };
        break;
      case 'updateAccountAuthor':
        this.state.selectedTypeValue = Constant.UPDATE_ACCOUNT_AUTHOR;
        this.state['toAccountName'] = 'oexchain.account';
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 0] = { value: kvs['threshold'], isNumber: true, payloadName: 'threshold' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 1] = { value: kvs['updateAuthorThreshold'], isNumber: true, payloadName: 'updateThreshold' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 2] = { value: kvs['actionType'], isNumber: true, payloadName: 'opType' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 4] = { value: kvs['owner'], isNumber: false, payloadName: 'opContent' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 5] = { value: kvs['weight'], isNumber: true, payloadName: 'weight' };
        break;
      case 'issueAsset':
        this.state.selectedTypeValue = Constant.ISSUE_ASSET;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state[Constant.ISSUE_ASSET + '-' + 0] = { value: kvs['assetName'], isNumber: false, payloadName: 'assetName' };
        this.state[Constant.ISSUE_ASSET + '-' + 1] = { value: kvs['symbol'], isNumber: false, payloadName: 'symbol' };
        this.state[Constant.ISSUE_ASSET + '-' + 2] = { value: kvs['amount'], isNumber: true, payloadName: 'amount' };
        this.state[Constant.ISSUE_ASSET + '-' + 3] = { value: kvs['decimals'], isNumber: true, payloadName: 'decimals' };
        this.state[Constant.ISSUE_ASSET + '-' + 4] = { value: kvs['founder'], isNumber: false, payloadName: 'founder' };
        this.state[Constant.ISSUE_ASSET + '-' + 5] = { value: kvs['owner'], isNumber: false, payloadName: 'owner' };
        this.state[Constant.ISSUE_ASSET + '-' + 6] = { value: kvs['upperLimit'], isNumber: true, payloadName: 'upperLimit' };
        this.state[Constant.ISSUE_ASSET + '-' + 7] = { value: kvs['contract'], isNumber: false, payloadName: 'contractName' };
        this.state[Constant.ISSUE_ASSET + '-' + 8] = { value: kvs['description'], isNumber: false, payloadName: 'desc' };
        break;
      case 'increaseAsset':
        this.state.selectedTypeValue = Constant.INCREASE_ASSET;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state[Constant.INCREASE_ASSET + '-' + 0] = { value: kvs['assetId'], isNumber: true, payloadName: 'assetId' };
        this.state[Constant.INCREASE_ASSET + '-' + 1] = { value: kvs['amount'], isNumber: true, payloadName: 'amount' };
        this.state[Constant.INCREASE_ASSET + '-' + 2] = { value: kvs['to'], isNumber: false, payloadName: 'accountName' };
        break;
      case 'setAssetOwner':
        this.state.selectedTypeValue = Constant.SET_ASSET_OWNER;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state[Constant.SET_ASSET_OWNER + '-' + 0] = { value: kvs['assetId'], isNumber: true, payloadName: 'assetId' };
        this.state[Constant.SET_ASSET_OWNER + '-' + 1] = { value: kvs['owner'], isNumber: false, payloadName: 'accountName' };
        break;
      case 'updateAsset':
        this.state.selectedTypeValue = Constant.SET_ASSET_FOUNDER;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state[Constant.SET_ASSET_FOUNDER + '-' + 0] = { value: kvs['assetId'], isNumber: true, payloadName: 'assetId' };
        this.state[Constant.SET_ASSET_FOUNDER + '-' + 1] = { value: kvs['founder'], isNumber: false, payloadName: 'accountName' };
        break;
      case 'destroyAsset':
        this.state.selectedTypeValue = Constant.DESTORY_ASSET;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state['default' + '-' + 0] = { value: '', isNumber: false, payloadName: 'payload' };
        break;
      case 'updateAssetContract':
        this.state.selectedTypeValue = Constant.UPDATE_ASSET_CONTRACT;
        this.state['toAccountName'] = 'oexchain.asset';
        this.state[Constant.UPDATE_ASSET_CONTRACT + '-' + 0] = { value: kvs['assetId'], isNumber: true, payloadName: 'assetId' };
        this.state[Constant.UPDATE_ASSET_CONTRACT + '-' + 1] = { value: kvs['contract'], isNumber: false, payloadName: 'contract' };
        break;
      case 'transfer':
        this.state.selectedTypeValue = Constant.TRANSFER;
        this.state['toAccountName'] = kvs['__to'];
        this.state['default' + '-' + 0] = { value: '', isNumber: false, payloadName: 'payload' };
        break;
      case 'regCandidate':
        this.state.selectedTypeValue = Constant.REG_CANDIDATE;
        this.state['toAccountName'] = 'oexchain.dpos';
        this.state[Constant.REG_CANDIDATE + '-' + 0] = { value: kvs['url'], isNumber: false, payloadName: 'url' };
        break;
      case 'updateCandidate':
        this.state.selectedTypeValue = Constant.UPDATE_CANDIDATE;
        this.state['toAccountName'] = 'oexchain.dpos';
        this.state[Constant.UPDATE_CANDIDATE + '-' + 0] = { value: kvs['url'], isNumber: false, payloadName: 'url' };
        break;
      case 'unregCandidate':
        this.state.selectedTypeValue = Constant.UNREG_CANDIDATE;
        this.state['toAccountName'] = 'oexchain.dpos';
        this.state['default' + '-' + 0] = { value: '', isNumber: false, payloadName: 'payload' };
        break;
      case 'refundCandidate':
        this.state.selectedTypeValue = Constant.REFUND_DEPOSIT;
        this.state['toAccountName'] = 'oexchain.dpos';
        this.state['default' + '-' + 0] = { value: '', isNumber: false, payloadName: 'payload' };
        break;
      case 'voteCandidate':
        this.state.selectedTypeValue = Constant.VOTE_CANDIDATE;
        this.state['toAccountName'] = 'oexchain.dpos';
        this.state[Constant.VOTE_CANDIDATE + '-' + 0] = { value: kvs['candidate'], isNumber: false, payloadName: 'accountName' };
        this.state[Constant.VOTE_CANDIDATE + '-' + 1] = { value: kvs['stake'], isNumber: true, payloadName: 'voteNumber' };
        break;
      case 'kickedCandidate':
        this.state['toAccountName'] = 'oexchain.dpos';
        break;
      case 'exitTakeOver':
        this.state['toAccountName'] = 'oexchain.dpos';
        break;
      case 'removeKickedCandidate':
        this.state['toAccountName'] = 'oexchain.dpos';
        break;
      case 'createContract':
        break;
      default:
        if (contractAccount != null) {
          functionName = actionStr;
        } else {
          Feedback.toast.error('交易类型' + actionStr + '有误');
          return;
        }
    }
    this.onChangeTxType(this.state.selectedTypeValue);
    // this.forceUpdate();
  }

  getKeyValues = (str, reg) => {
    var result = {};
    for (var kv = reg.exec(str); kv != null; kv = reg.exec(str)) {
      result[kv[1].trim()] = kv[2].trim();
    }
    return result;
  }

  getNumber = (numberStr) => {
    // return numberStr;
    if (utils.isEmptyObj(numberStr)) {
      return 0;
    }
    return new BigNumber(numberStr).toNumber();
  }

  hasPayloadTx = (actionType) => {
    return actionType != Constant.TRANSFER && actionType != Constant.UNREG_CANDIDATE 
        && actionType != Constant.REFUND_DEPOSIT && actionType != Constant.DESTORY_ASSET;
  }

  hasUselessPayloadTx = (actionType) => {
    return actionType == Constant.TRANSFER || actionType == Constant.UNREG_CANDIDATE 
        || actionType == Constant.REFUND_DEPOSIT || actionType == Constant.DESTORY_ASSET;
  }

  // const payload = '0x' + encode([threshold, updateAuthorThreshold, [UpdateAuthorType.Delete, [owner, weight]]]).toString('hex');
  generateTxInfo = () => {
    try {
      if (this.state.actionType == null) {
        Feedback.toast.error('请选择交易类型');
        return;
      }
      const actionType = this.state['actionType'];
      this.state.payloadElements = [];
      let payloadDetailInfoList = [];
      if (actionType == Constant.UPDATE_ACCOUNT_AUTHOR) {  // 如果是设置账号权限，由于payload构造特殊，故需要单独编码
        const threshold = this.getNumber(this.state[actionType + '-' + 0].value);
        const updateAuthorThreshold = this.getNumber(this.state[actionType + '-' + 1].value);
        const updateAuthorType = this.getNumber(this.state[actionType + '-' + 2].value);
        const ownerType = this.getNumber(this.state[actionType + '-' + 3].value);
        const newOwner = this.state[actionType + '-' + 4].value;   
        const weight = this.getNumber(this.state[actionType + '-' + 5].value);
        
        this.state.payloadElements = [threshold, updateAuthorThreshold, [[updateAuthorType, [ownerType, newOwner, weight]]]];  

        payloadDetailInfoList.push({name: 'threshold', value: threshold});
        payloadDetailInfoList.push({name: 'updateAuthorThreshold', value: updateAuthorThreshold});
        payloadDetailInfoList.push({name: 'updateAuthorType', value: updateAuthorType});
        payloadDetailInfoList.push({name: 'ownerType', value: ownerType});
        payloadDetailInfoList.push({name: 'newOwner', value: newOwner});
        payloadDetailInfoList.push({name: 'weight', value: weight});
      } else if (actionType != Constant.CREATE_CONTRACT && this.hasPayloadTx(actionType)) {  // 对于非合约交易
        const payloadInfoNum = (this.state.payloadInfos.length + 2) / 3;
        for (let j = 0; j < payloadInfoNum; j++) {
          let actionValue = this.state[actionType + '-' + j];
          let value = '';
          if (actionValue == null) {
            this.state.payloadElements.push('');
            payloadDetailInfoList.push({name: actionValue.payloadName, value: ''});
          } else if (actionValue.isNumber) {
            if (utils.isEmptyObj(actionValue.value)) {
              value = 0;
            } else {
              value = new BigNumber(actionValue.value);
              if (value.comparedTo(new BigNumber(1).shiftedBy(18)) == 1) {
                value = value.toString(16);
              } else {
                value = value.toNumber();
              }
            }
            this.state.payloadElements.push(value);
            payloadDetailInfoList.push({name: actionValue.payloadName, value});
          } else {
            value = actionValue.value;
            this.state.payloadElements.push(actionValue.value);
            payloadDetailInfoList.push({name: actionValue.payloadName, value});
          }
        }
      } else if (this.hasUselessPayloadTx(actionType)) {
        let payloadValue = this.state['default-0'];
        //this.state.payloadElements.push(payloadValue.value);
        payloadDetailInfoList.push({name: payloadValue.payloadName, value:payloadValue.value});
      }
      let payload = '';
      if (actionType != Constant.CREATE_CONTRACT) {
        payload = '0x' + (this.state.payloadElements.length > 0 ? encode(this.state.payloadElements).toString('hex') : '');
      } else {
        payload = this.state[actionType + '-' + 0].value;
        if (payload.indexOf('0x') < 0) {
          payload = '0x' + payload;
        }
        payloadDetailInfoList.push({name: this.state[actionType + '-' + 0].payloadName, value:payload});
      }
      
      let zeros = '';
      if (this.state.zeroNum != null && this.state.zeroNum > 0) {
        zeros = '0'.repeat(this.state.zeroNum);
      }
      let assetIdValue = this.state['assetId'];
      if (!utils.isEmptyObj(assetIdValue)) {
        if (assetIdValue.indexOf('$') < 0) {
          assetIdValue = this.getNumber(assetIdValue);
        }
      } else {
        assetIdValue = 0;
      }
      let nonceValue = '';
      if (!utils.isEmptyObj(this.state['nonce'])) {
        nonceValue = this.getNumber(this.state['nonce']);
      }
      const amountValue = this.getNumber(this.state['amount'] + zeros);
      const txInfo = {
        gasAssetId: this.getNumber(this.state['gasAssetId']),
        gasPrice: utils.isEmptyObj(this.state['gasPrice']) ? '' : this.getNumber(this.state['gasPrice'] + '0'.repeat(9)),
        actions: [{
          actionType: this.getNumber(this.state['actionType']),
          accountName: this.state['accountName'], 
          nonce: nonceValue, 
          gasLimit: this.getNumber(this.state['gasLimit']), 
          toAccountName: this.state['toAccountName'], 
          assetId: assetIdValue, 
          amount: amountValue == 0 ? 0 : '0x' + amountValue.toString(16), 
          payload, 
          payloadDetailInfo: payloadDetailInfoList,
          remark: utils.isEmptyObj(this.state['remark']) ? '' : this.state['remark'], 
        }]
      };
      this.setState({ txInfo: JSON.stringify(txInfo) });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  handleTxInfoChange = (v) => {
    this.setState({ txInfo: v });
  }

  showPrivateKey = () => {
    const htmlType = this.state.htmlType === 'password' ? 'text' : 'password';
    const showPrivateKeyTip = this.state.showPrivateKeyTip === '显示私钥' ? '隐藏私钥' : '显示私钥';
    this.setState({
      htmlType,
      showPrivateKeyTip,
    });
  }
  addSendErrorTxToFile = (txInfo) => {
    txInfo.isInnerTx = 0;
    txInfo.txStatus = Constant.TxStatus.SendError;
    txInfo.date = new Date().getTime() * 1000000;
    txInfo.txHash = '0x';
    txInfo.blockHash = '0x';
    txInfo.blockNumber = '';
    txInfo.blockStatus = Constant.BlockStatus.Unknown;
    txInfo.actions[0].status = 0;
    txInfo.actions[0].actionIndex = 0;
    txInfo.actions[0].gasUsed = 0;
    txInfo.actions[0].gasAllot = [];

    let allTxInfoSet = utils.getDataFromFile(Constant.TxInfoFile);
    if (allTxInfoSet != null) {
      let accountTxInfoSet = allTxInfoSet[txInfo.accountName];
      if (accountTxInfoSet == null) {
        accountTxInfoSet = {};
        accountTxInfoSet.txInfos = [txInfo];
        allTxInfoSet[txInfo.accountName] = accountTxInfoSet;
      } else {
        accountTxInfoSet.txInfos.push(txInfo);
      }
    } else {
      allTxInfoSet = {};
      allTxInfoSet[txInfo.accountName] = {};
      allTxInfoSet[txInfo.accountName].txInfos = [txInfo];
    }
    utils.storeDataToFile(Constant.TxInfoFile, allTxInfoSet);
  }

  sendTransaction = () => {
    if (utils.isEmptyObj(this.state.privateKey)) {
      Feedback.toast.error('请输入私钥');
      return;
    }
    if (utils.isEmptyObj(this.state.txInfo)) {
      Feedback.toast.error('请先生成交易内容');
      return;
    }
    let txInfo = this.state.txInfo.trim();
    // const regex = /'/gi;
    // txInfo = txInfo.replace(regex, '"');
    if (txInfo.length > 130 && txInfo.charAt(0) === '{' && txInfo.charAt(txInfo.length - 1) === '}') {
      try {
        console.log('raw->' + txInfo);
        const txObj = JSON.parse(txInfo);
        oexchain.oex.signTx(txObj, this.state.privateKey).then(signInfo => {
          oexchain.oex.sendSingleSigTransaction(txObj, signInfo).then(txHash => {
            this.setState({ txResult: txHash });
          }).catch(error => {
            Feedback.toast.error(error);
            this.addSendErrorTxToFile(txObj);
            this.setState({ txResult: error });
          });
        }).catch(error => {
          Feedback.toast.error(error);
          this.setState({ txResult: error });
        });
       
      } catch (error) {
        Feedback.toast.error(error);
        this.setState({ txResult: error });
      }
    } else {
      Feedback.toast.prompt('请输入合规的交易信息');
    }
  }
  getReceipt = () => {
    try {
      if (!utils.isEmptyObj(this.state.txResult) && this.state.txResult.indexOf('0x') == 0) {
        oexchain.oex.getTransactionReceipt(this.state.txResult).then(resp => {
          this.setState({ receipt: JSON.stringify(resp) });
        });
      } else {
        Feedback.toast.prompt('无法获取receipt');
      }
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }
  getTxInfo = () => {
    try {
      if (this.state.txResult != null) {
        oexchain.oex.getTransactionByHash(this.state.txResult).then(resp => {
          this.setState({ receipt: JSON.stringify(resp) });
        });
      } else {
        Feedback.toast.prompt('无法获取交易信息');
      }
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
    
  }
  onChangeTxType = (txType) => {
    this.state.actionType = txType;
    this.state.payloadInfos = [];
    switch (txType) {
      case Constant.CREATE_CONTRACT:
        this.state.payloadInfos.push(
            <Input hasClear
            style={styles.commonElement}
            addonBefore="合约byteCode:"
            size="medium"
            defaultValue=''
            onChange={this.handleElementChange.bind(this, Constant.CREATE_CONTRACT, 'byteCode', 0, false)}/>
            );
        this.state[Constant.CREATE_CONTRACT + '-' + 0] = { value: '', isNumber: false, payloadName: 'byteCode' };        
        break;    
      case Constant.CREATE_NEW_ACCOUNT:
        this.state.payloadInfos.push(
          <Input id={Constant.CREATE_NEW_ACCOUNT + '-newAccountName'} hasClear
            style={styles.commonElement}
            addonBefore="新账户名:"
            size="medium"
            defaultValue=''
            //value={this.state[Constant.CREATE_NEW_ACCOUNT + '-0'] != null ? this.state[Constant.CREATE_NEW_ACCOUNT + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.CREATE_NEW_ACCOUNT, 'newAccountName', 0, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="创办者:"
            size="medium"
            defaultValue=''
            //value={this.state[Constant.CREATE_NEW_ACCOUNT + '-1'] != null ? this.state[Constant.CREATE_NEW_ACCOUNT + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.CREATE_NEW_ACCOUNT, 'founder', 1, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="公钥:"
            size="medium"
            defaultValue=''
            //value={this.state[Constant.CREATE_NEW_ACCOUNT + '-2'] != null ? this.state[Constant.CREATE_NEW_ACCOUNT + '-2'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.CREATE_NEW_ACCOUNT, 'publicKey', 2, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="描述:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.CREATE_NEW_ACCOUNT + '-3'] != null ? this.state[Constant.CREATE_NEW_ACCOUNT + '-3'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.CREATE_NEW_ACCOUNT, 'desc', 3, false)}/>
          );
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 0] = { value: '', isNumber: false, payloadName: 'newAccountName' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 1] = { value: '', isNumber: false, payloadName: 'founder' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 2] = { value: '', isNumber: false, payloadName: 'publicKey' };
        this.state[Constant.CREATE_NEW_ACCOUNT + '-' + 3] = { value: '', isNumber: false, payloadName: 'desc' };
        break;
      case Constant.UPDATE_ACCOUNT:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="创办者:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ACCOUNT + '-0'] != null ? this.state[Constant.UPDATE_ACCOUNT + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT, 'founder', 0, false)}/>
          );
        this.state[Constant.UPDATE_ACCOUNT + '-' + 0] = { value: '', isNumber: false, payloadName: 'founder' };
        break;
      case Constant.UPDATE_ACCOUNT_AUTHOR:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="执行交易阈值:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-0'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'threshold', 0, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="更新权限所需阈值:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-1'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'updateThreshold', 1, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="操作类型"
            placeholder='0:添加权限，1:更新权限，2:删除权限'
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-2'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-2'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'opType', 2, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="所有者类型:"
            size="medium"
            defaultValue=''
            placeholder='0:用户名，1:公钥，2:地址'
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-3'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-3'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'contentType', 3, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="所有者:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-4'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-4'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'opContent', 4, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="权重:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-5'] != null ? this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-5'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ACCOUNT_AUTHOR, 'weight', 5, true)}/>
          );
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 0] = { value: 0, isNumber: true, payloadName: 'threshold' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 1] = { value: 0, isNumber: true, payloadName: 'updateThreshold' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 2] = { value: 0, isNumber: true, payloadName: 'opType' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 3] = { value: 0, isNumber: true, payloadName: 'contentType' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 4] = { value: '', isNumber: false, payloadName: 'opContent' };
        this.state[Constant.UPDATE_ACCOUNT_AUTHOR + '-' + 5] = { value: 0, isNumber: true, payloadName: 'weight' };
        break;
      case Constant.ISSUE_ASSET:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产名:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-0'] != null ? this.state[Constant.ISSUE_ASSET + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'assetName', 0, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="符号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-1'] != null ? this.state[Constant.ISSUE_ASSET + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'symbol', 1, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="本次发行量:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-2'] != null ? this.state[Constant.ISSUE_ASSET + '-2'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'amount', 2, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="精度:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-3'] != null ? this.state[Constant.ISSUE_ASSET + '-3'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'decimals', 3, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="创办者:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-4'] != null ? this.state[Constant.ISSUE_ASSET + '-4'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'founder', 4, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="管理者:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-5'] != null ? this.state[Constant.ISSUE_ASSET + '-5'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'owner', 5, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="发行上限:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-6'] != null ? this.state[Constant.ISSUE_ASSET + '-6'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'upperLimit', 6, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="合约账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-7'] != null ? this.state[Constant.ISSUE_ASSET + '-7'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'contractName', 7, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产描述:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.ISSUE_ASSET + '-8'] != null ? this.state[Constant.ISSUE_ASSET + '-8'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.ISSUE_ASSET, 'desc', 8, false)}/>
          );
        this.state[Constant.ISSUE_ASSET + '-' + 0] = { value: '', isNumber: false, payloadName: 'assetName' };
        this.state[Constant.ISSUE_ASSET + '-' + 1] = { value: '', isNumber: false, payloadName: 'symbol' };
        this.state[Constant.ISSUE_ASSET + '-' + 2] = { value: 0, isNumber: true, payloadName: 'amount' };
        this.state[Constant.ISSUE_ASSET + '-' + 3] = { value: 0, isNumber: true, payloadName: 'decimals' };
        this.state[Constant.ISSUE_ASSET + '-' + 4] = { value: '', isNumber: false, payloadName: 'founder' };
        this.state[Constant.ISSUE_ASSET + '-' + 5] = { value: '', isNumber: false, payloadName: 'owner' };
        this.state[Constant.ISSUE_ASSET + '-' + 6] = { value: 0, isNumber: true, payloadName: 'upperLimit' };
        this.state[Constant.ISSUE_ASSET + '-' + 7] = { value: '', isNumber: false, payloadName: 'contractName' };
        this.state[Constant.ISSUE_ASSET + '-' + 8] = { value: '', isNumber: false, payloadName: 'desc' };
        break;
      case Constant.INCREASE_ASSET:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产ID:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.INCREASE_ASSET + '-0'] != null ? this.state[Constant.INCREASE_ASSET + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.INCREASE_ASSET, 'assetId', 0, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="增发数量:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.INCREASE_ASSET + '-1'] != null ? this.state[Constant.INCREASE_ASSET + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.INCREASE_ASSET, 'amount', 1, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="接收资产账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.INCREASE_ASSET + '-2'] != null ? this.state[Constant.INCREASE_ASSET + '-2'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.INCREASE_ASSET, 'accountName', 2, false)}/>
          );
        this.state[Constant.INCREASE_ASSET + '-' + 0] = { value: 0, isNumber: true, payloadName: 'assetId' };
        this.state[Constant.INCREASE_ASSET + '-' + 1] = { value: 0, isNumber: true, payloadName: 'amount' };
        this.state[Constant.INCREASE_ASSET + '-' + 2] = { value: '', isNumber: false, payloadName: 'accountName' };
        break;
      case Constant.SET_ASSET_OWNER:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产ID:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.SET_ASSET_OWNER + '-0'] != null ? this.state[Constant.SET_ASSET_OWNER + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.SET_ASSET_OWNER, 'assetId', 0, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="新管理者账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.SET_ASSET_OWNER + '-1'] != null ? this.state[Constant.SET_ASSET_OWNER + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.SET_ASSET_OWNER, 'accountName', 1, false)}/>
          );
        this.state[Constant.SET_ASSET_OWNER + '-' + 0] = { value: 0, isNumber: true, payloadName: 'assetId' };
        this.state[Constant.SET_ASSET_OWNER + '-' + 1] = { value: '', isNumber: false, payloadName: 'accountName' };
        break;
      case Constant.SET_ASSET_FOUNDER:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产ID:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.SET_ASSET_FOUNDER + '-0'] != null ? this.state[Constant.SET_ASSET_FOUNDER + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.SET_ASSET_FOUNDER, 'assetId', 0, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="新创办者账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.SET_ASSET_FOUNDER + '-1'] != null ? this.state[Constant.SET_ASSET_FOUNDER + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.SET_ASSET_FOUNDER, 'accountName', 1, false)}/>
          );
        this.state[Constant.SET_ASSET_FOUNDER + '-' + 0] = { value: 0, isNumber: true, payloadName: 'assetId' };
        this.state[Constant.SET_ASSET_FOUNDER + '-' + 1] = { value: '', isNumber: false, payloadName: 'accountName' };
        break;
      case Constant.UPDATE_ASSET_CONTRACT:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产ID:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ASSET_CONTRACT + '-0'] != null ? this.state[Constant.UPDATE_ASSET_CONTRACT + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ASSET_CONTRACT, 'assetId', 0, true)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="合约账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_ASSET_CONTRACT + '-1'] != null ? this.state[Constant.UPDATE_ASSET_CONTRACT + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_ASSET_CONTRACT, 'contract', 1, false)}/>
          );
        this.state[Constant.UPDATE_ASSET_CONTRACT + '-' + 0] = { value: 0, isNumber: true, payloadName: 'assetId' };
        this.state[Constant.UPDATE_ASSET_CONTRACT + '-' + 1] = { value: '', isNumber: false, payloadName: 'contract' };
        break;
      case Constant.REG_CANDIDATE:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="URL:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.REG_CANDIDATE + '-0'] != null ? this.state[Constant.REG_CANDIDATE + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.REG_CANDIDATE, 'url', 0, false)}/>
          );
        this.state[Constant.REG_CANDIDATE + '-' + 0] = { value: '', isNumber: false, payloadName: 'url' };
        break;
      case Constant.UPDATE_CANDIDATE:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="URL:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.UPDATE_CANDIDATE + '-0'] != null ? this.state[Constant.UPDATE_CANDIDATE + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.UPDATE_CANDIDATE, 'url', 0, false)}/>
          );
        this.state[Constant.UPDATE_CANDIDATE + '-' + 0] = { value: '', isNumber: false, payloadName: 'url' };
        break;
      case Constant.VOTE_CANDIDATE:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="候选者账号:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.VOTE_CANDIDATE + '-0'] != null ? this.state[Constant.VOTE_CANDIDATE + '-0'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.VOTE_CANDIDATE, 'accountName', 0, false)}/>,<br/>,<br/>,
          <Input hasClear
            style={styles.commonElement}
            addonBefore="投票数:"
            size="medium"
            defaultValue=''
            value={this.state[Constant.VOTE_CANDIDATE + '-1'] != null ? this.state[Constant.VOTE_CANDIDATE + '-1'].value : ''}
            onChange={this.handleElementChange.bind(this, Constant.VOTE_CANDIDATE, 'voteNumber', 1, true)}/>
          );
        this.state[Constant.VOTE_CANDIDATE + '-' + 0] = { value: '', isNumber: false, payloadName: 'accountName' };
        this.state[Constant.VOTE_CANDIDATE + '-' + 1] = { value: 0, isNumber: true, payloadName: 'voteNumber' };
        break;
      case Constant.UNREG_CANDIDATE:
      case Constant.DESTORY_ASSET:
      case Constant.TRANSFER:
      case Constant.REFUND_DEPOSIT:
        this.state.payloadInfos.push(
          <Input hasClear
            style={styles.commonElement}
            addonBefore="payload:"
            size="medium"
            defaultValue=''
            onChange={this.handleElementChange.bind(this, 'default', 'payload', 0, false)}/>
          );
        this.state['default' + '-' + 0] = { value: '', isNumber: false, payloadName: 'payload' };
        break;
      default:
        console.log('error action type:' + actionInfo.type);
    }
    this.setState({ payloadInfos: this.state.payloadInfos, selectedTypeValue: txType });
  }
  handleElementChange = (actionType, payloadName, index, isNumber, v) => {
    this.state[actionType + '-' + index] = { value: v, isNumber, payloadName };
  }
  handleActionElementChange = (actionElement, v) => {
    this.state[actionElement] = v;
    this.state.actionCookie[actionElement] = v;
    cookie.save('actionHistoryInfo', this.state.actionCookie);
    this.forceUpdate();
  }
  onChangeZeroNumType = (v) => {
    this.state.zeroNum = v;
  }
  render() {
    return (
      <div>
        <Input hasClear
          htmlType={this.state.htmlType}
          style={styles.otherElement}
          maxLength={66}
          hasLimitHint
          addonBefore="私钥:"
          size="medium"
          placeholder="私钥用于对交易信息进行签名，无需0x前缀"
          defaultValue={this.state.privateKey}
          onChange={this.handlePrivateKeyChange.bind(this)}
        />
        &nbsp;&nbsp;
        <Button type="primary" onClick={this.showPrivateKey.bind(this)}>{this.state.showPrivateKeyTip}</Button>
        <br />
        <br />
        <Input hasClear
          style={styles.otherElement}
          hasLimitHint
          addonBefore="交易URI:"
          size="medium"
          onChange={this.handleTxUriChange.bind(this)}
        />
        &nbsp;&nbsp;
        <Button type="primary" onClick={this.parseUri.bind(this)}>解析URI</Button>
        <br />
        <br />
        <Select language={T('zh-cn')}
            style={styles.otherElement}
            placeholder="选择交易类型"
            onChange={this.onChangeTxType.bind(this)}
            value={this.state.selectedTypeValue}
            dataSource={this.state.txTypeInfos}
          />
        <br />
        <br />
        <IceContainer style={styles.container} title='通用信息'>
          <Input hasClear
            style={styles.commonElement}
            addonBefore="nonce值(选填):"
            size="medium"
            defaultValue={this.state.actionCookie.nonce}
            onChange={this.handleActionElementChange.bind(this, 'nonce')}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="from账号:"
            size="medium"
            defaultValue={this.state.actionCookie.accountName}
            onChange={this.handleActionElementChange.bind(this, 'accountName')}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="to账号:"
            size="medium"
            defaultValue={this.state.actionCookie.toAccountName}
            value={this.state['toAccountName']}
            onChange={this.handleActionElementChange.bind(this, 'toAccountName')}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="资产ID:"
            size="medium"
            defaultValue={this.state.actionCookie.assetId}
            value={this.state['assetId']}
            onChange={this.handleActionElementChange.bind(this, 'assetId')}
          />
          <br />
          <br />
          <Input hasClear
            style={{width:500}}
            addonBefore="资产数量:"
            size="medium"
            defaultValue={this.state.actionCookie.amount}
            value={this.state['amount']}
            onChange={this.handleActionElementChange.bind(this, 'amount')}
          />
          &nbsp;&nbsp;
          <Select language={T('zh-cn')}
            style={{width:150}}
            placeholder="补足0️个数"
            onChange={this.onChangeZeroNumType.bind(this)}
            defaultValue={this.state.zeroNum}
            dataSource={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="交易备注:"
            size="medium"
            defaultValue={this.state.actionCookie.remark}
            value={this.state['remark']}
            onChange={this.handleActionElementChange.bind(this, 'remark')}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="Gas资产ID:"
            size="medium"
            defaultValue={this.state.actionCookie.gasAssetId}
            onChange={this.handleActionElementChange.bind(this, 'gasAssetId')}
          />
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="Gas单价（Gaoex）:"
            size="medium"
            defaultValue={this.state.actionCookie.gasPrice}
            onChange={this.handleActionElementChange.bind(this, 'gasPrice')}
          />
          <br />
          1Gaoex = 10<sup>-9</sup>eox = 10<sup>9</sup>aeox
          <br />
          <br />
          <Input hasClear
            style={styles.commonElement}
            addonBefore="Gas上限:"
            size="medium"
            defaultValue={this.state.actionCookie.gasLimit}
            onChange={this.handleActionElementChange.bind(this, 'gasLimit')}
          />
        </IceContainer>
        
        <br />
        <br />
        <IceContainer style={styles.container} title='payload信息'>
          {this.state.payloadInfos}    
        </IceContainer>
        <br />
        <br />
        <IceContainer style={styles.container} title='执行交易'>
          <Button type="primary" onClick={this.generateTxInfo.bind(this)}>生成交易内容</Button>
          <br />
          <br />
          <Input multiple
            rows="13"
            style={styles.commonElement}
            addonBefore="交易内容:"
            size="medium"
            value={this.state.txInfo}
            onChange={this.handleTxInfoChange.bind(this)}
          />
          <br />
          <br />       
          <Button type="primary" onClick={this.sendTransaction.bind(this)}>发送交易</Button>
          <br />
          <br />
          <Input multiple
            rows="2"
            style={styles.commonElement}
            addonBefore="交易结果:"
            size="medium"
            value={this.state.txResult}
          />
          <br />
          <br />
          <Button type="primary" onClick={this.getReceipt.bind(this)}>获取Receipt</Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.getTxInfo.bind(this)}>获取交易</Button>
          <br />
          <br />
          <Input multiple
            rows="10"
            style={styles.commonElement}
            addonBefore="Receipt/交易"
            size="medium"
            value={this.state.receipt}
          />
        </IceContainer>
        <br />
        <br />
        <IceContainer title='账号生成'>   
          <Input multiple
            rows="10"
            style={styles.commonElement}
            addonBefore="账号名前缀"
            size="medium"
            value={this.state.accountPrefix}
            onChange={this.handleAccountPrefixChange.bind(this)}
          />
        </IceContainer>

        <IceContainer style={{display: 'none'}} title='测试场景'>          
          <Input 
            style={styles.halfElement}
            addonBefore="私钥"
            size="medium"
            onChange={this.handleSignPrivateKeyChange.bind(this)}
          />
          &nbsp;&nbsp;
          <Input 
            style={styles.halfElement}
            addonBefore="私钥index"
            size="medium"
            onChange={this.handlePrivateKeyIndexChange.bind(this)}
          />
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.addPrivateInfo.bind(this)}>添加私钥</Button>
          <br />
          <br />
          <Input multiple
            rows="2"
            style={styles.commonElement}
            addonBefore="签名用私钥"
            size="medium"
            value={this.state.privateKeyInfoSet}
            onChange={this.onChangePriKeySet.bind(this)}
          />
          <br />
          <br />
          <Select language={T('zh-cn')}
            style={styles.halfElement}
            placeholder="选择此交易预期结果"
            onChange={this.onChangeResultType.bind(this)}
            dataSource={this.state.resultTypes}
          />
          <br />
          <br />
          <Input 
            style={{width: 200}}
            addonBefore="结果变量"
            placeholder='变量不可重复'
            size="medium"
            onChange={this.onChangeSendResultVarible.bind(this)}
          />
          &nbsp;&nbsp;
          <Input 
            style={{width: 300}}
            addonBefore="备注"
            size="medium"
            onChange={this.onChangeTxTooltip.bind(this)}
          />
          <br />
          <br />
          <Button type="primary" onClick={this.addTestCase.bind(this)}>将生成的交易内容添加到测试场景中</Button>
          <br />
          <br />
          <br />
          <br />
          <Select language={T('zh-cn')}
            style={{width: 250}}
            placeholder="请选择get方法"
            onChange={this.onChangeGetMethod.bind(this)}
            dataSource={getMethods}
          />
          <br />
          <br />
          <Input 
            style={{width: 250}}
            addonBefore="参数列表"
            placeholder='参数间用英文逗号隔开'
            size="medium"
            onChange={this.onChangeGetArguments.bind(this)}
          />
          &nbsp;&nbsp;
          <Input 
            style={{width: 180}}
            addonBefore="结果变量"
            placeholder='变量不可重复'
            size="medium"
            onChange={this.onChangeResultVarible.bind(this)}
          />
          &nbsp;&nbsp;
          <Input 
            style={{width: 200}}
            addonBefore="备注"
            size="medium"
            onChange={this.onChangeGetTooltip.bind(this)}
          />
          <br />
          <br />
          <Button type="primary" onClick={this.addGetToTestCase.bind(this)}>将Get添加到测试场景中</Button>
          <br />
          <br />
          <br />
          <br />
          <Select language={T('zh-cn')}
            style={{width: 250}}
            placeholder="请选择check方法"
            onChange={this.onChangeCheckMethod.bind(this)}
            dataSource={checkMethods}
          />
          <br />
          <br />
          <Input 
            style={{width: 250}}
            addonBefore="参数列表"
            placeholder='参数间用英文逗号隔开'
            size="medium"
            onChange={this.onChangeCheckArguments.bind(this)}
          />
          &nbsp;&nbsp;
          <Select language={T('zh-cn')}
            style={{width: 180}}
            placeholder="选择此check预期结果"
            onChange={this.onChangeCheckExpectResult.bind(this)}
            dataSource={this.state.resultTypes}
          />
          &nbsp;&nbsp;
          <Input 
            style={{width: 200}}
            addonBefore="备注"
            size="medium"
            onChange={this.onChangeCheckTooltip.bind(this)}
          />
          <br />
          <br />
          <Button type="primary" onClick={this.addCheckToTestCase.bind(this)}>将Check添加到测试场景中</Button>
          <br />
          <br />
          <Input multiple
            rows="10"
            style={styles.commonElement}
            addonBefore="测试场景"
            size="medium"
            value={this.state.testScene}
            onChange={this.onChangeTestScene.bind(this)}
          />
          <br />
          <br />
          <Input 
            style={styles.commonElement}
            addonBefore="场景名称"
            size="medium"
            placeholder="注意：会覆盖之前同名的测试场景"
            onChange={this.handleTestSceneNameChange.bind(this)}
          />
          <br />
          <br />
          <Input 
            style={styles.commonElement}
            addonBefore="场景ID"
            size="medium"
            placeholder="ID可分级，如：1，1.1，1.2.1"
            onChange={this.handleSceneIdChange.bind(this)}
          />
          <br />
          <br />
          <Button type="primary" onClick={this.saveTestScene.bind(this)}>保存此测试场景</Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.exportTestScene.bind(this)}>导出所有测试场景</Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.deleteTestScene.bind(this)}>删除指定名称的测试场景</Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.clearTestScene.bind(this)}>清空缓存中所有的测试场景</Button>
        </IceContainer>
        
        {/* <Button type="primary" onClick={this.checkResult.bind(this)}>校验链上相关状态</Button>
        <br />
        <br />
        <Input multiple
          rows="10"
          style={styles.otherElement}
          addonBefore="校验过程"
          size="medium"
          value={this.state.checkProcedure}
        /> */}
      </div>
    );
  }

  handleAccountPrefixChange = (v) => {
    this.state.accountPrefix = v;
  }

  handleSignPrivateKeyChange = (v) => {
    this.state.signPrivateKey = v;
  }
  handlePrivateKeyIndexChange = (v) => {
    this.state.privateKeyIndex = v;
  }
  addPrivateInfo = () => {
    try {
      if (utils.isEmptyObj(this.state.signPrivateKey)) {
        Feedback.toast.error('请输入私钥');
        return;
      }
      if (utils.isEmptyObj(this.state.privateKeyIndex)) {
        Feedback.toast.error('请输入私钥index');
        return;
      }
      try {
        let privateKeyInfo = [];
        if (!utils.isEmptyObj(this.state.privateKeyInfoSet)) {
          privateKeyInfo = JSON.parse(this.state.privateKeyInfoSet);
        }
        privateKeyInfo.push({ privateKey:this.state.signPrivateKey, index: this.state.privateKeyIndex });
        cookie.save('privateKeyInfoSet', privateKeyInfo);
        this.setState({privateKeyInfoSet: JSON.stringify(privateKeyInfo)});
      } catch (error) {
        Feedback.toast.error(error);
      }
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }
  onChangePriKeySet = (v) => {
    this.setState({ privateKeyInfoSet: v});
  }

  saveTestSceneToCookie = (v) => {
    cookie.save(testSceneTag, v);
  }

  addTestCase = () => {
    try {
      if (utils.isEmptyObj(this.state.privateKeyInfoSet)) {
        Feedback.toast.error('请在添加私钥及其index信息');
        return;
      }

      if (utils.isEmptyObj(this.state.txInfo)) {
        Feedback.toast.error('请先生成交易内容');
        return;
      }

      if (this.state.resultType != 1 && this.state.resultType != 0) {
        Feedback.toast.error('请选择对此交易的预期结果');
        return;
      }

      if (utils.isEmptyObj(this.state.sendResultVarible)) {
        Feedback.toast.error('请输入交易结果变量');
        return;
      }
      
      let procedureArr = [];
      if (!utils.isEmptyObj(this.state.testScene)) {
        procedureArr = JSON.parse(this.state.testScene);
      }
      const procedure = {};
      const txInfo = JSON.parse(this.state.txInfo.trim());
      procedure.type = 'send';
      procedure.selfObj = 'sendObj' + this.state.sendObjIndex++;
      procedure.tooltip = this.state.txTooltip;
      txInfo.resultObj = [this.state.sendResultVarible];
      txInfo.privateKeyInfo = JSON.parse(this.state.privateKeyInfoSet);
      procedure.info = txInfo;
      procedure.expectedResult = this.state.resultType;
      procedureArr.push(procedure);
      this.saveTestSceneToCookie(JSON.stringify(procedureArr));
      this.setState({ testScene: JSON.stringify(procedureArr) });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  onChangeGetMethod = (v) => {
    this.state.getMethod = v;
  }

  onChangeGetArguments = (v) => {
    this.state.arguments = v;
  }

  onChangeResultVarible = (v) => {
    this.state.resultVarible = v;
  }

  onChangeGetTooltip = (v) => {
    this.state.getTooltip = v;
  }

  onChangeSendResultVarible = (v) => {
    this.state.sendResultVarible = v;
  }

  onChangeTxTooltip = (v) => {
    this.state.txTooltip = v;
  }

  onChangeCheckMethod = (v) => {
    this.state.checkMethod = v;
  }

  onChangeCheckArguments = (v) => {
    this.state.checkArguments = v;
  }

  onChangeCheckExpectResult = (v) => {
    this.state.checkExpectResult = v;
  }

  onChangeCheckTooltip = (v) => {
    this.state.checkTooltip = v;
  }

  addGetToTestCase = () => {
    try {
      if (utils.isEmptyObj(this.state.getMethod)) {
        Feedback.toast.error('请选择get方法');
        return;
      }
      
      if (utils.isEmptyObj(this.state.arguments)) {
        this.state.arguments = '';
      }

      if (this.state.arguments.indexOf('，') > -1) {
        Feedback.toast.error('请输入合法参数值，参数值之间用英文逗号隔开');
        return;
      }
  
      if (utils.isEmptyObj(this.state.resultVarible)) {
        Feedback.toast.error('请输入结果变量名');
        return;
      }
      
      let procedureArr = [];
      if (!utils.isEmptyObj(this.state.testScene)) {
        procedureArr = JSON.parse(this.state.testScene);
      }
      const procedure = {};
      procedure.type = 'get';
      procedure.selfObj = 'getObj' + this.state.getObjIndex++;
      procedure.tooltip = this.state.getTooltip;
      procedure.info = {method: this.state.getMethod, arguments: this.state.arguments.split(','), resultObj: [this.state.resultVarible]};
      procedureArr.push(procedure);
      this.saveTestSceneToCookie(JSON.stringify(procedureArr));
      this.setState({ testScene: JSON.stringify(procedureArr) });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  addCheckToTestCase = () => {
    try {
      if (utils.isEmptyObj(this.state.checkMethod)) {
        Feedback.toast.error('请选择check方法');
        return;
      }
  
      if (utils.isEmptyObj(this.state.checkArguments) || this.state.checkArguments.indexOf('，') > -1) {
        Feedback.toast.error('请输入合法参数值，参数值之间用英文逗号隔开');
        return;
      }
  
      if (this.state.checkExpectResult != 1 && this.state.checkExpectResult != 0) {
        Feedback.toast.error('请选择此check的预期结果');
        return;
      }
      
      let procedureArr = [];
      if (!utils.isEmptyObj(this.state.testScene)) {
        procedureArr = JSON.parse(this.state.testScene);
      }
      const procedure = {};
      procedure.type = 'check';
      procedure.selfObj = 'checkObj' + this.state.checkObjIndex++;
      procedure.tooltip = this.state.checkTooltip;
      procedure.info = {method: this.state.checkMethod, arguments: this.state.checkArguments.split(',')};
      procedure.expectedResult = this.state.checkExpectResult;
      procedureArr.push(procedure);
      this.saveTestSceneToCookie(JSON.stringify(procedureArr));
      this.setState({ testScene: JSON.stringify(procedureArr) });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  onChangeTestScene = (v) => {
    this.setState({ testScene: v });
  }
  saveTestScene = () => {
    try {
      if (utils.isEmptyObj(this.state.testScene) || !Array.isArray(JSON.parse(this.state.testScene))) {
        Feedback.toast.error('测试数据有误，请检查');
        return;
      }
      if (utils.isEmptyObj(this.state.sceneName)) {
        Feedback.toast.error('请对此测试场景命名');
        return;
      }
      if (utils.isEmptyObj(this.state.sceneId)) {
        Feedback.toast.error('请设置此测试场景的ID');
        return;
      }
      const sceneName = this.state.sceneId + '.' + this.state.sceneName;
      let oneTestScene = {};
      oneTestScene.name = sceneName;
      oneTestScene.procedure = JSON.parse(this.state.testScene);
  
      let testSceneFile = utils.getDataFromFile(Constant.TestSceneFile);
      if (testSceneFile == null) {
        testSceneFile = [];
      }
      testSceneFile.push(oneTestScene);
      utils.storeDataToFile(Constant.TestSceneFile, testSceneFile);
      Feedback.toast.success('保存成功');
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }
  exportTestScene = () => {
    let testSceneFile = utils.getDataFromFile(Constant.TestSceneFile);
    copy(JSON.stringify(testSceneFile));
    Feedback.toast.success('测试用例已复制到粘贴板');
  }

  deleteTestScene = () => {
    try {
      if (utils.isEmptyObj(this.state.sceneName)) {
        Feedback.toast.error('请输入待删除测试场景名称');
        return;
      }
      if (utils.isEmptyObj(this.state.sceneId)) {
        Feedback.toast.error('请输入待删除测试场景的ID');
        return;
      }
      const sceneName = this.state.sceneId + '.' + this.state.sceneName;
      let testSceneArr = utils.getDataFromFile(Constant.TestSceneFile);
      if (testSceneArr != null) {
        testSceneArr.splice(testSceneArr.findIndex(item => item.name == sceneName), 1);
        utils.storeDataToFile(Constant.TestSceneFile, testSceneArr);
        Feedback.toast.success('删除成功');
      }
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  clearTestScene = () => {
    utils.storeDataToFile(Constant.TestSceneFile, []);
    Feedback.toast.success('清空成功');
  }


  handleTestSceneNameChange = (v) => {
    this.state.sceneName = v;
  }
  handleSceneIdChange = (v) => {
    this.state.sceneId = v;
  }
  getAseetBalance = (account, assetId) => {
    for (const balanceInfo of account.balances) {
      if (balanceInfo.assetID == assetId) {
        return balanceInfo.balance;
      }
    }
    return 0;
  }
  checkResult = async () => {
    this.setState({ checkProcedure: '' });
    let checkInfo = '';
    let newFromAccount = null;
    let newToAccount = null;
    if (!utils.isEmptyObj(this.state['accountName'])) {
      newFromAccount = await oexchain.account.getAccountByName(this.state['accountName']);
    }
    if (!utils.isEmptyObj(this.state['toAccountName'])) {
      newToAccount = await oexchain.account.getAccountByName(this.state['toAccountName']);
    }
    const historyTxInfo = this.state.historyInfo.txInfo;
    const oldFromAccount = this.state.historyInfo.fromAccount;
    const oldToAccount = this.state.historyInfo.toAccount;
    if (!utils.isEmptyObj(this.state.txResult) && this.state.txResult.indexOf('0x') == 0) {
      oexchain.oex.getTransactionReceipt(this.state.txResult).then(receipt => {
        const resultStatus = receipt.actionResults[0].status == 1;
        // 1：先计算手续费
        const totalGasFee = new BigNumber(receipt.totalGasUsed).multipliedBy(new BigNumber(historyTxInfo.gasPrice));
        const transferAssetId = historyTxInfo.actions[0].assetId;
        // 2：根据各交易类型分别校验数据
        // 2.2: 先校验结果是成功的情况
        if (resultStatus) {
          let result = true;
          switch (this.state.actionType) {
            case Constant.TRANSFER:
              const oldFromFTBalance = this.getAssetBalance(oldFromAccount, 0);
              const newFromFTBalance = this.getAssetBalance(newFromAccount, 0);
              const oldFromBalance = this.getAssetBalance(oldFromAccount, transferAssetId);
              const newFromBalance = this.getAssetBalance(newFromAccount, transferAssetId);
              const oldToBalance = this.getAssetBalance(oldToAccount, transferAssetId);
              const newToBalance = this.getAssetBalance(newToAccount, transferAssetId);
              const transferValue = new BigNumber(historyTxInfo.txInfo.actions[0].amount);
              if (transferAssetId == 0) {
                if (new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).comparedTo(totalGasFee.add(transferValue)) == 0) {
                  checkInfo += '发送账户金额变化正常，减少的FT总金额为：' + new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '发送账户金额变化异常，实际减少的FT总金额为：' + new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).toNumber();
                  checkInfo += '\n应该减少的总金额为：' + totalGasFee.add(transferValue).toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n接收账户金额变化正常，增加的FT总金额为：' + new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  this.setState({ checkProcedure: checkInfo });
                }
                else {
                  checkInfo += '\n接收账户金额变化异常，增加的FT总金额为：' + new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  checkInfo += '\n应该增加的总金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
              } else {
                if (new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).comparedTo(totalGasFee) == 0) {
                  checkInfo += '发送账户FT资产金额变化正常，减少的FT总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '发送账户金额变化异常，实际减少的FT总金额为：' + new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).toNumber();
                  checkInfo += '应该减少的总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(oldFromBalance).minus(new BigNumber(newFromBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n发送账户ID为[' + transferAssetId + ']的资产金额变化正常，减少金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '\n发送账户ID为[' + transferAssetId + ']的资产金额变化异常，实际减少的金额为：' + new BigNumber(oldFromBalance).minus(new BigNumber(newFromBalance)).toNumber();
                  checkInfo += '，应减少金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n接收账户金额变化正常，增加ID为[' + transferAssetId + ']的资产金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                }
                else {
                  checkInfo += '\n接收账户金额变化异常，增加ID为[' + transferAssetId + ']的资产金额为：' + new BigNumber(newToFTBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  checkInfo += '，应该增加的金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (resultStatus != result) {
                  Feedback.toast.prompt('交易执行结果异常！');
                }
              }
              break;
            case Constant.CREATE_CONTRACT:
              break;    
            case Constant.CREATE_NEW_ACCOUNT:
              break;
            case Constant.UPDATE_ACCOUNT:
              break;
            case Constant.UPDATE_ACCOUNT_AUTHOR:
              break;
            case Constant.ISSUE_ASSET:
              break;
            case Constant.INCREASE_ASSET:
              break;
            case Constant.DESTORY_ASSET:
              break;
            case Constant.SET_ASSET_OWNER:
              break;
            case Constant.SET_ASSET_FOUNDER:
              break;
            case Constant.REG_CANDIDATE:
              break;
            case Constant.UPDATE_CANDIDATE:
              break;
            case Constant.UNREG_CANDIDATE:
              break;
            case Constant.VOTE_CANDIDATE:
              break;
            case Constant.REFUND_DEPOSIT:
              break;
            default:
              console.log('error action type:' + actionInfo.type);
          }
        } else {
          let result = true;
          switch (this.state.actionType) {
            case Constant.TRANSFER:
              const oldFromFTBalance = this.getAssetBalance(oldFromAccount, 0);
              const newFromFTBalance = this.getAssetBalance(newFromAccount, 0);
              const oldFromBalance = this.getAssetBalance(oldFromAccount, transferAssetId);
              const newFromBalance = this.getAssetBalance(newFromAccount, transferAssetId);
              const oldToBalance = this.getAssetBalance(oldToAccount, transferAssetId);
              const newToBalance = this.getAssetBalance(newToAccount, transferAssetId);
              const transferValue = new BigNumber(historyTxInfo.txInfo.actions[0].amount);
              if (transferAssetId == 0) {
                if (new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).comparedTo(totalGasFee) == 0) {
                  checkInfo += '发送账户金额变化正常，减少的FT总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '发送账户金额变化异常，实际减少的FT总金额为：' + new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).toNumber();
                  checkInfo += '\n应该减少的总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n接收账户金额变化正常，增加的FT总金额为：' + new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  this.setState({ checkProcedure: checkInfo });
                }
                else {
                  checkInfo += '\n接收账户金额变化异常，增加的FT总金额为：' + new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  checkInfo += '\n应该增加的总金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
              } else {
                if (new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).comparedTo(totalGasFee) == 0) {
                  checkInfo += '发送账户FT资产金额变化正常，减少的FT总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '发送账户金额变化异常，实际减少的FT总金额为：' + new BigNumber(oldFromFTBalance).minus(new BigNumber(newFromFTBalance)).toNumber();
                  checkInfo += '应该减少的总金额为：' + totalGasFee.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(oldFromBalance).minus(new BigNumber(newFromBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n发送账户ID为[' + transferAssetId + ']的资产金额变化正常，减少金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                } else {
                  checkInfo += '\n发送账户ID为[' + transferAssetId + ']的资产金额变化异常，实际减少的金额为：' + new BigNumber(oldFromBalance).minus(new BigNumber(newFromBalance)).toNumber();
                  checkInfo += '，应减少金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (new BigNumber(newToBalance).minus(new BigNumber(oldToBalance)).comparedTo(transferValue) == 0) {
                  checkInfo += '\n接收账户金额变化正常，增加ID为[' + transferAssetId + ']的资产金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                }
                else {
                  checkInfo += '\n接收账户金额变化异常，增加ID为[' + transferAssetId + ']的资产金额为：' + new BigNumber(newToFTBalance).minus(new BigNumber(oldToBalance)).toNumber();
                  checkInfo += '，应该增加的金额为：' + transferValue.toNumber();
                  this.setState({ checkProcedure: checkInfo });
                  result = false;
                }
                if (resultStatus != result) {
                  Feedback.toast.prompt('交易执行结果异常！');
                }
              }
              break;
            case Constant.CREATE_CONTRACT:
              break;    
            case Constant.CREATE_NEW_ACCOUNT:
              break;
            case Constant.UPDATE_ACCOUNT:
              break;
            case Constant.UPDATE_ACCOUNT_AUTHOR:
              break;
            case Constant.ISSUE_ASSET:
              break;
            case Constant.INCREASE_ASSET:
              break;
            case Constant.DESTORY_ASSET:
              break;
            case Constant.SET_ASSET_OWNER:
              break;
            case Constant.SET_ASSET_FOUNDER:
              break;
            case Constant.REG_CANDIDATE:
              break;
            case Constant.UPDATE_CANDIDATE:
              break;
            case Constant.UNREG_CANDIDATE:
              break;
            case Constant.VOTE_CANDIDATE:
              break;
            case Constant.REFUND_DEPOSIT:
              break;
        }
      }
      });
    } else {
      Feedback.toast.prompt('因无法获取receipt，故无法确认交易执行状态');
    }

  }

  recordHistory = async () => {
    const txInfo = JSON.parse(this.state.txInfo);
    txInfo.payloadElements = this.state.payloadElements;
    this.state.historyInfo['txInfo'] = txInfo;

    let fromAccount = null;
    let toAccount = null;
    if (!utils.isEmptyObj(this.state['accountName'])) {
      fromAccount = await oexchain.account.getAccountByName(this.state['accountName']);
    }
    if (!utils.isEmptyObj(this.state['toAccountName'])) {
      toAccount = await oexchain.account.getAccountByName(this.state['toAccountName']);
    }

    this.state.historyInfo['fromAccount'] = fromAccount;
    this.state.historyInfo['toAccount'] = toAccount;

  }

  onChangeResultType = (v) => {
    this.state.resultType = v;
  }
}

const styles = {
  container: {
    margin: '0',
    padding: '20px',
    width: '760px',
  },
  commonElement: {
    width: '680px',
  },
  halfElement: {
    width: '300px',
  },
  otherElement: {
    width: '760px',
  }
}