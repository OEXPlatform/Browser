/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';

import { Button } from '@alifd/next';
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import { T } from '../../../../utils/lang'
import * as CompilerSrv from '../../CompilerSrv';

export default class ContractEditor extends Component {
  constructor(props) {
    super(props);
    //const oexchainsol = require('solc');
    //solc = solc.setupMethods(require("../../../../utils/soljson.js"));
    const solCode = global.localStorage.getItem('sol:' + props.fileName);
    this.state = {
      code: solCode,
      editor: null,
      fileName: props.fileName,
      accountName: props.accountName,
    };
  }
  componentDidMount() {
    this.state.editor = monaco.editor.create(this.refs.editorContainer, {
      value: this.state.code,
      language: 'sol',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      theme: 'vs-dark',
    });
    this.state.editor.onDidBlurEditorWidget(() => {
      const latestCode = this.state.editor.getValue();
      global.localStorage.setItem('sol:' + this.state.fileName, latestCode);
      CompilerSrv.updateSol(this.state.accountName, this.state.fileName, latestCode);
    });
  }
  componentWillUnmount() {
    this.state.editor.dispose();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({accountName: nextProps.accountName,fileName: nextProps.fileName});
  }
  compile = () => {
    
    var input = {
      language: 'Solidity',
      sources: {
        'test.sol': {
          content: this.state.editor.getValue(),
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': [ '*' ]
          }
        }
      }
    }
    var output = JSON.parse(this.state.oexchainsol.compile(JSON.stringify(input)))
    for (var contractName in output.contracts['test.sol']) {
      console.log(contractName + ': ' + output.contracts['test.sol'][contractName].evm.bytecode.object)
    }
  }
  sendToChain = () => {

  }
  render() {
    return (
      <div>
        <div ref="editorContainer" style={{ height: 750 }} />
      </div>
    );
  }
}
