import React, { useState } from 'react';
import { Card, Progress, Tooltip, Badge } from 'antd';
import { AimOutlined, MessageOutlined } from '@ant-design/icons';
import moment from 'moment';

import CommentDrawer from './components/CommentDrawer';

import styles from './index.less';

const AimList = (props) => {
  const { activeFile, addBranchTimes } = props || {};
  const data =
    typeof activeFile?.body === 'string' && activeFile?.body.length > 0
      ? JSON.parse(activeFile.body)
      : { branchs: [] };

  const { title, desc, branchs = [], times = 0, currentTimes = 0 } = data;
  // console.log('aimlist', data, branchs);
  const [activeCommentItem, setActiveCommentItem] = useState(null);

  const handleTimesChagne = (index) => {
    const newBranchs = [...branchs];
    let dataCurrentTimes = data?.currentTimes;

    if (index >= 0) {
      if ((newBranchs[index]?.currentTimes || 0) < newBranchs[index]?.times) {
        // 增加计数
        newBranchs[index].currentTimes += 1;
        dataCurrentTimes = (data.currentTimes || 0) + 1;

        // 添加默认评论
        if (!newBranchs[index].comments) {
          newBranchs[index].comments = [];
        }
        newBranchs[index].comments.push({
          content: '今天又是满足的一天',
          createTime: moment().valueOf(),
        });
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

  const handleComment = (index, comment) => {
    const newBranchs = [...branchs];
    newBranchs[index].comments = newBranchs[index].comments || [];
    newBranchs[index].comments.push(comment);

    addBranchTimes(activeFile.id, {
      ...data,
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
                  <AimOutlined key="times" style={{ marginRight: 4 }} />
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
        // 过滤出非默认评论的数量
        const commentCount = (branch.comments || []).filter(
          (comment) => comment.content !== '今天又是满足的一天'
        ).length;

        return (
          <Card
            style={{ marginTop: 12 }}
            key={branch.id}
            actions={[
              <span onClick={() => handleTimesChagne(index)}>
                <AimOutlined key="times" style={{ marginRight: 4, color: '#8c8c8c' }} />
                {branch.currentTimes}
              </span>,
              <Badge count={commentCount} size="small">
                <MessageOutlined
                  key="comment"
                  onClick={() => setActiveCommentItem(index)}
                  style={{ color: '#8c8c8c' }}
                />
              </Badge>,
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
                {branch.desc && <div className={styles.desc}>{branch.desc}</div>}
              </div>
            </div>
          </Card>
        );
      })}

      <CommentDrawer
        open={activeCommentItem !== null}
        onClose={() => setActiveCommentItem(null)}
        comments={
          activeCommentItem !== null
            ? branchs[activeCommentItem]?.comments
            : []
        }
        onSubmit={(comment) => {
          handleComment(activeCommentItem, comment);
        }}
      />
    </div>
  );
};

export default AimList;
