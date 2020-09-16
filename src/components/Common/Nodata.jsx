import React from 'react';
import { T, setLang } from '../../utils/lang';
import nodata from './images/nodata.png';
import nodataBlack from './images/nodata-black.png';


const Nodata = ({theme='light'}) => {
  return (
    <div style={{display: 'flex',flexDirection: 'column', justifyContent:'center', alignItems:'center', minHeight: '200px'}}>
      <img src={theme=== 'dark' ? nodataBlack : nodata} width='42'/>
      <p style={{fontSize: '12px', color: '#5E768B', marginTop: 10}}>{T('暂无数据')}</p>
    </div>
  )
}

export default Nodata