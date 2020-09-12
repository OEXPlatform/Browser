import React from 'react';
import './local.scss';
import dot from './images/dot.png';
import siteBg from './images/download-right-bg.png';
import mainBg from './images/download.png';
import iphone from './images/iphone.png';
import android from './images/android.png';

const Download = () => {
  return (
    <div className='layout'>
      <div className='dotBg'><img src={dot} width='305'/></div>
      <div className='siteBg'><img src={siteBg}/></div>
      <div className='mainContent'>
        <img src={mainBg} />
        <div className='download'>
          <a className='downloadItem' href='#'>
            <img src={iphone} width='50'/>
            <span>iPhone下载</span>
          </a>
          <a className='downloadItem' href='#'>
            <img src={android} width='50'/>
            <span>Android下载</span>
          </a>
        </div>
      </div>
    </div>
  )
}


export default Download;