import { ethers } from 'ethers';
import EthCrypto from 'eth-crypto';
import * as ethUtil from 'ethereumjs-util';
import * as oexchain from 'oex-web3';
import * as constant from './constant';
import * as utils from './utils';

const ChainIdPrefix = constant.ChainIdPrefix;
let KeyStoreFileName = constant.KeyStoreFile;
let MnemonicPath = "m/44'/551'/0'/0/";

export function setKeystoreFile(keystoreFile) {
  KeyStoreFileName = keystoreFile;
}

export function setMnemonicPath(mnemonicPath) {
  MnemonicPath = mnemonicPath;
}

function getDataFromFile(chainProvider) {
  if (chainProvider == null) {
    chainProvider = oexchain.oex.getChainId();
  }
  const data = global.localStorage.getItem(KeyStoreFileName);
  if (data != null) {
    const dataObj = JSON.parse(data);
    return dataObj[ChainIdPrefix + chainProvider];
  }
  return null;
}

function storeDataToFile(toSaveObj, chainProvider) {
  if (chainProvider == null) {
    chainProvider = oexchain.oex.getChainId();
  }
  let dataObj = {};
  const data = global.localStorage.getItem(KeyStoreFileName);
  if (data != null) {
    dataObj = JSON.parse(data);
  }
  dataObj[ChainIdPrefix + chainProvider] = toSaveObj;
  const dataStr = JSON.stringify(dataObj);
  global.localStorage.setItem(KeyStoreFileName, dataStr);
}

function initKeyStoreFile(initKeyInfo) {
  let nextIndex = 1;
  if (Object.prototype.hasOwnProperty.call(initKeyInfo, 'x-ethers')) {
    const pathElements = initKeyInfo['x-ethers'].path.split('/');
    nextIndex = parseInt(pathElements[pathElements.length - 1]) + 1;
  }
  
  const keyList = [ initKeyInfo ];
  const keystoreInfo = { 'keyList': keyList, 'nextIndex': nextIndex };
  storeDataToFile(keystoreInfo);
}

function checkHasDupAccount(keystoreInfo, newKeyInfo) {
  for(let i = 0; i < keystoreInfo.keyList.length; i++) {
    if (keystoreInfo.keyList[i].address === newKeyInfo.address) {
      return i;
    }
  }
  return -1;
}

function addAccountToKeystoreFile(keyInfo) {
  const keystoreInfo = getDataFromFile();
  if (keystoreInfo == null) {
    initKeyStoreFile(keyInfo);
  } else {
    const dupIndex = checkHasDupAccount(keystoreInfo, keyInfo);
    if (dupIndex > -1) {
      throw new Error("Can't add duplicated keys.");
    }
    keystoreInfo.keyList.push(keyInfo);
    keystoreInfo.nextIndex += 1;
    storeDataToFile(keystoreInfo);
  }
  return true;
}

function getMnemonicIndex() {
  const keystoreInfo = getDataFromFile();
  if (keystoreInfo == null) {
    return 0;
  } else {
    return keystoreInfo.nextIndex;
  }
}

async function generateAccount (mnemonicWords, password) {
  const index = getMnemonicIndex();
  const path = MnemonicPath + index;
  //const hdNode = ethers.utils.HDNode.fromMnemonic(this.state.mnemonicWords, null, this.state.password).derivePath(path);
  const wallet = new ethers.Wallet.fromMnemonic(mnemonicWords, path, null);
  return wallet.encrypt(password, null);
}

// password: MUST
// keyStoreFile: Selectable
export async function init(password) {
  const keystoreInfo = getDataFromFile();
  if (keystoreInfo == null) {
    let entropy = ethers.utils.randomBytes(16);
    let mnemonicWords = ethers.utils.HDNode.entropyToMnemonic(entropy);
    
    const wallet = new ethers.Wallet.fromMnemonic(mnemonicWords, MnemonicPath + '0', null);
    const ksInfoStr = await wallet.encrypt(password, null);
    const ksInfoObj = JSON.parse(ksInfoStr);
    const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
    ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
    addAccountToKeystoreFile(ksInfoObj);
    return ksInfoObj;
  } 
  throw new Error('Account wallet has been inited.');
}

export function initByMnemonic(mnemonicWords, password) {
  const keystoreInfo = getDataFromFile();
  if (keystoreInfo != null) {   
    throw new Error('Account wallet has been inited.'); 
  }
  const mnemonicWordList = mnemonicWords.trim().split(' ');
  if (mnemonicWordList.length != 12) {
    throw new Error('Mnemonic words must be 12 and split by blank space.');
  }
  const wallet = new ethers.Wallet.fromMnemonic(mnemonicWords, MnemonicPath + '0  ', null);
  wallet.encrypt(password, null).then((ksInfoStr) => {
    const ksInfoObj = JSON.parse(ksInfoStr);
    const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
    ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
    addAccountToKeystoreFile(ksInfoObj);      
  });
}

async function checkPassword(password, filterFunc) {
  const keystoreInfo = getDataFromFile();
  if (keystoreInfo == null) {   
    throw new Error("Account wallet hasn't been inited."); 
  }
  const oexchainKSInfo = keystoreInfo.keyList.filter(filterFunc);
  const ethersKSInfo = oexchainKSInfo[0];

  return ethers.Wallet.fromEncryptedJson(JSON.stringify(ethersKSInfo), password);
}

export async function addOneKeyPair(password) {
  const wallet = await checkPassword(password, (index) => index === 0);
  const ksInfoStr = await generateAccount(wallet.mnemonic, password);
  
  const ksInfoObj = JSON.parse(ksInfoStr);
  const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
  ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
  addAccountToKeystoreFile(ksInfoObj);  
  return ksInfoObj.address;
}

export async function importPrivateKey(privateKey, password) {
  if (!ethUtil.isValidPrivate(Buffer.from(utils.hex2Bytes(privateKey)))) {
    throw new Error("Private key is invalid."); 
  }

  await checkPassword(password, (index) => index === 0);
  let wallet = new ethers.Wallet(privateKey);
  wallet.encrypt(password, null).then((ksInfoStr) => {
    const ksInfoObj = JSON.parse(ksInfoStr);
    const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
    ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
    addAccountToKeystoreFile(ksInfoObj);      
  });
}

export async function importKeystore(keystoreInfo, keystorePassword, password) {
  await checkPassword(password, (index) => index === 0);
  const wallet = await ethers.Wallet.fromEncryptedJson(keystoreInfo, keystorePassword);
  wallet.encrypt(password, null).then((ksInfoStr) => {
    const ksInfoObj = JSON.parse(ksInfoStr);
    const publicKey = EthCrypto.publicKeyByPrivateKey(wallet.privateKey);
    ksInfoObj['publicKey'] = utils.getPublicKeyWithPrefix(publicKey);
    addAccountToKeystoreFile(ksInfoObj);      
  });
}

export function getAllKeys() {
  const keystoreInfoObj = getDataFromFile();
  if (keystoreInfoObj == null) {
    return [];
  }
  const dataSource = [];
  for (const ksInfoObj of keystoreInfoObj.keyList) {
    const bip32path = Object.prototype.hasOwnProperty.call(ksInfoObj, 'x-ethers') ? ksInfoObj['x-ethers'].path : '';
    const displayKeyObj = {'bip32path': bip32path, 'address': ksInfoObj.address, 'publicKey': ksInfoObj.publicKey};
    dataSource.push(displayKeyObj);
  }
  return dataSource;
}

export async function exportPrivateKey(address, password) {
  const keystoreInfoObj = getDataFromFile();
  if (keystoreInfoObj == null) {
    return null;
  }
  for (const ksInfoObj of keystoreInfoObj.keyList) {
    if (utils.isEqualAddress(ksInfoObj.address, address)) {
      const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(ksInfoObj), password);
      return wallet.privateKey;
    }
  }
  return null;
}

export async function exportKeystore(address, password) {
  await checkPassword(password, (index) => index === 0);
  for (const ksInfoObj of keystoreInfoObj.keyList) {
    if (utils.isEqualAddress(ksInfoObj.address, address)) {
      return JSON.stringify(ksInfoObj);
    }
  }
  return null;
}

export async function exportMnemonic(address, password) {
  const keystoreInfoObj = getDataFromFile();
  if (keystoreInfoObj == null) {
    return null;
  }
  for (const ksInfoObj of keystoreInfoObj.keyList) {
    if (utils.isEqualAddress(ksInfoObj.address, address)) {
      const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(ksInfoObj), password);
      return wallet.mnemonic;
    }
  }
  return null;
}


export default { setKeystoreFile, setMnemonicPath, init, initByMnemonic, addOneKeyPair, 
  importPrivateKey, importKeystore, getAllKeys, exportPrivateKey, exportKeystore, exportMnemonic }


