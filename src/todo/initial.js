import shortid from 'shortid';
import moment from 'moment';

export const ERepeat = {
  once: 0,
  everyday: 1,
  weekly: 2,
};

export const ERate = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

export const EStatus = {
  todo: 0,
  doing: 1,
  done: 2,
};

export const ESort = {
  top: 1,
  normal: 2,
};

export const newTodo = (momentFn, id) => {
  // console.log('momentFn', momentFn, id);
  const curTime = momentFn.valueOf();
  return {
    id,
    title: momentFn.format('YYYYMMDD'),
    createTime: curTime,
    modifyTime: curTime,
    sort: ESort.normal,
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
};

export const initTodo = (newTodo, newId) => {
  return {
    currentId: newId,
    editId: '',
    data: [newTodo],
  };
};
