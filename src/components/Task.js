import React from 'react';
import styles from './Task.less';
import { Draggable } from 'react-beautiful-dnd';
import { Rate } from 'antd';
import SmallRate from './SmallRate';

const Task = ({ task, index }) => {
  return (
    <Draggable
      key = {task.id}
      draggableId={task.id}
      index={index}
      // isDragDisabled={isDragDisabled}
    >
      {(provided) => {
        //snapshot.isDragging
        return (
          <div
            key={task.id}
            className={styles.Task}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // 注意不要覆盖 draggableProps.style
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SmallRate count={4} value={task.rate || 0} />
              <div className={styles.content}>{task.content}</div>
            </div>
            <div className={styles.tips}>{task.desc}</div>
          </div>
        );
      }}
    </Draggable>
  );
};
export default Task;
