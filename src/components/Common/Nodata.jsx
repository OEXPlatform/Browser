import React from 'react';
import nodata from './images/nodata.png';


const Nodata = () => {
  return (
    <div style={{display: 'flex',flexDirection: 'column', justifyContent:'center', alignItems:'center', minHeight: '200px'}}>
      <img src={nodata} width='42'/>
      <p style={{fontSize: '12px', color: '#9e9e9e', marginTop: 10}}>暂无数据</p>
    </div>
  )
}

export default Nodata