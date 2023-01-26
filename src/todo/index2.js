import React, { useState } from 'react';
// import { useIdb } from 'react-use-idb';
import moment from 'moment';
import styles from './index.less';
import shortid from 'shortid';
import { ITodo, newTodo, ESort, initTodo } from './initial';
import { message } from 'antd';
import TodoList from './TodoList';

const defaultTodo = {
  // sort: ESort.normal,
  columns: [
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
  ],
};

const Todo = (props) => {
  // console.log('todo===', props);
  const { activeFile, onChange } = props;
  // const newId = shortid.generate();
  // const initTodos = initTodo(newTodo(moment(), newId), newId);
  // const [allTodos, setAllTodos] = useState(initTodos);
  // const { currentId = '', editId, data = [] } = allTodos || {};
  // const [currentTodo] = data.filter((item) => item.id === currentId);

  // const changeCurrentTodo = (todo) => {
  //   const newDatas = data.filter((item) => item.id !== currentId);
  //   newDatas.push({ ...todo, modifyTime: moment().valueOf() });
  //   setAllTodos({ ...allTodos, data: newDatas });
  // };

  return (
    <div className={styles.Todo}>
      <div className={styles.content}>
        <TodoList
          todoData={{
            ...defaultTodo,
            ...activeFile,
          }}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Todo;
