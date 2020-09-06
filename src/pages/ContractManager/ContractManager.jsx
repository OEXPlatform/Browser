import React, { Component } from 'react';
import { Input, Feedback, Card, Select, Checkbox } from '@icedesign/base';
import Container from '@icedesign/container';
import { Button } from '@alifd/next';
import * as oexchain from 'oex-web3';
import cookie from 'react-cookies';

import * as utils from '../../utils/utils'
import { T } from '../../utils/lang'
import TxSend from "../TxSend";
import * as Constant from '../../utils/constant';
import ContractEditor from './components/Editor';

const ContractArea = ({ self, abiInfo }) => {
  //const {abiInfo} = props;
  self.state.contractFuncInfo = [];
  for (const interfaceInfo of abiInfo) {
    if (interfaceInfo.type === 'function') {
      const funcName = interfaceInfo.name;
      const parameterTypes = [];
      const parameterNames = [];
      for (const input of interfaceInfo.inputs) {
        parameterTypes.push(input.type);
        parameterNames.push(input.name);
      }
      self.state.funcParaTypes[funcName] = parameterTypes;
      self.state.funcParaNames[funcName] = parameterNames;
      self.state.funcParaConstant[funcName] = interfaceInfo.constant;
      self.state.contractFuncInfo.push(self.generateOneFunc(funcName, parameterTypes, parameterNames));
      self.state.contractFuncInfo.push(<br />);
      self.state.contractFuncInfo.push(<br />);
    }
  }
  return self.state.contractFuncInfo;
} 

export default class ContractManager extends Component {
  static displayName = 'ContractManager';

  constructor(props) {
    super(props);
    let abiInfoStr = '';
    const abiInfo = global.localStorage.getItem('abiInfo');
    if (abiInfo != null) {
      abiInfoStr = JSON.stringify(abiInfo).replace(/\\"/g, '"');
      abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
    }
    const abiContractName = cookie.load('abiContractName');

    this.state = {
      accounts: [],
      contractFuncInfo: [],
      abiInfos: [],
      abiInfoObj: {},
      paraValue: {},
      funcParaTypes: {},
      funcParaNames: {},
      funcParaConstant: {},
      result: {},
      txInfo: {},
      txSendVisible: false,
      contractName: abiContractName,
      contractAccount: abiContractName,
      selectedAccountName: '',
      transferTogether: {},
      visibilityValue: {},
      curCallFuncName: '',
      curTxResult: {},
      resultDetailInfo: '',
    };
  }

  componentDidMount = async () => {
    const chainConfig = await oexchain.oex.getChainConfig();
    oexchain.oex.setChainId(chainConfig.chainId);

    const accounts = await utils.loadAccountsFromLS();
    for (let account of accounts) {
      this.state.accounts.push(account.accountName);
    }

    const abiInfo = global.localStorage.getItem('abiInfo');
    if (abiInfo != null) {
      let abiInfoStr = JSON.stringify(abiInfo).replace(/\\"/g, '"');
      abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
      this.setState({ storedAbiInfo: abiInfoStr });
    }
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   console.log(this.state.visibilityValue);
  //   console.log(nextState.visibilityValue);
  //   return true;
  // }

  handleContractAccountChange = (value) => {
    this.state.contractAccount = value;
  }

  saveContractName = (value) => {
    this.state.contractName = value.currentTarget.defaultValue;
    cookie.save('abiContractName', this.state.contractName);
  }

  handleABIInfoChange = (value) => {
    this.setState({ abiInfo: value });
  }

  parseABI = () => {
    if (utils.isEmptyObj(this.state.abiInfo) 
    || (!utils.isEmptyObj(this.state.abiInfo) && !oexchain.utils.isValidABI(this.state.abiInfo))) {
      Feedback.toast.error(T('ABI信息不符合规范，请检查后重新输入'));
      return;
    }
    const abiInfo = JSON.parse(this.state.abiInfo);
    global.localStorage.setItem('abiInfo', this.state.abiInfo);
    this.setState({ abiInfos: [abiInfo], txSendVisible: false });
  }

  

  handleParaValueChange = (funcName, paraName, value) => {
    this.state.paraValue[funcName + '-' + paraName] = value;
  }

  onChangeAccount = async (accountName) => {
    this.setState({ selectedAccountName: accountName });
  }

  callContractFunc = async (funcName) => {
    if (utils.isEmptyObj(this.state.selectedAccountName)) {
      Feedback.toast.error(T('请选择发起合约调用的账号'));
      return;
    }

    if (utils.isEmptyObj(this.state.contractAccount)) {
      Feedback.toast.error(T('请输入合约账号名'));
      return;
    }
    const contractAccount = await oexchain.account.getAccountByName(this.state.contractAccount);
    if (contractAccount == null) {
      Feedback.toast.error(T('合约不存在，请检查合约名是否输入错误'));
      return;
    }
    const paraNames = this.state.funcParaNames[funcName];
    const values = [];
    for (const paraName of paraNames) {
      const value = this.state.paraValue[funcName + '-' + paraName];
      if (value == null) {
        Feedback.toast.error(T('参数') + paraName + T('尚未输入值'));
        return;
      }
      values.push(value);
    }
    const self = this;
    const payload = '0x' + oexchain.utils.getContractPayload(funcName, this.state.funcParaTypes[funcName], values);
    if (this.state.funcParaConstant[funcName]) {
      const callInfo = {actionType:0, from: 'oexchain.founder', to: this.state.contractAccount, assetId:0, gas:200000000, gasPrice:10000000000, value:0, data:payload, remark:''};
      oexchain.oex.call(callInfo, 'latest').then(resp => {
        console.log(funcName + '=>' + resp);
        // var obj = document.getElementById(funcName + 'Result');
        // obj.value= resp;

        self.setState({ result : {[funcName + 'Result'] : resp}, txSendVisible: false });
      });
    } else {
      const assetId = this.state.transferTogether[funcName] ? parseInt(this.state.paraValue[funcName + '-transferAssetId']) : 0;
      const amount = this.state.transferTogether[funcName] ? parseInt(this.state.paraValue[funcName + '-transferAssetValue']) : 0;
      this.state.txInfo = { actionType: Constant.CALL_CONTRACT,
        toAccountName: this.state.contractAccount,
        assetId,
        amount,
        payload };
      this.setState({ txSendVisible: true, curCallFuncName: funcName });
    }
  }

  generateOneFunc = (funcName, parameterTypes, parameterNames) => {
    let index = 0;
    let inputElements = [];
    let txReceiptBtns = [];
    let callBtnName = T('查询结果');
    const self = this;
    parameterNames.forEach(paraName => {
      inputElements.push(<Input hasClear
        onChange={this.handleParaValueChange.bind(this, funcName, paraName)}
        style={{ width: 600 }}
        addonBefore={paraName}
        size="medium"
        placeholder={parameterTypes[index++]}
      />, <br />, <br />,
      )
    });
    if (!this.state.funcParaConstant[funcName]) {
      callBtnName = T('发起合约交易');
      const transferTogether = this.state.transferTogether[funcName];
      this.state.visibilityValue[funcName] = (transferTogether != null && transferTogether) ? 'block' : 'none';
      inputElements.push(
      <Checkbox
        onChange={checked => {
          let transferTogether = utils.deepClone(self.state.transferTogether);
          transferTogether[funcName] = checked;
          let visibilityValue = utils.deepClone(self.state.visibilityValue);
          visibilityValue[funcName] = checked ? 'block' : 'none';
          // self.state.visibilityValue[funcName] = checked ? 'block' : 'none';
          self.setState({ transferTogether, visibilityValue, txSendVisible: false });
          var obj = document.getElementById(funcName + 'Container');
          obj.style.display= visibilityValue[funcName];
        }}>{T('附带转账')}</Checkbox>,<br />,<br />,
      <Container id={funcName + 'Container'} style={{display: self.state.visibilityValue[funcName], height:'50'}}>
        <Input hasClear
          onChange={this.handleParaValueChange.bind(this, funcName, 'transferAssetId')}
          style={{ width: 600 }}
          addonBefore={T('转账资产ID')}
          size="medium"
        /><br /><br />
        <Input hasClear
          onChange={this.handleParaValueChange.bind(this, funcName, 'transferAssetValue')}
          style={{ width: 600 }}
          addonBefore={T('转账资产金额')}
          size="medium"
        />
      </Container>,);

      txReceiptBtns.push(<br />,<br />,
        <Button type="primary" onClick={this.getTxInfo.bind(this, funcName)} style={{marginRight: '20px'}}>{T('查询交易')}</Button>,
        <Button type="primary" onClick={this.getReceiptInfo.bind(this, funcName)}>{T('查询Receipt')}</Button>,<br />,<br />,
        <Input id={funcName + 'TxReceipt'} 
          multiple
          rows="5"
          style={{ width: 600 }}
          addonBefore={T("交易/Receipt信息:")}
          size="medium"
        />
      );
    }
    const oneElement = <Card style={{ width: 800 }} bodyHeight="auto" title={funcName}>
                        {inputElements}
                        <Button type="primary" onClick={this.callContractFunc.bind(this, funcName)}>{callBtnName}</Button>
                        <br />
                        <br />
                        <form>
                          <Input id={funcName + 'Result'} 
                            style={{ width: 600 }} 
                            addonBefore={T('结果')} size="medium" 
                            value={this.state.result[funcName + 'Result']}
                            onChange={this.onChangeValue.bind(this, funcName)}/>
                        </form>
                        {txReceiptBtns}
                      </Card>;
    return oneElement;
  }
  onChangeValue = (value, funcName) => {
    this.setState({result: {[funcName + 'Result'] : value}});
  }
  reInputContent = (funcName) => {
    var obj = document.getElementById(funcName + 'Result');
    obj.value= this.state.result[funcName + 'Result'];
  }
  getTxInfo = (funcName) => {
    const result = this.state.curTxResult[funcName];
    if (result != null) {
      if (result.indexOf('0x') != 0) {
        Feedback.toast.error(T('非交易hash，无法查询'));
        return;
      }
      oexchain.oex.getTransactionByHash(result).then(txInfo => {
        var obj = document.getElementById(funcName + 'TxReceipt');
        obj.value= JSON.stringify(txInfo);
      });
    }
  }

  getReceiptInfo = (funcName) => {
    const result = this.state.curTxResult[funcName];
    if (result != null) {
      if (result.indexOf('0x') != 0) {
        Feedback.toast.error(T('非交易hash，无法查询'));
        return;
      }
      oexchain.oex.getTransactionReceipt(result).then(receipt => {
        if (receipt == null) {
          Feedback.toast.error(T('receipt尚未生成'));
          return;
        }
        var obj = document.getElementById(funcName + 'TxReceipt');
        obj.value= JSON.stringify(receipt);
        const actionResults = receipt.actionResults;
        if (actionResults[0].status == 0) {
          Feedback.toast.error(T('Receipt表明本次交易执行失败，原因') + ':' + actionResults[0].error);
        }
      });
    }
  }

  importABI = () => {
    if (utils.isEmptyObj(this.state.contractAccount)) {
      Feedback.toast.error(T('请输入合约账号名'));
      return;
    }

    const abiInfoObj = utils.getDataFromFile(Constant.ContractABIFile);
    if (abiInfoObj != null && abiInfoObj[this.state.contractAccount] != null) {
      let abiInfoStr = JSON.stringify(abiInfoObj[this.state.contractAccount]).replace(/\\"/g, '"');
      abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
      this.setState({ abiInfo: abiInfoStr });
    } else {
      const contractName = global.localStorage.getItem('contractAccount:' + this.state.contractAccount);
      if (contractName != null) {
        const abiInfoObj = global.localStorage.getItem('contract:' + contractName);
        let abiInfoStr = JSON.stringify(abiInfoObj).replace(/\\"/g, '"');
        abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
        this.setState({ abiInfo: abiInfoStr });
      } else {
        Feedback.toast.prompt(T('账号未保存ABI信息，无法导入'));
      }
    }
  }
  getTxResult = (result) => {
    var obj = document.getElementById(this.state.curCallFuncName + 'Result');
    obj.value= result;
    this.state.curTxResult[this.state.curCallFuncName] = result;
  }
  render() {
    const self = this;
    return (
      <div style={{width:900}}>
        {/* <ContractEditor style={{height:800, width:800}}/>
        <br />
        <br /> */}
        <Select language={T('zh-cn')}
            style={{ width: 800 }}
            placeholder={T("选择发起合约调用的账户")}
            onChange={this.onChangeAccount.bind(this)}
            dataSource={this.state.accounts}
          />
          <br />
          <br />
        <Input hasClear
          htmlType={this.state.htmlType}
          style={{ width: 800 }}
          maxLength={50}
          hasLimitHint
          addonBefore={T("合约账号")}
          defaultValue={this.state.contractName}
          size="medium"
          onChange={this.handleContractAccountChange.bind(this)}
          onBlur={this.saveContractName.bind(this)}
        />
        &nbsp;&nbsp;
        <Button type="primary" onClick={this.importABI.bind(this)}>{T("导入ABI")}</Button>
        <br />
        <br />
        <Input multiple
          rows="13"
          style={{ width: 800 }}
          addonBefore={T("ABI信息")}
          value={this.state.abiInfo}
          size="medium"
          onChange={this.handleABIInfoChange.bind(this)}
        />
        <br />
        <br />
        <Button type="primary" onClick={this.parseABI.bind(this)}>{T("解析ABI")}</Button>
        <br />
        <br />
        {/* {this.state.contractFuncInfo.map(item => item)} */}
        {this.state.abiInfos.map((abiInfoObj) => (<ContractArea key='1' abiInfo={abiInfoObj} self={self}/>))}
        
        <TxSend visible={this.state.txSendVisible} txInfo={this.state.txInfo} accountName={this.state.selectedAccountName} sendResult={this.getTxResult.bind(this)}/>
      </div>
    );
  }
}
