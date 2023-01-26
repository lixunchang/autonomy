import React, { useState } from 'react';
import moment from 'moment';
import styles from './index.less';
import { IColumn, ITask, EStatus, ERate, ERepeat } from './initial';
import shortid from 'shortid';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from '../components/Column';
import { Input, Rate, Dropdown, Button, Menu } from 'antd';
import { ITodo } from './initial';

const switchColumnTask = (todoData, source, destination) => {
  // console.log('******', source.index);
  const { columns } = todoData;
  let task;
  let targetColumnIndex;
  const newColumns = columns.map((column, index) => {
    if (column.id === source.droppableId) {
      task = column.tasks[source.index];
      column.tasks.splice(source.index, 1);
    }
    if (column.id === destination.droppableId) {
      targetColumnIndex = index;
    }
    return column;
  });
  if ((targetColumnIndex || targetColumnIndex === 0) && task) {
    newColumns[targetColumnIndex].tasks.splice(destination.index, 0, task);
  }
  // console.log('xxxnewColumns', newColumns);
  return { ...todoData, columns: newColumns };
};

const deleteColumnTask = (todoData, source) => ({
  ...todoData,
  columns: todoData?.columns?.map((column) => {
    if (column.id === source.droppableId) {
      column.tasks.splice(source.index, 1);
    }
    return {
      ...column,
    };
  }),
});

const sortTaskByRate = (columns) =>
  columns.map((column) => {
    column.tasks.sort((a, b) => b.rate - a.rate);
    return column;
  });

const defalutColumns = [
  {
    id: 'column-todo',
    name: '代办',
    tasks: [],
  },
  {
    id: 'column-inprogress',
    name: '进行中',
    tasks: [],
  },
  {
    id: 'column-done',
    name: '已完成',
    tasks: [],
  },
];

const TodoList = (props) => {
  const { activeFile, onChange } = props;
  const columns = (typeof activeFile?.body === 'string' &&
    activeFile?.body?.length > 0 &&
    JSON.parse(activeFile.body)) ||
    activeFile?.body || [...defalutColumns];
  const todoData = { ...activeFile, columns };
  const [taskRate, setTaskRate] = useState(ERate.zero);
  const [inputTask, setInputTask] = useState('');
  const [inputTaskDesc, setInputTaskDesc] = useState('');
  const [taskRepeat, setTaskRepeat] = useState(ERepeat.once);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      const { id, columns } = deleteColumnTask({ ...todoData }, source);
      onChange(id, columns);
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const { id, columns } = switchColumnTask(todoData, source, destination);
    onChange(id, columns);
  };
  const rate = (
    <Rate
      allowClear={false}
      value={taskRate}
      defaultValue={ERate.zero}
      count={4}
      tooltips={[
        '不紧急不重要',
        '不紧急很重要',
        '很紧急不重要',
        '很紧急很重要',
      ]}
      style={{ fontSize: 14, color: 'orangered' }}
      onChange={setTaskRate}
    />
  );
  const handleAddTask = () => {
    if (!inputTask) {
      return;
    }
    const newTodo = {
      id: shortid.generate(),
      status: EStatus.todo,
      content: inputTask,
      desc: inputTaskDesc,
      rate: taskRate,
      repeat: taskRepeat,
    };
    const [todo, ...rest] = columns;
    // onChange({
    //   ...todoData,
    //   columns: [{ ...todo, tasks: [newTodo, ...todo.tasks] }, ...rest],
    // });
    onChange(todoData.id, [
      { ...todo, tasks: [newTodo, ...todo.tasks] },
      ...rest,
    ]);
    setInputTask('');
    setInputTaskDesc('');
    setTaskRate(ERate.zero);
  };
  // console.log('todo==', todoData, columns);
  const sortedColumns = sortTaskByRate(columns);
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <div className={styles.title}>象限法则日程</div> */}
      <div className={styles.Todo}>
        <Input.Group compact style={{ width: '80%', margin: '10px auto 16px' }}>
          <Input
            size="middle"
            placeholder="添加代办事项标题"
            style={{
              width: '50%',
            }}
            value={inputTask}
            onPressEnter={handleAddTask}
            onChange={(e) => setInputTask(e.target.value)}
          />
          <Input.Search
            className={styles.inputSearch}
            enterButton={
              <Button
                type="primary"
                style={{ width: 80, background: '#6E6E6E' }}
              >
                添加
              </Button>
            }
            style={{
              width: '50%',
            }}
            size="middle"
            suffix={rate}
            value={inputTaskDesc}
            onChange={(e) => setInputTaskDesc(e.target.value)}
            onSearch={handleAddTask}
          />
        </Input.Group>
        <div className={styles.columns}>
          {sortedColumns.map((column) => {
            return <Column key={column.id} column={column} />;
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

export default TodoList;
