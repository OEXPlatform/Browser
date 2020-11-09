import React, { Component } from 'react';
import { Chart, Interval, Line, Point, Tooltip } from 'bizcharts';
import {withTranslation} from 'react-i18next';
import {compose} from 'redux';
import {withRouter, Link} from 'react-router-dom';

class ChartBar extends Component {
  static displayName = 'ChartBar';

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
        var newUserData = {'date': date, 'number': number, 'addedNumber': 0, 'city': '注册数'}
        if (lastUser != null) {
          newUserData.addedNumber = newUserData.number - lastUser.number;
        }
        lastUser = newUserData;
        userDataList.push(newUserData);
      });
     // _this.setState({userData: userDataList});
    })
  }

  render() {
    const colors = ["#6394f9", "#62daaa"];
    return (
        <Chart height={400} data={this.state.userData} autoFit>
          <Line shape="smooth" position="date*number" color="city" label="number"/>
          <Point position="date*number" color="city" /> 
          <Tooltip shared showCrosshairs/>
          
          {/* <Interval position="date*number" color='city' /> */}
          {/* <Line
            position="date*number"
            color={colors[1]}
            size={3}
            shape="smooth"
          /> */}
        </Chart>
    );
  }
}

const styles = {
  title: {
    margin: '0 0 40px',
    fontSize: '18px',
    paddingBottom: '15px',
    fontWeight: 'bold',
    borderBottom: '1px solid #eee',
  },
};

export default  compose(
  withRouter,
  withTranslation()
)(ChartBar);