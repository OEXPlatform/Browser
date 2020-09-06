/* eslint-disable react/no-unused-state */
/* eslint-disable no-restricted-syntax */
import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Feedback, Select } from '@icedesign/base';
import { Table, Input, Dialog, Button, Tag, Message, Icon, Grid } from '@alifd/next';
import { ethers } from 'ethers';
import EthCrypto, { sign } from 'eth-crypto';
import * as ethUtil from 'ethereumjs-util';
import copy from 'copy-to-clipboard';
import * as oexchain from 'oex-web3';
import { createHashHistory } from 'history';

import CellEditor from './CellEditor';
import * as utils from '../../../../utils/utils'; 
import { T } from '../../../../utils/lang'; 
import { KeyStoreFile } from '../../../../utils/constant';
import eventProxy from '../../../../utils/eventProxy';
import './KeyList.scss';

const {Row, Col} = Grid;

const history = createHashHistory();

const { Group: TagGroup, Selectable: SelectableTag } = Tag;
const ActionType = { CreateFirstAccountByMnemonic: 0, CreateNewAccount: 1, ExportPrivateKey: 2, ExportKeyStoreInfo: 3, ExportMnemonic: 4,
                     DeleteAccount: 5, ImportKeystore: 6, ImportPrivateKey: 7, SignTxInfo: 8, CryptoInfo: 9 };
const MnemonicPath = "m/44'/550'/0'/0/";
const ConfusePwd = '*&^()!@863';
const ConfuseMnemonic = '*&^() !@863 sdfs* (*^d';
const NonMnemonicGenerate = T('非助记词生成');
const pwdPlaceholder = T("钱包密码，由数字加字母组成，不少于8位");

export default class KeyList extends Component {
  static displayName = 'KeyList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    
    this.state = {
      dataSource: [],
      curData: '',
      curDataIndex: -1,
      pwdDialogVisible: false,
      newPwdDialogVisible: false,
      importKeyDialogVisible: false,
      importKeystoreDialogVisible: false,
      importMnemonicDialogVisible: false,
      msgVisible: false,
      msgContent: '',
      msgTitle: T('通知'),
      method: 'keystore_listAccount',
      extraParam: [],
      password: '',
      newPassword: '',
      newPasswordConfirm: '',
      privateKey: '',
      mnemonicVisible: false,
      mnemonicWords: '',
      bip32path: '',
      reMnemonicVisible: false,
      signVisible: false,
      cryptoVisible: false,
      chainIdVisible: false,
      signResult: '',
      cryptoResult: '',
      reMnemonicWords: '',
      mnemonicWordTagList: [],
      keystoreInfo: '',
      keystorePassword: '',
      successCallback: () => {},
      errCallback: () => {
        this.setState({
          pwdDialogVisible: false,
        });
      },
    };
  }

  testEcc = (publicKey, privateKey, msg) => {
    EthCrypto.encryptWithPublicKey(publicKey, msg).then(encrypted => {
      EthCrypto.decryptWithPrivateKey(privateKey, encrypted).then(function(plaintext) {
        console.log("Message to part A:", plaintext.toString());
      });
    })
  }

  componentDidMount = () => {
     try {
      //  this.testEcc('5e60891624f78fa06978dbb7852628303349b38b288408779db09a290e2906c0229bc83421bb0b1b4947c870201a6d126e6568633110b4198432b9e6d85a209d', 
      //               '0xc5c995e7a894688c0347ea1235a09b977263314f783141dea7366b925657fbc9', 'test');
      let rpcIsOK = false;
      const chainIds = this.getStoredChainIds();
      setTimeout(() => {
        if (!rpcIsOK) {
          this.setState({chainIds, chainIdVisible: true});
        }
      }, 3000);
      
      oexchain.oex.getChainConfig().then(chainConfig => {
        rpcIsOK = true;
        this.setState({chainIdVisible: false});
        oexchain.oex.setChainId(chainConfig.chainId);
        this.loadKeyInfo();
      }).catch(error => {
        console.log(error.message);
        if (error.message.indexOf('Failed to fetch') >= 0) {
          console.log(T('无法连接节点'));
        }
      });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  }

  getStoredChainIds = () => {
    const chainIds = [];
    const data = global.localStorage.getItem(KeyStoreFile);
    if (data != null) {
      const dataObj = JSON.parse(data);
      const chainIdInfos = Object.keys(dataObj);
      chainIdInfos.map(chainIdInfo => {
        chainIds.push(chainIdInfo.split('-')[1]);
      });
    }
    return chainIds;
  }

  loadKeyInfo = () => {
    const keystoreInfoObj = utils.getDataFromFile(KeyStoreFile);
    if (keystoreInfoObj == null) {
      return;
    }
    this.state.dataSource = [];
    for (const ksInfoObj of keystoreInfoObj.keyList) {
      const bip32path = Object.prototype.hasOwnProperty.call(ksInfoObj, 'x-ethers') ? ksInfoObj['x-ethers'].path : T(NonMnemonicGenerate);
      const displayKeyObj = {'bip32path': bip32path, 'address': ksInfoObj.address, 'publicKey': ksInfoObj.publicKey};
      this.state.dataSource.push(displayKeyObj);
    }
    this.setState({ dataSource: this.state.dataSource });
  }

  renderOrder = (value, index) => {
    return <span>{index}</span>;
  };

  copyValue = (value) => {
    copy(value);
    Feedback.toast.success(T('已复制到粘贴板'));
  }

  renderPublicKey = (value) => {
    const displayValue = value.substr(0, 8) + '...' + value.substr(value.length - 6);
    return <address title={T('点击可复制')} onClick={ () => this.copyValue(value) }>{displayValue}</address>;
  }

  renderAddress = (value) => {
    value = '0x' + value;
    const displayValue = value.substr(0, 8) + '...' + value.substr(value.length - 6);
    return <address title={T('点击可复制')} onClick={ () => this.copyValue(value) }>{displayValue}</address>;
  }

  deleteItem = (index) => {
    this.state.method = ActionType.DeleteAccount;
    this.state.curData = this.state.dataSource[index];
    this.state.curDataIndex = index;
    this.setState({
      pwdDialogVisible: true,
    });
  };

  createNewAccount = (index) => {
    this.state.curData = this.state.dataSource[index];
    //history.push('http://localhost:8080/#/AccountManager');
    history.push({ pathname: '/AccountManager', state: { publicKey: this.state.curData.publicKey, selfCreateAccountVisible: true } });
  };

  cryptoInfo = (index) => {
    this.state.method = ActionType.CryptoInfo;
    this.state.curData = this.state.dataSource[index];
    this.setState({
      pwdDialogVisible: true,
    });
  };

  signTx = (index) => {
    this.state.method = ActionType.SignTxInfo;
    this.state.curData = this.state.dataSource[index];
    this.setState({
      pwdDialogVisible: true,
      signResult: '',
    });
  };

  signTxInfo = () => {
    try {
      const txInfoObj = JSON.parse(this.state.txInfo);
      oexchain.oex.signTx(txInfoObj, this.state.msgContent).then(signature => {
        this.setState({ signResult: signature });
      }).catch(error => {
        Feedback.toast.error(error.message || error);
      });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  };

  verifySignInfo = () => {
    try {
      const txInfoObj = JSON.parse(this.state.txInfo);
      if (utils.isEmptyObj(this.state.signResult)) {
        Feedback.toast.error(T('请输入签名信息'));
        return;
      }
      if (utils.isEmptyObj(this.state.signAddr)) {
        const publicKey = EthCrypto.publicKeyByPrivateKey(this.state.msgContent);
        this.state.signAddr = EthCrypto.publicKey.toAddress(publicKey);
      }
      oexchain.oex.recoverSignedTx(txInfoObj, this.state.signResult).then(address => {
        if (address == this.state.signAddr) {
          Feedback.toast.error(T('验证通过'));
        } else {
          Feedback.toast.error(T('验证失败'));
        }
      })
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  };

  encryptoInfo = () => {
    try {
      if (utils.isEmptyObj(this.state.cryptoInfo)) {
        Feedback.toast.error(T('请输入待加密的信息'));
        return;
      }
      const publicKey = EthCrypto.publicKeyByPrivateKey(this.state.msgContent);
      EthCrypto.encryptWithPublicKey(publicKey, this.state.cryptoInfo).then(encryptedInfo => {
        this.setState({cryptoResult: JSON.stringify(encryptedInfo)});        
      }).catch(error => {
        Feedback.toast.error(error.message || error);
      });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  };

  decryptoInfo = () => {
    try {
      if (utils.isEmptyObj(this.state.cryptoInfo)) {
        Feedback.toast.error(T('请输入待解密的信息'));
        return;
      }
      EthCrypto.decryptWithPrivateKey(this.state.msgContent, JSON.parse(this.state.cryptoInfo)).then(plaintext => {
        this.setState({cryptoResult: plaintext.toString()});
      }).catch(error => {
        Feedback.toast.error(error.message || error);
      });
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  };

  modifyPwd = (index) => {
    if (!this.hasKeyStoreFile()) {
      Feedback.toast.error(T('无密码可修改'));
      return;
    }
    this.setState({
      newPwdDialogVisible: true,
    });
  };

  exportPriKey = (index) => {
    this.state.method = ActionType.ExportPrivateKey;
    this.state.curData = this.state.dataSource[index];
    this.setState({
      pwdDialogVisible: true,
    });
  };
  exportMnemonic = (index) => {
    this.state.method = ActionType.ExportMnemonic;
    this.state.curData = this.state.dataSource[index];
    this.setState({
      pwdDialogVisible: true,
    });
  }
  exportKeyStore = (index) => {
    this.state.method = ActionType.ExportKeyStoreInfo;
    this.state.curData = this.state.dataSource[index];
    this.setState({
      pwdDialogVisible: true,
    });
  }
  renderOperation = (value, index) => {
    const keyInfoObj = this.state.dataSource[index];
    if (keyInfoObj.bip32path == T(NonMnemonicGenerate)) {
      return (
        <view>
          <Button type="primary" onClick={this.exportPriKey.bind(this, index)}>
            {T('导出私钥')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.exportKeyStore.bind(this, index)}>
          {T('导出keystore')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.deleteItem.bind(this, index)}>
          {T('删除')}
          </Button>
          <p /><p />
          {/* <Button type="primary" onClick={this.createNewAccount.bind(this, index)}>
          {T('创建账户')}
          </Button>
          &nbsp;&nbsp; */}
          <Button type="primary" onClick={this.signTx.bind(this, index)}>
          {T('签名/验签')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.cryptoInfo.bind(this, index)}>
          {T('加密/解密')}
          </Button>
        </view>
      );
    } else {
      return (
        <view>
          <Button type="primary" onClick={this.exportPriKey.bind(this, index)}>
          {T('导出私钥')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.exportMnemonic.bind(this, index)}>
          {T('导出助记词')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.exportKeyStore.bind(this, index)}>
          {T('导出keystore')}
          </Button>
          <p /><p />
          <Button type="primary" onClick={this.deleteItem.bind(this, index)}>
          {T('删除')}
          </Button>
          &nbsp;&nbsp;
          {/* <Button type="primary" onClick={this.createNewAccount.bind(this, index)}>
          {T('创建账户')}
          </Button>
          &nbsp;&nbsp; */}
          <Button type="primary" onClick={this.signTx.bind(this, index)}>
          {T('签名/验签')}
          </Button>
          &nbsp;&nbsp;
          <Button type="primary" onClick={this.cryptoInfo.bind(this, index)}>
          {T('加密/解密')}
          </Button>
        </view>
      );
    }
  };

  changeDataSource = (index, valueKey, value) => {
    this.state.dataSource[index][valueKey] = value;
    this.setState({
      dataSource: this.state.dataSource,
    });
  };

  renderEditor = (valueKey, value, index, record) => {
    return (
      <CellEditor
        valueKey={valueKey}
        index={index}
        value={record[valueKey]}
        onChange={this.changeDataSource}
      />
    );
  };
  checkHasDupWord = (mnemonicWords) => {
    const mnemonicWordList = mnemonicWords.split(' ');
    let obj = {};
    for (let i = 0; i < mnemonicWordList.length; i++) {
      const word = mnemonicWordList[i];
      if (Object.prototype.hasOwnProperty.call(obj, word)) {
        return true;
      }
      obj[word] = true;
    }
    return false;
  }
  addNewItem = () => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    if (keystoreInfo == null) {
      let entropy = ethers.utils.randomBytes(16);
      let mnemonicTemp = ethers.utils.HDNode.entropyToMnemonic(entropy);
      while (this.checkHasDupWord(mnemonicTemp)) {
        entropy = ethers.utils.randomBytes(16);
        mnemonicTemp = ethers.utils.HDNode.entropyToMnemonic(entropy);
      }
      this.setState({
        mnemonicVisible: true,
        mnemonicWords: mnemonicTemp,
      });
    } else {
      this.setState({
        method: ActionType.CreateNewAccount,
        pwdDialogVisible: true,
      });
    }
  }

  hasKeyStoreFile = () => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    return keystoreInfo != null;
  }

  getKeyStoreFile = () => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    return keystoreInfo != null ? JSON.parse(keystoreInfo) : null;
  }

  importPrikey = () => {
    if (!this.hasKeyStoreFile()) {
      Feedback.toast.prompt(T('初始化钱包后才能使用此功能。'));
      return;
    }
    
    this.state.method = ActionType.ImportPrivateKey;
    this.setState({
      pwdDialogVisible: true,
    });
  }

  importKeystore = () => {
    if (!this.hasKeyStoreFile()) {
      Feedback.toast.prompt(T('初始化钱包后才能使用此功能。'));
      return;
    }
    this.state.method = ActionType.ImportKeystore;
    this.setState({
      pwdDialogVisible: true,
    });
  }

  importMnemonic = () => {
    if (!this.hasKeyStoreFile()) {      
      this.setState({
        importMnemonicDialogVisible: true,
      });
    } else {
      Feedback.toast.prompt(T('无需再次初始化钱包'));
    }
  }


  errMsg = (errInfo) => {
    this.setState({
      msgTitle: T('错误信息'),
      msgVisible: true,
      msgContent: errInfo,
    });
  }
  getMnemonicIndex = () => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    if (keystoreInfo == null) {
      return 0;
    } else {
      return keystoreInfo.nextIndex;
    }
  }
  initKeyStoreFile = (initKeyInfo) => {
    let nextIndex = 1;
    if (Object.prototype.hasOwnProperty.call(initKeyInfo, 'x-ethers')) {
      const pathElements = initKeyInfo['x-ethers'].path.split('/');
      nextIndex = parseInt(pathElements[pathElements.length - 1]) + 1;
    }
    
    const keyList = [ initKeyInfo ];
    const keystoreInfo = { 'keyList': keyList, 'nextIndex': nextIndex };
    utils.storeDataToFile(KeyStoreFile, keystoreInfo);
  }
  checkHasDupAccount = (keystoreInfo, newKeyInfo) => {
    for(let i = 0; i < keystoreInfo.keyList.length; i++) {
      if (keystoreInfo.keyList[i].address === newKeyInfo.address) {
        return i;
      }
    }
    return -1;
  }
  addAccountToKeystoreFile = (keyInfo, repalceOldOne) => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    if (keystoreInfo == null) {
      this.initKeyStoreFile(keyInfo);
    } else {
      const dupIndex = this.checkHasDupAccount(keystoreInfo, keyInfo);
      if (dupIndex > -1) {
        if (repalceOldOne === true) {
          keystoreInfo.keyList.splice(dupIndex, 1);
        } else {
          Feedback.toast.error(T('不可重复添加密钥'));
          return false;
        }
      }
      keystoreInfo.keyList.push(keyInfo);
      keystoreInfo.nextIndex += 1;
      utils.storeDataToFile(KeyStoreFile, keystoreInfo);
      eventProxy.trigger('updateKeystore');
    }
    return true;
  }
  encryptWallet = (wallet, password, toastInfo, repalceOldOne) => {
    wallet.encrypt(password, null).then((ksInfoStr) => {
      const ksInfoObj = JSON.parse(ksInfoStr);
      console.log(ksInfoObj);
      const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
      console.log(publicKey);
      ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);

      if (this.addAccountToKeystoreFile(ksInfoObj, repalceOldOne)) {
        const bip32path = Object.prototype.hasOwnProperty.call(ksInfoObj, 'x-ethers') ? ksInfoObj['x-ethers'].path : T(NonMnemonicGenerate);
        const displayKeyObj = {'bip32path': bip32path, 'address': ksInfoObj.address, 'publicKey': ksInfoObj.publicKey};
        this.state.dataSource.push(displayKeyObj);

        this.setState({ dataSource: this.state.dataSource, 
          pwdDialogVisible: false, reMnemonicVisible: false, newPwdDialogVisible: false,
          importKeyDialogVisible: false, importMnemonicDialogVisible: false, importKeystoreDialogVisible: false,
          password: ConfusePwd, mnemonicWords: ConfuseMnemonic });
        if (toastInfo !== '') {
          Message.hide();
          Feedback.toast.success(toastInfo);
        }
      }
      
    }).catch(error => {
      Message.hide();
      Feedback.toast.error(error.message || error); 
      console.log(error.message);
    });
  }
  generateAccount = () => {
    const index = this.getMnemonicIndex();
    const path = MnemonicPath + index;
    //const hdNode = ethers.utils.HDNode.fromMnemonic(this.state.mnemonicWords, null, this.state.password).derivePath(path);
    const wallet = new ethers.Wallet.fromMnemonic(this.state.mnemonicWords, path, null);
    this.encryptWallet(wallet, this.state.password, T('创建成功'));
  }
  processAction = (filterFunc, toastStr, succssFunc) => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    const oexchainKSInfo = keystoreInfo.keyList.filter(filterFunc);
    const ethersKSInfo = oexchainKSInfo[0];

    if (toastStr !== '') {
      Message.show({type: 'loading', content: toastStr, duration: 0, hasMask: true});
    }
    ethers.Wallet.fromEncryptedJson(JSON.stringify(ethersKSInfo), this.state.password)
                 .then(succssFunc)
                 .catch (resp => { 
                    Message.hide();
                    Feedback.toast.error(resp.message || resp); 
                    console.log(resp.message);
                  });
  }
  getIndexOfFirstMnemonicAccount = () => {
    const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
    for (const index = 0;  index < keystoreInfo.keyList.length; index++) {
      if(Object.prototype.hasOwnProperty(keystoreInfo.keyList[index], 'x-ethers')) {
        return index;
      }
    }
    return -1;
  }
  /**
   * 1: 没有任何账户
   * 2: 有账户，同时也有用非助记词方式生成的账户
   */
  onPwdOK = () => {
    if(!utils.checkPassword(this.state.password)) {
      Feedback.toast.error(T('密码格式无效！'));
      return;
    }
    if (this.state.method === ActionType.CreateFirstAccountByMnemonic) {
      Message.show({type: 'loading', content: '创建中...', duration: 0});
      this.generateAccount();
    } else if (this.state.method === ActionType.CreateNewAccount) {
      this.processAction((item, index) => index === 0, T('创建中...'), wallet => {
        //console.log(wallet);
        this.state.mnemonicWords = wallet.mnemonic;
        this.generateAccount();
      });
    } else if (this.state.method === ActionType.ExportPrivateKey) {
      this.processAction(item => item.address === this.state.curData.address, T('导出中...'), wallet => {
        Message.hide();
        this.state.msgContent = wallet.privateKey;
        this.setState( {msgVisible: true, msgTitle: T('私钥信息'), pwdDialogVisible: false} );
      });
    } else if (this.state.method === ActionType.ExportMnemonic) {
      this.processAction(item => item.address === this.state.curData.address, T('导出中...'), wallet => {
        Message.hide();
        this.state.msgContent = wallet.mnemonic;
        this.setState( {msgVisible: true, msgTitle: T('助记词信息'), pwdDialogVisible: false} );
      });
    } else if (this.state.method === ActionType.ExportKeyStoreInfo) {      
      this.processAction(item => item.address === this.state.curData.address, T('导出中...'), wallet => {
        Message.hide();
        const keystoreInfo = utils.getDataFromFile(KeyStoreFile);
        const oexchainKSInfo = keystoreInfo.keyList.filter(item => item.address === this.state.curData.address);
        const ethersKSInfo = oexchainKSInfo[0];
        delete ethersKSInfo['x-ethers'];
        this.state.msgContent = JSON.stringify(ethersKSInfo);
        this.setState( {msgVisible: true, msgTitle: T('KeyStore信息'), pwdDialogVisible: false} );
      });
    } else if (this.state.method === ActionType.DeleteAccount) {
      this.processAction(item => item.address === this.state.curData.address, T('删除中...'), wallet => {
        Message.hide();        
        const address = this.state.curData.address;
        const keystoreInfoObj = utils.getDataFromFile(KeyStoreFile);
        keystoreInfoObj.keyList = keystoreInfoObj.keyList.filter(item => item.address !== address);
        if (keystoreInfoObj.keyList.length == 0) {
          utils.removeDataFromFile(KeyStoreFile);
        } else {
          utils.storeDataToFile(KeyStoreFile, keystoreInfoObj);
          eventProxy.trigger('updateKeystore');
        }
        this.state.dataSource.splice(this.state.curDataIndex, 1);
        this.setState({ dataSource: this.state.dataSource, pwdDialogVisible: false });
      });
    } else if (this.state.method === ActionType.ImportKeystore) {
      this.processAction((item, index) => index === 0, T('密码验证中'), wallet => {
        Message.hide();
        this.setState({
          importKeystoreDialogVisible: true,
          pwdDialogVisible: false,
        });
      });
    } else if (this.state.method === ActionType.ImportPrivateKey) {
      this.processAction((item, index) => index === 0, T('密码验证中'), wallet => {
        Message.hide();
        this.setState({
          importKeyDialogVisible: true,
          pwdDialogVisible: false,
        });
      });
    } else if (this.state.method === ActionType.SignTxInfo) {
      this.processAction(item => item.address === this.state.curData.address, T('密码验证中'), wallet => {
        Message.hide();
        this.state.msgContent = wallet.privateKey;
        this.setState({
          signVisible: true,
          pwdDialogVisible: false,
        });
      });
    } else if (this.state.method === ActionType.CryptoInfo) {
      this.processAction(item => item.address === this.state.curData.address, T('密码验证中'), wallet => {
        Message.hide();
        this.state.msgContent = wallet.privateKey;
        this.setState({
          cryptoVisible: true,
          pwdDialogVisible: false,
        });
      });
    }
  };

  onPwdClose = () => {
    this.setState({
      pwdDialogVisible: false,
    });
  };

  onMsgClose = () => {
    this.setState({
      msgVisible: false,
    });
  };

  onChangePwdOK = async () => {
    const { password, newPassword, newPasswordConfirm } = this.state;
    if (!utils.checkPassword(password) || !utils.checkPassword(newPassword) || !utils.checkPassword(newPasswordConfirm)) {
      Feedback.toast.error(T(pwdPlaceholder));
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      Feedback.toast.error(T('新密码不一致，请重新输入'));
      return;
    }
    this.processAction((item, index) => index === 0, T('原密码验证中...'), async wallet => {
      Feedback.toast.success(T('原密码验证通过，开始修改密码...'));
      this.state.dataSource = [];
      const keystoreInfoObj = utils.getDataFromFile(KeyStoreFile);
      const keyList = keystoreInfoObj.keyList;
      const wallets = [];
      let count = 1;
      for (let keystoreInfo of keyList) {
        const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(keystoreInfo), password);
        wallets.push(wallet);
        Feedback.toast.success(T('用原密码解密中:' + count++));
      }
      count = 1;
      const ksInfoObjs = [];
      for (let wallet of wallets) {
        const ksInfoStr = await wallet.encrypt(newPassword, null);
        const ksInfoObj = JSON.parse(ksInfoStr);
        const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
        ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
        ksInfoObjs.push(ksInfoObj);
        Feedback.toast.success(T('用新密码加密中:' + count++));
      }

      Feedback.toast.success(T('开始更新文件'));
      ksInfoObjs.map(ksInfoObj => {
        if (this.addAccountToKeystoreFile(ksInfoObj, true)) {
          const bip32path = Object.prototype.hasOwnProperty.call(ksInfoObj, 'x-ethers') ? ksInfoObj['x-ethers'].path : T(NonMnemonicGenerate);
          const displayKeyObj = {'bip32path': bip32path, 'address': ksInfoObj.address, 'publicKey': ksInfoObj.publicKey};
          this.state.dataSource.push(displayKeyObj);
  
          this.setState({ dataSource: this.state.dataSource, 
            pwdDialogVisible: false, reMnemonicVisible: false, newPwdDialogVisible: false,
            importKeyDialogVisible: false, importMnemonicDialogVisible: false, importKeystoreDialogVisible: false,
            password: ConfusePwd, mnemonicWords: ConfuseMnemonic });
        }
      });
      Feedback.toast.success(T('密码更新结束'));
    });
  };

  onChangePwdClose = () => {
    this.setState({
      newPwdDialogVisible: false,
    });
  };

  onImportKeyOK = () => {
    const { privateKey, password } = this.state;
    if (!ethUtil.isValidPrivate(Buffer.from(utils.hex2Bytes(privateKey)))) {
      Feedback.toast.error(T('无效私钥！'));
      return;
    }
    let wallet = new ethers.Wallet(privateKey);
    //const publicKey = '0x' + EthCrypto.publicKeyByPrivateKey(privateKey);
    Message.show({type: 'loading', content: T('开始导入...'), duration: 0, hasMask: true});
    this.encryptWallet(wallet, password, T('导入成功'));
  };

  onImportKeyClose = () => {
    this.setState({
      importKeyDialogVisible: false,
    });
  };

  onImportMnemonicOK = () => {
    let { mnemonicWords, bip32path, password, newPasswordConfirm } = this.state;
    const mnemonicWordList = mnemonicWords.trim().split(' ');
    if (mnemonicWordList.length !== 12) {
      Feedback.toast.error(T('请输入12个助记词，以空格隔开！'));
      return;
    }
    if (bip32path === '') {
      bip32path = MnemonicPath + '0';
    }
    if (bip32path.indexOf(MnemonicPath) !== 0) {
      Feedback.toast.error(T('助记词路径必须以') + MnemonicPath + T('开头！'));
      return;
    }
    if(!utils.checkPassword(password)) {
      Feedback.toast.error(T('密码必须由数字加字母组成，不少于8位'));
      return;
    }
    if(password != newPasswordConfirm) {
      Feedback.toast.error(T('密码不一致'));
      return;
    }

    const wallet = new ethers.Wallet.fromMnemonic(mnemonicWords, bip32path, null);
    Message.show({type: 'loading', content: T('开始导入...'), duration: 0, hasMask: true});
    this.encryptWallet(wallet, password, T('创建成功'));
  }

  onImportMnemonicClose = () => {
    this.setState({
      importMnemonicDialogVisible: false,
    });
  }
  
  onImportKeystoreOK = () => {
    const { keystoreInfo, keystorePassword } = this.state;
    if (keystoreInfo === '' || keystorePassword === '') {
      Feedback.toast.error(T('Keystore信息及其密码不能为空！'));
      return;
    }
    const successFunc = (wallet) => {
      this.encryptWallet(wallet, this.state.password, T('导入成功'));
    };
    Message.show({type: 'loading', content: T('开始导入...'), duration: 0, hasMask: true});
    const wallet = ethers.Wallet.fromEncryptedJson(keystoreInfo, keystorePassword)
                  .then(successFunc)
                  .catch (resp => {
                      Message.hide();
                      Feedback.toast.error(resp.message || resp); 
                      console.log(resp.message);
                    });
  }

  onImportKeystoreClose = () => {
    this.setState({
      importKeystoreDialogVisible: false,
    });
  }

  handleKeystoreChange(v) {
    this.state.keystoreInfo = v;
  }

  handleKeystorePasswordChange(v) {
    this.state.keystorePassword = v;
  }

  handlePasswordChange(v) {
    this.state.password = v;
  }

  handleNewPasswordChange(v) {
    this.state.newPassword = v;
  }

  handleNewPasswordConfirmChange(v) {
    this.state.newPasswordConfirm = v;
  }

  handlePrivateKeyChange(v) {
    this.state.privateKey = v;
  }

  handleMnemonicChange(v) {
    this.state.mnemonicWords = v;
  }

  handleBip32PathChange(v) {
    this.state.bip32path = v;
  }

  onTxInfoChange(v) {
    this.state.txInfo = v;
  }

  onCryptoInfoChange(v) {
    this.state.cryptoInfo = v;
  }

  onCryptoResultChange(v) {
    this.setState({cryptoResult: v});
  }
  onSignResultChange(v) {
    this.setState({signResult: v});
  }

  onSignAddrChange(v) {
    this.state.signAddr = v;
  }

  onSignClose = () => {
    this.setState({signVisible: false});
  }

  onCryptoClose = () => {
    this.setState({cryptoVisible: false});
  }

  onChainIdClose = () => {
    this.setState({chainIdVisible: false});
  }

  onChangeChainId = (chainId) => {
    oexchain.oex.setChainId(chainId);
    this.loadKeyInfo();
  }

  onTagChange = (word, checked) => {
    if (this.state.reMnemonicWords.indexOf(word) < 0) {
      this.state.reMnemonicWords += word + ' ';
    } else {
      this.state.reMnemonicWords = this.state.reMnemonicWords.replace(word + ' ', '');
    }
    this.setState({reMnemonicWords : this.state.reMnemonicWords});
  }

  getChaosWordList = (wordList) => {
    let chaosWordList = [];
    let length = wordList.length;
    while (length > 1) {
      const randomIndex = Math.floor(Math.random() * length);
      chaosWordList.push(wordList[randomIndex]);
      wordList = wordList.filter(item => item !== wordList[randomIndex]);
      length = wordList.length;
    }
    chaosWordList.push(wordList[0]);
    return chaosWordList;
  }
  onMnemonicOK = () => {
    const wordList = this.state.mnemonicWords.split(' ');
    const chaosWordList = this.getChaosWordList(wordList);
    this.state.mnemonicWordTagList = [];
    for (let i = 0; i < chaosWordList.length; i++) {
      this.state.mnemonicWordTagList.push(
        <SelectableTag type="primary" onChange={this.onTagChange.bind(this, chaosWordList[i])}>
          {chaosWordList[i]}
        </SelectableTag>
      );
      if ((i + 1) % 4 == 0) {
        this.state.mnemonicWordTagList.push(<br/>);
      }
    }
    this.state.reMnemonicWords = '';
    this.setState({
      mnemonicVisible: false,
      reMnemonicVisible: true,
    });
  }

  onMnemonicClose = () => {
    this.setState({
      mnemonicVisible: false,
    });
  }
  handleReMnemonicChange(v) {
    this.state.reMnemonic = v;
  }

  onReMnemonicOK = () => {
    if (this.state.reMnemonicWords.trim() === this.state.mnemonicWords.trim()) {
      this.state.method = ActionType.CreateFirstAccountByMnemonic;
      this.setState({
        pwdDialogVisible: true,
      });
    } else {
      Feedback.toast.error(T('输入有误'));
    }
  }
  onBackToMnemonic = () => {
    this.setState({
      mnemonicVisible: true,
      reMnemonicVisible: false,
    });
  }

  onReMnemonicClose = () => {
    this.setState({
      reMnemonicVisible: false,
    });
  }
  render() {
    const footerOne = (
      <Button onClick={this.onMnemonicOK} style={styles.dialogFullBtn}>
        {T('下一步')}
      </Button>
    );
    const footerTwo = (
      <div>
        <Button onClick={this.onBackToMnemonic.bind(this)} style={styles.dialogCancelBtn}>
        {T('上一步')}
        </Button>
        <Button onClick={this.onReMnemonicOK.bind(this)} style={styles.dialogOKBtn}>
        {T('下一步')}
        </Button>
      </div>
    );
    const signFooter = (
      <div>
        <Button style={styles.dialogOKBtn} type="primary" onClick={this.signTxInfo.bind(this)}>
        {T('获取签名')}
        </Button>
        <Button style={styles.dialogOKBtn} type="primary" onClick={this.verifySignInfo.bind(this)}>
        {T('验证签名')}
        </Button>
      </div>
    );
    const cryptoFooter = (
      <div>
        <Button style={styles.dialogOKBtn} type="primary" onClick={this.encryptoInfo.bind(this)}>
        {T('加密')}
        </Button>
        <Button style={styles.dialogOKBtn} type="primary" onClick={this.decryptoInfo.bind(this)}>
        {T('解密')}
        </Button>
      </div>
    );
    return (
      <div>
        {/* <div style={{margin: '70px 0 0 40%'}}>
          
        </div> */}

        <IceContainer style={{ width: '78%', height: '60%', margin: '0px 11% 20px 11%' }}>
          <Row align='center'>
            <Col>
              <h4 style={styles.title}>{T('密钥信息')}</h4>
            </Col>
            <Col>
              <Row justify='end'>
                <Button type='normal' style={styles.normalBtn} onClick={this.addNewItem.bind(this)}>
                  <Icon type='add' size="xl" />{T('初始化钱包/新增一对公私钥')}
                </Button>
                <Button type='normal' style={styles.normalBtn} onClick={this.importMnemonic.bind(this)}>
                  {T('通过导入助记词初始化钱包')}
                </Button>
                <Button type='normal' style={styles.normalBtn} onClick={this.importPrikey.bind(this)}>
                  {T('直接导入私钥')}
                </Button>
                <Button type='normal' style={styles.normalBtn} onClick={this.importKeystore.bind(this)}>
                  {T('通过keystore导入私钥')}
                </Button>
                <Button type='primary' style={styles.btn} onClick={this.modifyPwd.bind(this)}>
                  <Icon type="edit" />{T('修改密码')}
                </Button>
              </Row>
            </Col>
          </Row>
          <hr/>
          <Table  language={T('zh-cn')} dataSource={this.state.dataSource} hasBorder={false}>
            <Table.Column width={40} title="ID" cell={this.renderOrder} />
            <Table.Column
              width={120}
              title={T("公钥")}
              dataIndex="publicKey"
              cell={this.renderPublicKey.bind(this)}
            />
            <Table.Column
              width={120}
              title={T("地址")}
              dataIndex="address"
              cell={this.renderAddress}
            />
            <Table.Column
              width={120}
              title={T("生成路径")}
              dataIndex="bip32path"
            />
            <Table.Column title={T("操作")} width={300} cell={this.renderOperation.bind(this)} />
          </Table>
        </IceContainer>
        <Dialog language={T('zh-cn')} style={{width: '500px'}}
          visible={this.state.pwdDialogVisible}
          onOk={this.onPwdOK.bind(this)}
          onCancel={this.onPwdClose}
          onClose={this.onPwdClose}
          title={T("输入密码")}
          footerAlign="center"
          footer={<view>
                    <Button style={styles.dialogOKBtn} type='primary' onClick={this.onPwdOK.bind(this)}>{T('确定')}</Button>
                    <Button style={styles.dialogCancelBtn} type='normal' onClick={this.onPwdClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Input hasClear autoFocus
            htmlType="password"
            onChange={this.handlePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("密码")}
            placeholder={T(pwdPlaceholder)}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onPwdOK.bind(this)}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '400px', height: '400px'}}
          visible={this.state.msgVisible}
          title={this.state.msgTitle != null ? this.state.msgTitle : T('通知')}
          closeable="esc,mask,close"
          onOk={this.onMsgClose}
          onCancel={this.onMsgClose}
          onClose={this.onMsgClose}
          footer={<div></div>}
        >
          <Input.TextArea
            style={{background: 'rgb(238,238,238)'}}
            autoHeight={{ minRows: 4, maxRows: 12 }}
            readOnly
            value={this.state.msgContent}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '500px'}}
          visible={this.state.newPwdDialogVisible}
          onOk={this.onChangePwdOK}
          onCancel={this.onChangePwdClose}
          onClose={this.onChangePwdClose}
          title={T("修改密码")}
          footerAlign="center"
          footer={<view>
                    <Button style={styles.dialogOKBtn} type='primary' onClick={this.onChangePwdOK.bind(this)}>{T('确定')}</Button>
                    <Button style={styles.dialogCancelBtn} type='normal' onClick={this.onChangePwdClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Input hasClear
            htmlType="password"
            onChange={this.handlePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("旧密码")}
            placeholder={T(pwdPlaceholder)}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onChangePwdOK}
          />
          <p />
          <p />
          <Input hasClear
            htmlType="password"
            onChange={this.handleNewPasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("新密码")}
            placeholder={T(pwdPlaceholder)}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onChangePwdOK}
          />
          <p />
          <p />
          <Input hasClear
            htmlType="password"
            onChange={this.handleNewPasswordConfirmChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("新密码确认")}
            placeholder={T(pwdPlaceholder)}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onChangePwdOK}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '500px'}}
          visible={this.state.importKeyDialogVisible}
          onOk={this.onImportKeyOK}
          onCancel={this.onImportKeyClose}
          onClose={this.onImportKeyClose}
          title={T("导入私钥")}
          footerAlign="center"
          footer={<view>
                    <Button style={styles.dialogOKBtn} type='primary' onClick={this.onImportKeyOK.bind(this)}>{T('确定')}</Button>
                    <Button style={styles.dialogCancelBtn} type='normal' onClick={this.onImportKeyClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Input hasClear
            onChange={this.handlePrivateKeyChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("私钥")}
            placeholder={T("需包含0x前缀")}
            size="medium"
            defaultValue=""
            maxLength={66}
            hasLimitHint
            onPressEnter={this.onImportKeyOK}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '500px'}}
          visible={this.state.importMnemonicDialogVisible}
          onOk={this.onImportMnemonicOK}
          onCancel={this.onImportMnemonicClose}
          onClose={this.onImportMnemonicClose}
          title={T("导入助记词")}
          footerAlign="center"
          footer={<view>
                    <Button style={styles.dialogOKBtn} type='primary' onClick={this.onImportMnemonicOK.bind(this)}>{T('确定')}</Button>
                    <Button style={styles.dialogCancelBtn} type='normal' onClick={this.onImportMnemonicClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Input hasClear multiple
            onChange={this.handleMnemonicChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("助记词")}
            placeholder={T("输入助记词，用空格隔开")}
            size="medium"
            defaultValue=''
            onPressEnter={this.onImportMnemonicOK}
          />
          <p />
          <p />
          <Input hasClear
            onChange={this.handleBip32PathChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("助记词生成路径")}
            size="medium"
            defaultValue={MnemonicPath + '0'}
            hasLimitHint
            onPressEnter={this.onImportMnemonicOK}
          />
          <p />
          <p />
          <Input hasClear
            htmlType="password"
            onChange={this.handlePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("密码")}
            placeholder={T("此密码将作为钱包密码，由数字加字母组成，不少于8位")}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
          />
          <p />
          <p />
          <Input hasClear
            htmlType="password"
            onChange={this.handleNewPasswordConfirmChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("密码确认")}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onImportMnemonicOK}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '500px' }}
          visible={this.state.importKeystoreDialogVisible}
          onOk={this.onImportKeystoreOK}
          onCancel={this.onImportKeystoreClose}
          onClose={this.onImportKeystoreClose}
          title={T("导入Keystore信息")}
          footerAlign="center"
          footer={<view>
                    <Button style={styles.dialogOKBtn} type='primary' onClick={this.onImportKeystoreOK.bind(this)}>{T('确定')}</Button>
                    <Button style={styles.dialogCancelBtn} type='normal' onClick={this.onImportKeystoreClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Input hasClear multiple
            onChange={this.handleKeystoreChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("Keystore")}
            size="medium"
            rows='8'
            defaultValue=''
            onPressEnter={this.onImportKeystoreOK}
          />
          <p />
          <p />
          <Input hasClear
            htmlType="password"
            onChange={this.handleKeystorePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("密码")}
            placeholder={T("此密码为keystore绑定密码，非本地钱包密码")}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onImportKeystoreOK}
          />
          <p />
          {T("此Keystore信息导入后，将会由本地钱包重新加密成新的keystore保存，但私钥会保持一致")}
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '300px' }}
          visible={this.state.mnemonicVisible}
          title={T("助记词")}
          footer={footerOne}
          footerAlign="center"
          closeable="esc,close"
          onCancel={this.onMnemonicClose}
          onClose={this.onMnemonicClose}
        >
          <Input.TextArea
            style={{background: 'rgb(238,238,238)', fontSize: '18px'}}
            readOnly
            autoHeight={{ minRows: 4, maxRows: 4 }}
            value={this.state.mnemonicWords}
          />
          <p />
          <font color='red'>{T("此处请务必保存好助记词")}</font>
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '400px' }}
          visible={this.state.reMnemonicVisible}
          title={T("请按序输入上一步显示的助记词")}
          footer={footerTwo}
          footerAlign="center"
          closeable="esc,close"
          onCancel={this.onReMnemonicClose}
          onClose={this.onReMnemonicClose}
        >
          <Input.TextArea
            style={{background: 'rgb(238,238,238)'}}
            readOnly
            autoHeight={{ minRows: 4, maxRows: 4 }}
            value={this.state.reMnemonicWords}
          />
          <p />
          <TagGroup>{this.state.mnemonicWordTagList}</TagGroup>
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '500px' }}
          visible={this.state.signVisible}
          title={T("签名/验签交易")}
          footer={signFooter}
          footerAlign="center"
          closeable="esc,mask,close"
          onCancel={this.onSignClose}
          onClose={this.onSignClose}
        >
          <Input multiple
            style={styles.inputBoder}
            innerBefore={T("交易信息")}
            rows='5'
            onChange={this.onTxInfoChange.bind(this)}
          />
          <p />
          <p />
          <Input hasClear
            style={styles.inputBoder}
            innerBefore={T("签名结果")}
            size="medium"
            value={this.state.signResult}
            onChange={this.onSignResultChange.bind(this)}
          />
          <p />
          <p />
          <Input hasClear
            style={styles.inputBoder}
            innerBefore={T("待比较地址")}
            placeholder={T("验证签名时可填写")}
            size="medium"
            onChange={this.onSignAddrChange.bind(this)}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '500px' }}
          visible={this.state.cryptoVisible}
          title={T("加/解密信息")}
          footer={cryptoFooter}
          footerAlign="center"
          closeable="esc,mask,close"
          onCancel={this.onCryptoClose}
          onClose={this.onCryptoClose}
        >
          <Input multiple hasClear
            innerBefore={T("加/解密信息")}
            style={styles.inputBoder}
            rows='5'
            onChange={this.onCryptoInfoChange.bind(this)}
          />
          <p />
          <p />
          <Input multiple hasClear
            style={styles.inputBoder}
            innerBefore={T("加/解密结果")}
            size="medium"
            rows='3'
            value={this.state.cryptoResult}
            onChange={this.onCryptoResultChange.bind(this)}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{ width: '300px' }}
          visible={this.state.chainIdVisible}
          title={T("选择ChainId")}
          footerAlign="center"
          closeable="esc,mask,close"
          onOk={this.onChainIdClose}
          onCancel={this.onChainIdClose}
          onClose={this.onChainIdClose}
          footer={<view>
                    <Button style={styles.dialogFullBtn} type='normal' onClick={this.onChainIdClose.bind(this)}>{T('取消')}</Button>
                  </view>}
        >
          <Select
            style={{...styles.selectBoder, width: '100%'}}
            placeholder={T("请选择ChainId")}
            onChange={this.onChangeChainId.bind(this)}
            dataSource={this.state.chainIds}
          />
        </Dialog>
      </div>
    );
  }
}

const styles = {
  addNewItem: {
    background: '#F5F5F5',
    height: 32,
    lineHeight: '32px',
    marginTop: 20,
    cursor: 'pointer',
    textAlign: 'center',
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
  },
  btns: {

  },
  btn: {
    borderRadius: '2px',
    backgroundColor: '#5c67f2',
    textAlign: 'center',
    marginLeft: '20px',
  },
  normalBtn: {
    borderRadius: '2px',
    backgroundColor: 'transparent',
    marginLeft: '20px',
    color: '#5c67f2',
  },
  dialogFullBtn: {
    width: '100%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: '#5c67f2',
    color: '#fff'
  },
  dialogOKBtn: {
    width: '45%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: '#5c67f2',
    marginRight: '5%',
    color: '#fff'
  },
  dialogCancelBtn: {
    width: '45%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: 'transparent',
    marginRight: '5%'
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
};
