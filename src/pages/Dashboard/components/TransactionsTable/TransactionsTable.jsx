/* eslint no-mixed-operators:0 */
import React, { Component } from 'react';

import TransactionList from '../../../../TransactionList';
import eventProxy from '../../../../utils/eventProxy';

export default class TransactionsTable extends Component {
  static displayName = 'TransactionsTable';

  constructor(props) {
    super(props);

    this.state = {
      blockHashSet: {},
      txHashSet: {},
      maxTxNum: 13,
      txHashArr: [],
      current: 1,
      assetInfos: {},
      txFrom: { txHashArr: [], maxTxNum: 0, fromHomePage: true },
      intervalId: 0,
      transactions: [],
    };
  }

  componentDidMount() {
    eventProxy.on('updateBlocks', (blocks) => {
      console.log('before', this.state.txHashArr);
      for (let i = 0; i < blocks.length; i++) {
        if (this.state.blockHashSet[blocks[i].number] == null) {
          this.state.txHashArr.push(...blocks[i].transactions);
          this.state.blockHashSet[blocks[i].number] = 1;
          if (this.state.txHashArr.length > this.state.maxTxNum) {
            this.state.txHashArr = this.state.txHashArr.slice(0, this.state.maxTxNum);
            break;
          }
        }
      }
      console.log('after', this.state.txHashArr);
      this.setState({txFrom: { txHashArr: this.state.txHashArr, maxTxNum: this.state.maxTxNum, fromHomePage: true }});
    });
  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  render() {
    return (
      <div className="progress-table">
        <TransactionList txFrom={this.state.txFrom}/>
      </div>
    );
  }
}