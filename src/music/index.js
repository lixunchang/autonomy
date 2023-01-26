import React from 'react';
import { Tabs, Input } from 'antd';
import styles from './index.less';

const { TabPane } = Tabs;
var location = ''; // new Object();
// window.parent.location.href="http://www.baidu.com"

const Music = () => {
  const onSearch = (value) => {
    // console.log('value:', value);
  };
  return (
    <div className={styles.Music}>
      <Input.Search
        placeholder="搜索歌名"
        onSearch={onSearch}
        style={{ display: 'block', width: 360, margin: '0 auto 16px' }}
      />
      <Tabs type="card">
        <TabPane tab="QQ音乐" key="1">
          <iframe
            scrolling="false"
            frameBorder={0}
            width="100%"
            height="100%"
            className={styles.iframe}
            title="QQ音乐"
            src={'https://y.qq.com/?ADTAG=myqq#type=index'}
          />
        </TabPane>
        <TabPane tab="网易云音乐" key="2">
          <iframe
            scrolling="false"
            frameBorder={0}
            width="100%"
            // sandbox=""
            sandbox="allow-same-origin"
            className={styles.iframe}
            title="网易云音乐"
            src={'https://music.163.com/'}
          />
        </TabPane>
        <TabPane tab="酷狗音乐" key="3">
          <iframe
            scrolling="false"
            frameBorder={0}
            width="100%"
            className={styles.iframe}
            title="酷狗音乐"
            src={'https://www.kugou.com/'}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Music;
