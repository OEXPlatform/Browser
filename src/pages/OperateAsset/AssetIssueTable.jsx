/* eslint-disable prefer-template */
/* eslint react/no-string-refs:0 */
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { Grid, Feedback, Button } from '@icedesign/base';
import { Input } from '@alifd/next';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
} from '@icedesign/form-binder';
import { encode } from 'rlp';
import * as oexchain from 'oex-web3';
import * as action from '../../utils/constant';
import { T } from '../../utils/lang';
import TxSend from "../TxSend";

const { Row } = Grid;

export default class AssetIssueTable extends Component {
  static displayName = 'AssetIssueTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      value: {
        assetName: '',
        symbol: '',
        amount: '',
        decimals: '',
        owner: '',
        founder: '',
        upperLimit: '',
        contract: '',
        desc: '',
      },
      inputPasswordVisible: false,
      password: '',
      txSendVisible: false,
      txInfo: {},
      assetReg: new RegExp('^([a-z][a-z0-9]{1,15})(?:\\.([a-z0-9]{1,8})){0,1}(?:\\.([a-z0-9]{1,8})){0,1}$'),
      curAccountName: props.accountName,
    };
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      curAccountName: nextProps.accountName,
      txSendVisible: false,
    })
  }

  formChange = (value) => {
    this.setState({
      value,
      txSendVisible: false,
    });
  };
  
  getFatherAssets = (assetName) => {
    const fatherAssets = [];
    const assetSplits = assetName.split('.');
    const count = assetSplits.length;
    for (let i = 1; i < count; i++) {
      let fatherAsset = assetSplits.slice(0, i).join('.');
      fatherAssets.push(fatherAsset);
    }
    return fatherAssets;
  }


  onSubmit = async () => {
    const { value } = this.state;

    if (this.state.curAccountName === '') {
      Feedback.toast.error(T('请选择需要操作资产的账户'));
      return;
    }
    let accountName = '';
    let assetName = value.assetName;
    if (value.assetName.indexOf(':') > 0) {
      accountName = value.assetName.split(':')[0];
      assetName = value.assetName.split(':')[1];
    }
    if (!this.state.assetReg.test(assetName) || assetName.length > 31) {
      Feedback.toast.error(T('资产名称错误'));
      return;
    }
    try {
      const assetInfo = await oexchain.account.getAssetInfoByName(value.assetName);
      if (assetInfo != null) {
        Feedback.toast.error(T('资产已存在'));
        return;
      }
    } catch (error) {
      // if (error.message != 'asset not exist') {
      //   Feedback.toast.error(error.message || error);
      // }
    }
    const accountInfo = await oexchain.account.getAccountByName(value.assetName);
    if (accountInfo != null) {
      Feedback.toast.error(T('资产名同账号名冲突，不可用'));
      return;
    }

    let fatherAsset = null;
    let validFatherAsset = false;
    let fatherAssetNames = this.getFatherAssets(assetName);
    for (const fatherAssetName of fatherAssetNames) {
      let assetInfo = null;
      try {
        assetInfo = await oexchain.account.getAssetInfoByName(fatherAssetName);        
      } catch (error) {
        Feedback.toast.error(T('父资产不存在，不可创建子资产'));
        return;
      }
      if (assetInfo.owner == this.state.curAccountName) {
        validFatherAsset = true;
        fatherAsset = assetInfo;
        break;
      }
    }
    if (!validFatherAsset && fatherAssetNames.length > 0) {
      Feedback.toast.error(T('由于父资产的管理者不属于此账户，因此无法创建此子资产'));
      return;
    }

    if (!this.state.assetReg.test(value.symbol)) {
      Feedback.toast.error(T('资产符号错误'));
      return;
    }
    const zero = new BigNumber(0);
    const amount = new BigNumber(value.amount);
    if (amount.comparedTo(zero) < 0) {
      Feedback.toast.error(T('资产金额必须大于0'));
      return;
    }

    const decimals = parseInt(value.decimals, 10);
    if (decimals == null) {
      Feedback.toast.error(T('请输入正确的精度'));
      return;
    }
    if (fatherAsset != null && fatherAsset.decimals != decimals) {
      Feedback.toast.error(T('父子资产的精度必须保持一致'));
      return;
    }

    let bExist = await oexchain.account.isAccountExist(value.owner);
    if (!bExist) {
      Feedback.toast.error(T('管理者账户不存在'));
      return;
    }
    bExist = await oexchain.account.isAccountExist(value.founder);
    if (!bExist) {
      Feedback.toast.error(T('创办者不存在'));
      return;
    }
    const upperLimit = new BigNumber(value.upperLimit);
    if (upperLimit.comparedTo(amount) < 0) {
      Feedback.toast.error(T('资产上限必须大于等于资产发行金额'));
      return;
    }

    const txInfo = {};
    txInfo.actionType = action.ISSUE_ASSET;
    txInfo.accountName = this.state.curAccountName;
    txInfo.toAccountName = 'oexchain.asset';
    txInfo.assetId = 0;
    txInfo.amount = 0;
    txInfo.gasLimit = 12000000;
    const rlpData = encode([value.assetName, value.symbol, '0x' + amount.shiftedBy(decimals).toString(16),
      decimals, value.founder, value.owner, '0x' + upperLimit.shiftedBy(decimals).toString(16), value.contract, value.desc]);
    txInfo.payload = `0x${rlpData.toString('hex')}`;

    this.setState({
      txInfo,
      txSendVisible: true,
    });
  }

  render() {
    return (
      <div>
        <IceFormBinderWrapper
          value={this.state.value}
          onChange={this.formChange.bind(this)}
          ref="form"
        >
          <div style={styles.formContent}>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required message={T("请输入正确的资产名称")}>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("名称")} // "^[a-z0-9]{2,16}$"
                  name="assetName"
                  size="large"
                  placeholder={T("格式：‘账户名:资产名’")}
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required message={T("请输入正确的资产符号")}>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("符号")} // "^[a-z0-9]{2,16}$"
                  name="symbol"
                  size="large"
                  placeholder={T("a~z、0~9.组成，2-16位")}
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required message={T("请输入正确金额")}>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("金额")}
                  name="amount"
                  size="large"
                  placeholder='0'
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required message={T("请输入正确精度")}>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("精度")}
                  name="decimals"
                  size="large"
                  placeholder='0'
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("管理者")}
                  name="owner"
                  size="large"
                  placeholder={T("可对此资产进行管理")}
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("创办者")}
                  name="founder"
                  size="large"
                  placeholder={T("可收取相关手续费")}
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder required>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={'*' + T("增发上限")}
                  name="upperLimit"
                  size="large"
                  placeholder={T("资产增发上限,0表示无上限")}
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder>
                <Input hasClear style={styles.inputBoder}
                  innerBefore={T("合约账户")}
                  name="contract"
                  size="large"
                  placeholder={T("留空表示非协议资产")}
                  //maxLength={16}
                />
              </IceFormBinder>
            </Row>
            <Row>
              <font>{T('资产描述')}</font>
            </Row>
            <Row style={styles.formRow} justify="center">
              <IceFormBinder>
                <Input.TextArea hasClear autoHeight
                  innerBefore={T("资产描述")}
                  maxLength={1000}
                  name="desc"
                  autoHeight={{ minRows: 4, maxRows: 18 }} 
                />
              </IceFormBinder>
            </Row>
            <Row style={styles.formRow} justify="center">
              <Button style={styles.btn} type="primary" onClick={this.onSubmit.bind(this)}>{T("提交")}</Button>
            </Row>
          </div>
        </IceFormBinderWrapper>
        <TxSend visible={this.state.txSendVisible} accountName={this.props.accountName} txInfo={this.state.txInfo}/>
      </div>
    );
  }
}

const styles = {
  formContent: {
    width: '100%',
    position: 'relative',
  },
  container: {
    margin: '10px',
    padding: '0',
  },
  title: {
    margin: '0',
    padding: '20px',
    fonSize: '16px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'rgba(0,0,0,.85)',
    fontWeight: '500',
    borderBottom: '1px solid #eee',
  },
  formRow: {
    margin: '10px 0',
  },
  formItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
  formLabel: {
    minWidth: '70px',
  },
  inputBoder: {
    borderBottom: '1px solid #dbdbdb',
    borderTop: '0px',
    borderLeft: '0px',
    borderRight: '0px',
  },
  btn: {
    width: '100%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: '#5c67f2',
    color: '#fff'
  }
};
