import React, { Component } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, Area, Scatter, XAxis,
  YAxis, ReferenceLine, ReferenceDot, Tooltip, Legend, CartesianGrid, Brush,
  LineChart } from 'recharts';
import { T } from '../../../../utils/lang';

// eslint-disable-next-line react/prefer-stateless-function
export default class Demo extends Component {

  static displayName = 'ComposedChartDemo';
  
  constructor(props) {
    super(props);
    this.state = {
      userData: []
    };
  }

  componentDidMount() {
    const _this = this;
    fetch("https://api.oexchain.com/api/getUserCountEachDay.oex").then(response => {
      return response.json();
    }).then(userData => {
      const userDataList = [];
      var lastUser = null;
      userData.data.map(user => {
        const date = Object.keys(user)[0];
        const number = user[date];
        const addedNumber = 0;
        var newUserData = {};
        newUserData[T('日期')] = date;
        newUserData[T('总注册用户量')] = number;
        newUserData[T('日增用户量')] = addedNumber;
        if (lastUser != null) {
          newUserData[T('日增用户量')] = newUserData[T('总注册用户量')] - lastUser[T('总注册用户量')];
        }
        lastUser = newUserData;
        userDataList.push(newUserData);
      });
      console.log(userDataList);
     _this.setState({userData: userDataList});
    })
  }

  render () {
    return (
          <ComposedChart width={1200} height={400} data={this.state.userData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey={T("日期")}/>
            <YAxis />
            <Legend />
            <CartesianGrid stroke="#f5f5f5" />
            <Tooltip />
            <Bar dataKey={T("日增用户量")} barSize={20} fill="rgba(35, 201, 167, 1)" />
            <Line dataKey={T("总注册用户量")} type="monotone" strokeWidth={2} stroke="#c02230" />
          </ComposedChart>
    );
  }
}
