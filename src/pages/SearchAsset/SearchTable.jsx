/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import React, { Component } from 'react';
import { Table, Pagination, Search, Feedback, Select } from '@icedesign/base';
import { Button, Grid, Input } from "@alifd/next";
import IceContainer from '@icedesign/container';
import BigNumber from 'bignumber.js';
import * as oexchain from 'oex-web3';
import * as utils from '../../utils/utils';  
import { T } from '../../utils/lang';

const { Row, Col } = Grid;
const searchImg = require('./images/Search_icon.png');

export default class SearchTable extends Component {
  static displayName = 'SearchTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      assetInfos: {},
      balanceInfos: [],
      balanceInfosOnePage: [],
      onePageNum: 10,
      assetInfo: [],
      urc20Visible: 'none',
      curPlaceholder: '账户名',
      isSearchAccount: true,
      searchTypes: [{label: T('用户资产信息查询'), value: 'userAssetInfo'}, {label: T('资产发行信息查询'), value: 'assetIssueInfo'}],
    };
  }


  getReadableNumber = (value, assetID) => {
    const { assetInfos } = this.state;
    const decimals = assetInfos[assetID].decimals;

    let renderValue = new BigNumber(value);
    renderValue = renderValue.shiftedBy(decimals * -1);

    BigNumber.config({ DECIMAL_PLACES: 6 });
    renderValue = renderValue.toString(10);
    return renderValue;
  }

  onUserAccountSearch = async (value) => {
    try {
      const balanceInfos = [];
      const account = await oexchain.account.getAccountByName(value);
      if (account == null) {
        Feedback.toast.error(T('无此账户信息'));
        return;
      }
      const assetBalances = account.balances;
      for (const assetBalance of assetBalances) {
        const assetInfo = await oexchain.account.getAssetInfoById(assetBalance.assetID);
        this.state.assetInfos[assetBalance.assetID] = assetInfo;
        const readableValue = this.getReadableNumber(assetBalance.balance, assetBalance.assetID);
        assetBalance.balance = `${readableValue} ${assetInfo.symbol} [${assetBalance.balance}]`;
        balanceInfos.push(assetBalance);
      }
      this.setState({
        balanceInfos,
        balanceInfosOnePage: balanceInfos.slice(0, this.state.onePageNum),
      });
    } catch (error) {
      Feedback.toast.error(error || error.message);
    }
  }

  onChange = (currentPage) => {
    const startNo = (currentPage - 1) * this.state.onePageNum;
    const balanceInfos = this.state.balanceInfos.slice(startNo, startNo + this.state.onePageNum);
    this.setState({
      balanceInfosOnePage: balanceInfos,
    });
  }
  convertNumber = (number, decimals) => {
    let amount = new BigNumber(number);
    amount = amount.shiftedBy(parseInt(decimals * -1, 10)).toNumber();
    return amount;
  }
  convertAssetNumber = (assetInfo) => {
    assetInfo.amount = this.convertNumber(assetInfo.amount, assetInfo.decimals);
    assetInfo.addIssue = this.convertNumber(assetInfo.addIssue, assetInfo.decimals);
    assetInfo.upperLimit = this.convertNumber(assetInfo.upperLimit, assetInfo.decimals);
    return assetInfo;
  }

  onAssetSearch = async (value) => {
    try {
      const assetKey = value;
      if (utils.isEmptyObj(assetKey)) {
        return;
      }
      if (this.state.assetInfos[assetKey] != null) {
        this.setState({ assetInfo: [this.state.assetInfos[assetKey]] });
      } else {
        let assetInfo;
        if (assetKey[0] < '0' || assetKey[0] > '9') {
          assetInfo = await oexchain.account.getAssetInfoByName(assetKey);
        } else {
          assetInfo = await oexchain.account.getAssetInfoById(parseInt(assetKey, 10));
        }
  
        if (assetInfo == null) {
          Feedback.toast.error(T('无此资产信息'));
          return;
        }
  
        assetInfo = this.convertAssetNumber(assetInfo);
        this.setState({ assetInfo: [assetInfo] });
      }
    } catch (error) {
      Feedback.toast.error(error);
    }
  }

  onSearch = () => {
    if (this.state.searchedInfo == null || this.state.searchedInfo.length == 0) {
      Feedback.toast.error(T('请输入查询信息'));
      return;
    }
    if (this.state.isSearchAccount) {
      this.onUserAccountSearch(this.state.searchedInfo);
    } else {
      this.onAssetSearch(this.state.searchedInfo);
    }
  }

  onSearchValueChange(v) {
    this.state.searchedInfo = v;
  }

  onChangeType = (type) => {
    if (type == 'userAssetInfo') {
      this.setState({curPlaceholder: T('账户名'), isSearchAccount: true});
    } else {
      this.setState({curPlaceholder: T('资产ID/资产名称'), isSearchAccount: false});
    }
  }


  render() {
    return (
      <div>
        <IceContainer style={styles.banner}>
          <Row justify='space-around' style={{width: '80%', height: '50px', backgroundColor: '#5c67f2', alignItems: 'center'}}>
            <Select language={T('zh-cn')}
              style={{ width: '20%', height: '80%', padding: '7px 50px', borderRadius: '10px',  marginLeft: '-1%' }}
              placeholder={T("请选择查询类别")}
              onChange={this.onChangeType.bind(this)}
              dataSource={this.state.searchTypes}
              defaultValue='userAssetInfo'
            />
            <Input style={{borderRadius: '10px', marginLeft: '-3%', padding: '7px 5px', width: '75%', height: '80%'}} 
                   placeholder={T(this.state.curPlaceholder)} onChange={this.onSearchValueChange.bind(this)} onPressEnter={this.onSearch.bind(this)}/>
            <Button text style={{marginLeft: '-8%', marginTop: '5px'}} onClick={this.onSearch.bind(this)}><img style={{width: '50%', height: '70%'}} src={searchImg}/></Button>                   
          </Row>  
        {
          this.state.isSearchAccount ?
          <IceContainer style={styles.table}>
            <Table language={T('zh-cn')}
              dataSource={this.state.balanceInfosOnePage}
              hasBorder={false}
              style={{ padding: '0 20px 20px' }}
            >
              <Table.Column title={T("资产ID")} dataIndex="assetID" width={50} />
              <Table.Column title={T("金额")} dataIndex="balance" width={200} />
            </Table>
            <Pagination
              style={styles.pagination}
              onChange={this.handlePaginationChange}
              total={this.state.balanceInfos.length}
            />
          </IceContainer>
            :
          <IceContainer style={styles.table}>
            <Table language={T('zh-cn')}
              dataSource={this.state.assetInfo}
              hasBorder={false}
              style={{ padding: '0 20px 20px' }}
            >
              <Table.Column title={T("资产ID")} dataIndex="assetId" width={50} />
              <Table.Column title={T("名称")} dataIndex="assetName" width={50} />
              <Table.Column title={T("符号")} dataIndex="symbol" width={50} />
              <Table.Column title={T("创建区块高度")} dataIndex="number" width={50} />
              <Table.Column title={T("已发行量")} dataIndex="amount" width={50} />
              <Table.Column title={T("精度")} dataIndex="decimals" width={50} />
              <Table.Column title={T("创建人")} dataIndex="founder" width={50} />
              <Table.Column title={T("管理者")} dataIndex="owner" width={50} />
              <Table.Column title={T("增发量")} dataIndex="addIssue" width={50} />
              <Table.Column title={T("资产上限")} dataIndex="upperLimit" width={50} />
              <Table.Column title={T("合约账号")} dataIndex="contract" width={50} />
              <Table.Column title={T("描述")} dataIndex="description" width={50} />
            </Table>
          </IceContainer>
        }
        </IceContainer>
      </div>
    );
  }
}

const styles = {
  container: {
    margin: '20px',
    padding: '0 0 20px',
  },
  banner: {
    width: '100%', 
    height: '500px', 
    backgroundColor: 'rgb(245,246,250)',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center'
  },
  table: {
    width: '80%', 
  },
  link: {
    margin: '0 5px',
    color: 'rgba(49, 128, 253, 0.65)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  separator: {
    margin: '0 8px',
    display: 'inline-block',
    height: '12px',
    width: '1px',
    verticalAlign: 'middle',
    background: '#e8e8e8',
  },
  pagination: {
    textAlign: 'right',
    marginRight: '20px',
  },
};
