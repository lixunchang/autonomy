import React from 'react';
import styles from './Task.less';
import { Draggable } from 'react-beautiful-dnd';
import { Rate } from 'antd';

const Task = ({ task, index }) => {
  return (
    <Draggable
      draggableId={task.id}
      index={index}
      // isDragDisabled={isDragDisabled}
    >
      {(provided) => {
        //snapshot.isDragging
        return (
          <div
            className={styles.Task}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // 注意不要覆盖 draggableProps.style
          >
            <div className={styles.content}>{task.content}</div>
            {task.rate && (
              <Rate
                style={{ fontSize: 14 }}
                disabled
                count={4}
                value={task.rate}
              />
            )}
          </div>
        );
      }}
    </Draggable>
  );
};
export default Task;
