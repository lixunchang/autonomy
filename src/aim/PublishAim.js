import React from 'react';
import { Input, Button } from 'antd';
import { PictureOutlined, BorderlessTableOutlined } from '@ant-design/icons';
import styles from './index.less';

const PublishAim = () => {
  return (
    <div className={styles.PublishAim}>
      <Input.TextArea rows={4} />
      <div className={styles.quickButton}>
        <span className={styles.leftQuick}>
          <Button
            style={{ color: '#76ca87' }}
            type="text"
            icon={<PictureOutlined />}
          >
            图片
          </Button>
          <Button type="text" icon={<BorderlessTableOutlined />}>
            链接
          </Button>
        </span>
        <Button type="primary">发布</Button>
      </div>
      PublishAim
    </div>
  );
};

export default PublishAim;
