import React, { useState, useEffect } from 'react';
import Img from '@icedesign/img';
import { Grid } from '@alifd/next';
import { Link } from 'react-router-dom';
import { enquireScreen } from 'enquire-js';
import styles from './index.module.scss';

const { Row, Col } = Grid;

const dataSource = [
  {
    title: 'FTUniSwap',
    subject:
      'FTUniSwap是FT公链上的DEX实现，基于“恒定乘积自动做市“模型，与传统的中心化和DEX具有很大的差别。主要特点：无订单簿，无做市商；任何人可以提供流动性，并获取奖励',
    headPic: require('./images/uniswaplogo.jpg'),
    pic: require('./images/uniswap.jpg'),
    platform: 'mainnet',
    to: '/uniswap',
  },
  {
    title: 'AI足球大师',
    subject:
      'AI足球大师是一款将AI足球机器人同区块链相结合的应用。',
    headPic: require('./images/AISoccerManagerLogo.jpg'),
    pic: require('./images/AISoccerManager.jpg'),
    platform: 'mainnet',
    to: '/AISoccerMaster',
  },
  {
    title: 'AragonOnFT',
    subject: 'AragonOnFT致力于打造一个无专业门槛的 DAO 定制化平台，便于企业利用区块链治理技术降低运营开支和操作成本。',
    headPic: require('./images/aragonLogo.jpg'),
    pic: require('./images/aragon.jpg'),
    platform: 'mainnet',
    to: '/aragon',
  },
  {
    title: '去中心化投融资',
    subject:
      '通过在FT公链上实现投资人与项目方的有效协作，主要特点：融资后的资金自动锁定在合约内;项目方不能直接动用融资款;投资者持有项目Token，通过投票管理项目资产',
    headPic: require('./images/fundLogo.jpg'),
    pic: require('./images/fund.jpg'),
    platform: 'bothnet',
    to: '/uniswap',
  },
];

export default function BrandDisplay() {
  const [isMobile, setMobile] = useState(false);

  const enquireScreenRegister = () => {
    const mediaCondition = 'only screen and (max-width: 720px)';

    enquireScreen((mobile) => {
      setMobile(mobile);
    }, mediaCondition);
  };

  useEffect(() => {
    enquireScreenRegister();
  }, []);

  const logoWidth = isMobile ? 150 : 195;
  const logoHeight = isMobile ? 150 : 175;

  return (
    <div className={styles.container}>
      <div className={styles.brandHeader}>
        <h5 className={styles.brandTitle}>去中心化应用展示</h5>
      </div>
      <Row gutter="20" wrap>
        {dataSource.map((item, index) => {
          return (
            <Col xxs="24" s="12" l="12" key={index} className={styles.brandItem}>
            <Link to={item.to} className={styles.brandItemContent}>
              <div>
                  <Img
                    width={logoWidth}
                    height={logoHeight}
                    src={item.pic}
                    type="cover"
                    alt="图片"
                  />
                </div>
                <div className={styles.caseContent}>
                  <div className={styles.caseSubject}>
                    <img
                      src={item.headPic}
                      className={styles.subjectImage}
                      alt="图片"
                    />
                    <span className={styles.subjectDesc}>{item.title}</span>
                  </div>
                  <p className={styles.caseDetail}>{item.subject}</p>
                </div>  
            </Link>

              {/* <a href={item.url} className={styles.brandItemContent}>
                <div>
                  <Img
                    width={logoWidth}
                    height={logoHeight}
                    src={item.pic}
                    type="cover"
                    alt="图片"
                  />
                </div>
                <div className={styles.caseContent}>
                  <div className={styles.caseSubject}>
                    <img
                      src={item.headPic}
                      className={styles.subjectImage}
                      alt="图片"
                    />
                    <span className={styles.subjectDesc}>{item.title}</span>
                  </div>
                  <p className={styles.caseDetail}>{item.subject}</p>
                </div>
              </a> */}
            </Col>
          );
        })}
      </Row>
    </div>
  );
}