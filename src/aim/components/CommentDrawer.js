import React, { useState, useMemo } from 'react';
import { Drawer, Input, Button, List, Table } from 'antd';
import moment from 'moment';
import styles from './CommentDrawer.less';

const CommentDrawer = ({ open, onClose, comments = [], onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      content,
      createTime: moment().valueOf()
    });
    setContent('');
  };

  // 统计每月评论数
  const monthlyStats = useMemo(() => {
    const stats = {};
    comments.forEach(item => {
      const month = moment(item.createTime).format('YYYY-MM');
      stats[month] = (stats[month] || 0) + 1;
    });
    
    return Object.entries(stats).map(([month, count]) => ({
      month,
      count
    })).sort((a, b) => b.month.localeCompare(a.month));
  }, [comments]);

  const columns = [
    {
      title: '月份',
      dataIndex: 'month',
      width: '50%'
    },
    {
      title: '评论数',
      dataIndex: 'count',
      width: '50%'
    }
  ];

  return (
    <Drawer
      title="评论"
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
    >
      <div className={styles.statsTable}>
        <Table
          columns={columns}
          dataSource={monthlyStats}
          pagination={false}
          size="small"
        />
      </div>
      <div className={styles.commentList}>
        <List
          itemLayout="vertical"
          dataSource={comments}
          renderItem={item => (
            <List.Item key={item.createTime}>
              <div className={styles.commentTime}>
                {moment(item.createTime).format('YYYY-MM-DD HH:mm')}
              </div>
              <div className={styles.commentContent}>
                {item.content}
              </div>
            </List.Item>
          )}
        />
      </div>
      <div className={styles.commentInput}>
        <Input.TextArea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="添加评论..."
          rows={3}
          className={styles.textarea}
        />
        <Button size="small" type="primary" onClick={handleSubmit}>
          评论
        </Button>
      </div>
    </Drawer>
  );
};

export default CommentDrawer;
