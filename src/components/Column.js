import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styles from './Column.less';
import Task from './Task';

const Column = ({ column, actions, onEditTask, handleTaskChange, onCheckLittleTask }) => {
  return (
    <div className={styles.Column}>
      <div className={styles.title}>
        <span className={styles.title_word}>{column.name || column.title}</span>
        {actions}
      </div>
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
                return (
                  <Task
                    columnId={column.id}
                    key={task.id}
                    task={task}
                    index={index}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onEditTask(column, task);
                    }}
                    onTaskChange={(data={})=>{
                      handleTaskChange(column, {...task, ...data})
                    }}
                    onCheckLittleTask={(item, checked, index) =>
                      onCheckLittleTask(column, task, item, checked, index)
                    }
                  />
                );
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
