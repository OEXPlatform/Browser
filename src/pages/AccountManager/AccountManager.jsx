import React, { Component } from 'react';
import AccountList from './components/AccountList';
import KeystoreManager from '../KeystoreManager';
import './AccountManager.scss';

export default class AccountManager extends Component {
  static displayName = 'AccountManager';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="accountmanager-page">
        <AccountList />
        <KeystoreManager />
      </div>
    );
  }
}
