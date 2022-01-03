import React from 'react';
import { Card, Progress } from 'antd';
import { LikeOutlined } from '@ant-design/icons';

import styles from './index.less';

const AimList = (props) => {
  const { activeFile, addBranchTimes } = props || {};
  const data =
    typeof activeFile?.body === 'string' && activeFile?.body.length > 0
      ? JSON.parse(activeFile.body)
      : { branchs: [] };

  const { title, desc, branchs = [], times = 0, currentTimes = 0 } = data;
  console.log('aimlist', data, branchs);

  const handleTimesChagne = (index) => {
    const newBranchs = [...branchs];
    let dataCurrentTimes = data?.currentTimes;
    if (index >= 0) {
      if ((newBranchs[index]?.currentTimes || 0) < newBranchs[index]?.times) {
        newBranchs[index].currentTimes += 1;
        dataCurrentTimes = (data.currentTimes || 0) + 1;
      }
    } else {
      if ((data?.currentTimes || 0) < data?.times) {
        dataCurrentTimes = (data.currentTimes || 0) + 1;
      }
    }
    addBranchTimes(activeFile.id, {
      ...data,
      currentTimes: dataCurrentTimes,
      branchs: newBranchs,
    });
  };

  return (
    <div className={styles.AimList}>
      <Card
        style={{ background: '#e6f7ff' }}
        actions={
          branchs.length < 1
            ? [
                <span onClick={() => handleTimesChagne(-1)}>
                  <LikeOutlined key="times" style={{ marginRight: 4 }} />
                  {currentTimes}
                </span>,
              ]
            : [
                <Progress
                  style={{ width: '90%', margin: '0 18px' }}
                  percent={Math.floor((currentTimes / times) * 100)}
                />,
              ]
        }
      >
        <div className={styles.item}>
          <Progress
            percent={Math.floor((currentTimes / times) * 100)}
            width={60}
            type="circle"
            format={() => '总'}
          />
          <div className={styles.titleDes}>
            <div className={styles.title}>{activeFile.title}</div>
            <div className={styles.desc}>{desc}</div>
          </div>
        </div>
      </Card>
      {branchs.map((branch, index) => {
        if (!branch) return null;
        return (
          <Card
            style={{ marginTop: 12 }}
            key={branch.id}
            actions={[
              <span onClick={() => handleTimesChagne(index)}>
                <LikeOutlined key="times" style={{ marginRight: 4 }} />
                {branch.currentTimes}
              </span>,
            ]}
          >
            <div className={styles.item}>
              <Progress
                percent={Math.floor((branch.currentTimes / branch.times) * 100)}
                width={60}
                type="circle"
              />
              <div className={styles.titleDes}>
                <div className={styles.branchTitle}>{branch.name}</div>
                <div className={styles.desc}>{branch.desc}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AimList;
