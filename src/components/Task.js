import React from 'react';
import styles from './Task.less';
import { Draggable } from 'react-beautiful-dnd';
import { Checkbox, Tag, Card } from 'antd';
import SmallRate from './SmallRate';

const Task = ({ columnId, task, index, onCheckLittleTask, ...restProps }) => {
  console.log('task.items==>', task);
  return (
    <Draggable
      key={task.id}
      draggableId={task.id}
      index={index}
      // isDragDisabled={isDragDisabled}
    >
      {(provided) => {
        //snapshot.isDragging
        return (
          <Card
            className={styles.taskCard}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            bodyStyle={{ padding: '12px 14px' }}
          >
            <div
              key={task.id}
              className={`context_menu_task ${styles.Task}`}
              // 注意不要覆盖 draggableProps.style
              data-task={JSON.stringify(task)}
              data-columnid={columnId}
              {...restProps}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* <div
                  className={`${styles.important_line}`}
                  style={{ width: `${task.rate * 25}%` }}
                />
                <span className={styles.divider} style={{ left: '25%' }} />
                <span className={styles.divider} style={{ left: '50%' }} />
                <span className={styles.divider} style={{ left: '75%' }} /> */}
                <SmallRate count={4} value={task.rate || 0} />
                <div className={styles.content}>{task.content}</div>
              </div>
              <div className={styles.tips}>{task.desc}</div>
              <div>
                {task?.items?.map((item, index) => {
                  return (
                    <div key={item.title} className={styles.smallTitle}>
                      <Checkbox
                        size="small"
                        style={{ marginRight: 6 }}
                        checked={item.checked}
                        onChange={({ target }) =>
                          onCheckLittleTask(item, target.checked, index)
                        }
                      ></Checkbox>
                      {item.title}
                    </div>
                  );
                })}
              </div>
              <div className={styles.tags}>
                {task?.tags?.map((tag) => {
                  return (
                    <Tag key={tag} size="small" onChange={() => {}}>
                      {tag}
                    </Tag>
                  );
                })}
              </div>
            </div>
          </Card>
        );
      }}
    </Draggable>
  );
};
export default Task;
