import React from 'react';
import IceContainer from '@icedesign/container';
import { Icon, Button } from '@alifd/next';
import styles from './index.module.scss';

const generatorData = () => {
    return [
            {
              title: '如何搭建oexchain私有网络',
              href: 'https://github.com/oexplatform/oexchain/wiki/%E5%A6%82%E4%BD%95%E6%90%AD%E5%BB%BAoexchain%E7%A7%81%E6%9C%89%E7%BD%91%E7%BB%9C',
              author: 'oexchain team',
              date: '2019-9-2 14:30',
            },{
              title: '创世文件genesis.json说明',
              href: 'https://github.com/oexplatform/oexchain/wiki/%E5%88%9B%E4%B8%96%E6%96%87%E4%BB%B6genesis.json%E8%AF%B4%E6%98%8E',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: 'Solidity API--了解FT公链对Solidity0.4.24版本所作的变动',
              href: 'https://github.com/oexplatform/oexchain/wiki/solidity-API',
              author: 'oexchain team',
              date: '2019-11-14 16:24',
            },{
              title: 'Solidity 0.4.24--FT公链虚拟机基于此版本进行改造',
              href: 'https://solidity.readthedocs.io/en/v0.4.24/',
              author: 'oexchain team',
              date: '2019-11-14 16:24',
            },{
              title: 'DPoS投票及节点投入产出分析',
              href: 'https://github.com/oexplatform/oexchain/wiki/dpos%E6%8A%95%E7%A5%A8%E5%8F%8A%E8%8A%82%E7%82%B9%E6%8A%95%E5%85%A5%E4%BA%A7%E5%87%BA%E5%88%86%E6%9E%90',
              author: 'oexchain team',
              date: '2019-10-6 20:33',
            },{
              title: 'JSON RPC文档--同FT公链进行交互的接口',
              href: 'https://github.com/oexplatform/oexchain/wiki/JSON-RPC',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: '交易payload构造详情--了解FT公链如何构造不同交易',
              href: 'https://github.com/oexplatform/oexchain/wiki/%E4%BA%A4%E6%98%93payload%E6%9E%84%E9%80%A0',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: 'FT公链共识介绍',
              href: 'https://github.com/oexplatform/oexchain/wiki/oexchain%E5%85%B1%E8%AF%86%E4%BB%8B%E7%BB%8D',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: '网络节点发现协议',
              href: 'https://github.com/oexplatform/oexchain/wiki/%E8%8A%82%E7%82%B9%E5%8F%91%E7%8E%B0%E5%8D%8F%E8%AE%AE',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: '如何将节点接入FT公链主网',
              href: 'https://github.com/oexplatform/oexchain/wiki/Main-Network',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },{
              title: '如何将节点接入FT公链测试网',
              href: 'https://github.com/oexplatform/oexchain/wiki/Test-Network',
              author: 'oexchain team',
              date: '2019-9-2 16:30',
            },
          ]
};

export default function Index() {
  const dataSource = generatorData();

  return (
    <div className="article-list">
      {/* <IceContainer className={styles.articleFilterCard}>
        <ul className={`${"article-sort"} ${styles.articleSort}`}>
          <li className={styles.sortItem}>
            最新 <Icon type="arrow-down" size="xs" />
          </li>
          <li className={styles.sortItem}>
            最热 <Icon type="arrow-down" size="xs" />
          </li>
        </ul>
      </IceContainer> */}
      <IceContainer>
        {dataSource.map((item, index) => {
          return (
            <div key={index} className={styles.articleItem}>
              <div>
                <a className={styles.title} href={item.href} target='_blank'>
                  {item.title}
                </a>
              </div>
              <div className={styles.articleItemFooter}>                
                <div className={styles.articleItemMeta}>
                  {/* <span className={styles.itemMetaIcon}>
                    <Icon type="good" size="small" /> {item.like}
                  </span> */}
                  <span className={styles.itemMetaIcon}>
                    <Icon type="account" size="small" /> {item.author}
                  </span>
                  <span className={styles.itemMetaIcon}>
                    <Icon type="clock" size="small" /> {item.date}
                  </span>
                </div>             
              </div>
            </div>
          );
        })}
      </IceContainer>
    </div>
  );
}