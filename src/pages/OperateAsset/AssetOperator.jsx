/* eslint-disable no-restricted-syntax */
import React, { Component } from 'react';
import { Select, Card } from '@icedesign/base';
import { Button, Grid, Dialog } from "@alifd/next";
import IceContainer from '@icedesign/container';
import * as oexchain from 'oex-web3';
import AssetIssueTable from './AssetIssueTable';
import AssetIncrease from './AssetIncrease';
import AssetFounderSet from './AssetFounderSet';
import AssetOwnerSet from './AssetOwnerSet';
import AssetDestroy from './AssetDestroy';
import AssetContractSet from './AssetContractSet';
import AssetSearch from '../SearchAsset';
import * as utils from '../../utils/utils';  
import { T } from '../../utils/lang';  
import * as AssetUtils from './AssetUtils';

const { Row, Col } = Grid;
const issueAssetImg = require('./images/property_icon_01.png');
const addAssetImg = require('./images/property_icon_02.png');
const setOwnerImg = require('./images/property_icon_03.png');
const setFounderImg = require('./images/property_icon_04.png');
const setProtocolAssetImg = require('./images/property_icon_05.png');
const destroyAssetImg = require('./images/property_icon_06.png');
export default class AssetOperator extends Component {
  static displayName = 'SearchTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      selectedAccountName: '',
      cardHeight: 180,
      dposInfo: {},
      assetInfoSet: [],
      issueAssetVisible: false,
      increaseAssetVisible: false,
      setOwnerVisible: false,
      setFounderVisible: false,
      setProtocolVisible: false,
      destroyAssetVisible: false,
    };
  }

  componentWillMount = async () => {
    const chainConfig = await oexchain.oex.getChainConfig();
    oexchain.oex.setChainId(chainConfig.chainId);
    const accounts = await utils.loadAccountsFromLS();
    for (let account of accounts) {
      this.state.accounts.push({value:account.accountName, label:account.accountName});
    }

    this.state.dposInfo = await oexchain.dpos.getDposInfo();
  }

  onChangeAccount = async (accountName) => {
    const assetInfoSet = await AssetUtils.getAssetInfoOfOwner(accountName);
    this.setState({ selectedAccountName: accountName, assetInfoSet });
  }

  issueAsset = () => {
    this.setState({ issueAssetVisible: true });
  }

  increaseAsset = () => {
    this.setState({ increaseAssetVisible: true });
  }

  setOwnerAsset = () => {
    this.setState({ setOwnerVisible: true });
  }

  setFounderAsset = () => {
    this.setState({ setFounderVisible: true });
  }

  setProtocolAsset = () => {
    this.setState({ setProtocolVisible: true });
  }

  destroyAsset = () => {
    this.setState({ destroyAssetVisible: true });
  }
  render() {
    return (
      <div sytle={styles.all}>
        <IceContainer style={styles.banner}/>
        <IceContainer style={{ display: 'flex', width: '78%', height: '317px', margin: '-290px 11% 0 11%' }}>
          <Col style={{ background: '#fff'}}>
            <Row align='center'>
              <h4 style={styles.title}>{T("资产操作")}</h4>
              <Select language={T('zh-cn')}
                style={{ width: 300 }}
                placeholder={T("选择发起资产操作的账户")}
                onChange={this.onChangeAccount.bind(this)}
                dataSource={this.state.accounts}
              />
            </Row>
            <Row align='center' justify='space-around' style={{marginTop: '30px'}}>
              <Col>
                <Button text onClick={this.issueAsset.bind(this)}><img src={issueAssetImg}/><div style={{marginLeft: '-100px', color: '#000000'}}>{T('发行资产')}</div></Button>
              </Col>
              <Col>
                <Button text onClick={this.increaseAsset.bind(this)}><img src={addAssetImg}/><div style={{marginLeft: '-100px', color: '#000000'}}>{T('增发资产')}</div></Button>
              </Col>
              <Col>
                <Button text onClick={this.setOwnerAsset.bind(this)}><img src={setOwnerImg}/><div style={{marginLeft: '-120px', color: '#000000'}}>{T('设置资产管理者')}</div></Button>
              </Col>
              <Col>
                <Button text onClick={this.setFounderAsset.bind(this)}><img src={setFounderImg}/><div style={{marginLeft: '-120px', color: '#000000'}}>{T('设置资产创办者')}</div></Button>
              </Col>
              <Col>
                <Button text onClick={this.setProtocolAsset.bind(this)}><img src={setProtocolAssetImg}/><div style={{marginLeft: '-110px', color: '#000000'}}>{T('设置协议资产')}</div></Button>
              </Col>
              <Col>
                <Button text onClick={this.destroyAsset.bind(this)}><img src={destroyAssetImg}/><div style={{marginLeft: '-100px', color: '#000000'}}>{T('销毁资产')}</div></Button>
              </Col>
            </Row>
          </Col>
        </IceContainer>
        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.issueAssetVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({issueAssetVisible: false})}
          onClose={() => this.setState({issueAssetVisible: false})}
          title={T('发行资产')}
          footer={<div />}
        >
          <AssetIssueTable accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>

        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.increaseAssetVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({increaseAssetVisible: false})}
          onClose={() => this.setState({increaseAssetVisible: false})}
          title={T('增发资产')}
          footer={<div />}
        >
          <AssetIncrease accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>

        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.setOwnerVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({setOwnerVisible: false})}
          onClose={() => this.setState({setOwnerVisible: false})}
          title={T('设置资产管理者')}
          footer={<div />}
        >
          <AssetOwnerSet accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>

        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.setFounderVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({setFounderVisible: false})}
          onClose={() => this.setState({setFounderVisible: false})}
          title={T('设置资产创办者')}
          footer={<div />}
        >
          <AssetFounderSet accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>

        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.setProtocolVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({setProtocolVisible: false})}
          onClose={() => this.setState({setProtocolVisible: false})}
          title={T('设置协议资产')}
          footer={<div />}
        >
          <AssetContractSet accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>

        <Dialog
          style={{ width: "30%", height:'100%' }}
          visible={this.state.destroyAssetVisible}
          closeable="esc,mask,close"
          isFullScreen={true}
          onCancel={() => this.setState({destroyAssetVisible: false})}
          onClose={() => this.setState({destroyAssetVisible: false})}
          title={T('销毁资产')}
          footer={<div />}
        >
          <AssetDestroy accountName={this.state.selectedAccountName} assetInfoSet={this.state.assetInfoSet}/>
        </Dialog>
        <AssetSearch style={{width: '78%'}}/>
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
    alignItems: 'center'
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
  container: {
    width: '78%', 
    margin: '20px 0 20px 0',
    padding: '0',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
  },
  subContainer: {
    display: 'flex',
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
    borderBottom: '1px solid #eee',
  },
  card: {
    width: 400,
    displayName: 'flex',
    marginBottom: '20px',
    marginLeft: '10px',
    marginRight: '10px',
    background: '#fff',
    borderRadius: '6px',
    padding: '10px 10px 20px 10px',
  },
  col: {
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center'
  },
};
