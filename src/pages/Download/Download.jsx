import React from 'react';
import './local.scss';
import dot from './images/dot.png';
import siteBg from './images/download-right-bg.png';
import siteBgEn from './images/download-right-bg-en.png';
import mainBg from './images/download.png';
import mainBgEn from './images/download-en.png';
import iphone from './images/iphone.png';
import android from './images/android.png';
import { T, isChinese } from '../../utils/lang';

const Download = () => {
  return (
    <div className='layout'>
      <div className='dotBg'><img src={dot} width='305'/></div>
      <div className='siteBg'><img src={isChinese() ? siteBg : siteBgEn}/></div>
      <div className='mainContent'>
        <img src={isChinese() ? mainBg : mainBgEn} />
        <div className='download'>
          <a className='downloadItem' href='#'>
            <img src={iphone} width='50'/>
            <span>{T("iPhone下载")}</span>
          </a>
          <a className='downloadItem' href='#'>
            <img src={android} width='50'/>
            <span>{T("Android下载")}</span>
          </a>
        </div>
      </div>
    </div>
  )
}


export default Download;