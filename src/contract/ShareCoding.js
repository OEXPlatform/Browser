import {AbiCoder as EthersAbiCoder} from 'ethers/utils/abi-coder';
import * as oexchain from 'oex-web3';

import * as Constant from '../utils/constant';
import TxSend from "../pages/TxSend";

function ShareCoding(contractAccountName)
{
  this.contractAccountName = contractAccountName;
}

ShareCoding.prototype = {

  enableShare : function ()  {
    const payload = '0x' + oexchain.utils.getContractPayload('enableShare', [], []);
    const txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: this.contractAccountName,
      assetId: 0,
      amount: 0,
      payload };
    return txInfo;
  },

  disableShare : function ()  {
    const payload = '0x' + oexchain.utils.getContractPayload('disableShare', [], []);
    const txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: this.contractAccountName,
      assetId: 0,
      amount: 0,
      payload };
    return txInfo;
  },

  addAcceptToken : function (tokenIds)  {
    const payload = '0x' + oexchain.utils.getContractPayload('addAcceptToken', ['uint256[]'], tokenIds);
    const txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: this.contractAccountName,
      assetId: 0,
      amount: 0,
      payload };
    return txInfo;
  },

  removeAcceptToken : function (tokenIds)  {
    const payload = '0x' + oexchain.utils.getContractPayload('removeAcceptToken', ['uint256[]'], tokenIds);
    const txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: this.contractAccountName,
      assetId: 0,
      amount: 0,
      payload };
    return txInfo;
  },

  giveReward : function (toCoder) {
    const payload = '0x' + oexchain.utils.getContractPayload('giveReward', ['address'], toCoder);
    const txInfo = { actionType: Constant.CALL_CONTRACT,
      toAccountName: this.contractAccountName,
      assetId: 0,
      amount: 0,
      payload };
    return txInfo;
  }
}

export { ShareCoding };