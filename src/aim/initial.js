import shortid from 'shortid';
import moment from 'moment';

export const newAim = (momentFn = moment(), id) => {
  const today = momentFn.format('YYYYMMDD');
  return {
    id,
    title: today,
    createTime: momentFn.valueOf(),
    modifyTime: momentFn.valueOf(),
    sort: 'normal',
    startDate: today,
    times: 0,
    currentTimes: 0,
    desc: '',
    branchs: [],
  };
};

export const initAim = (momentFn = moment()) => {
  const newId = shortid.generate();
  return {
    currentId: newId,
    title: '',
    editId: '',
    data: [newAim(momentFn, newId)],
  };
};

export const EAimSort = {
  top: 1,
  normal: 2,
};

export const EAimType = {
  start: 0, // 开始编辑title
  delete: 1, // 删除
  rename: 2, // 结束编辑title
  top: 3, // 置顶
};
