import React, { useState } from 'react';
import { Tabs, Input } from 'antd';
import styles from './index.less';

const { TabPane } = Tabs;
var location = ''; // new Object();
// window.parent.location.href="http://www.baidu.com"

const Music = () => {
  const {musicList} = useState({
    musicList:[1,2,3]
  })
  const onSearch = (value) => {
    // console.log('value:', value);
  };

  const handleItemClick=()=>{
    
  }
  return (
    <div className={styles.Music}>
      <Input.Search
        placeholder="搜索歌名"
        onSearch={onSearch}
        style={{ display: 'block', width: 360, margin: '0 auto 16px' }}
      />
      {
        musicList.map(item=>{
          return <p onClick={handleItemClick}>
            {item}
          </p>
        })
      }
    </div>
  );
};

export default Music;
