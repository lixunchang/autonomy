
export const EFileType = {
  file: 0,
  folder: 1,
};

export const ENoteType = {
  start: 0, // 开始编辑title
  delete: 1, // 删除
  rename: 2, // 结束编辑title
  top: 3, // 置顶
};

export const ENoteSort = {
  top: 1,
  normal: 2,
};

export const newNote = (momentFn, id) => {
  const curTime = momentFn.valueOf();
  return {
    id,
    title: momentFn.format('YYYYMMDD') + '日志',
    createTime: curTime,
    modifyTime: curTime,
    sort: ENoteSort.normal,
    type: EFileType.file,
    desc: '',
    content: '',
  };
};

export const initNote = (newNote, newId) => {
  return {
    folderId: '',
    currentId: newId,
    editId: '',
    data: [newNote],
  };
};
