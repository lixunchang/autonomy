import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styles from './Column.less';
import Task from './Task';

const Column = ({ column }) => {
  return (
    <div className={styles.Column}>
      <div className={styles.title}>{column.name || column.title}</div>
      <Droppable
        // direction="horizontal"
        droppableId={column.id}
        type="TASK" // 同类拖放
        // mode='standard' | 'virtual'
      >
        {(provided, snapshot) => {
          //snapshot.isDraggingOver
          return (
            <div
              className={styles.taskList}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {column.tasks.map((task, index) => {
                return <Task key={task.id} task={task} index={index} />;
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

export default Column;
