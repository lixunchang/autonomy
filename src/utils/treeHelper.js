import antdIcons from './antdIcons';

export const findItemById = (arr, id) => {
  for (let i in arr) {
    let item = arr[i];
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      let value = findItemById(item.children, id);
      if (value) return value;
    }
  }
};

/**
 * 只搜索类型为file的
 * @param {} arr
 * @param {*} ids
 * @param {*} result
 */
export const findItemsByIds = (arr, ids, result = []) => {
  result.push(
    ...arr.filter((item) => {
      if (item.children) {
        findItemsByIds(item.children, ids, result);
        return false;
      }
      return ids.find((id) => item.id === id);
    })
  );

  return result;
};

export const editItemById = (arr, id, data) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      arr[i] = { ...arr[i], ...data };
      break;
    } else if (arr[i].children) {
      editItemById(arr[i].children, id, data);
    }
  }
  return [...arr];
};
export const importChildren = (arr, id, data) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      arr[i].children = arr[i].children.concat(data);
      break;
    } else if (arr[i].children) {
      importChildren(arr[i].children, id, data);
    }
  }
  return [...arr];
};
//  递归多次 return;
export const deleteItemById = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children) {
      let len = arr[i].children.length;
      arr[i].children = arr[i].children.filter((item) => item.id !== id);
      if (arr[i].children.length < len) {
        break;
      }
      deleteItemById(arr[i].children, id);
    }
  }
  return [...arr];
};

export const createItemByFatherId = (arr, fatherId, data) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === fatherId) {
      arr[i].children.push(data);
      break;
    }
    if (arr[i].children) {
      createItemByFatherId(arr[i].children, fatherId, data);
    }
  }
  return [...arr];
};

export const switchFileIcons = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i].icon === 'string') {
      arr[i].icon = antdIcons[arr[i].icon];
    }
    if (arr[i].children) {
      switchFileIcons(arr[i].children);
    }
  }
  return [...arr];
};
export const deleteExtraAttr = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i].icon === 'string') {
      delete arr[i].isLoaded;
      delete arr[i].body;
    }
    if (arr[i].children) {
      deleteExtraAttr(arr[i].children);
    }
  }
  return [...arr];
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const defaultFiles = [
  {
    id: 'todo',
    title: '清单',
    key: 'todo',
    type: 'todo',
    icon: 'CheckCircleFilled',
    children: [
      {
        id: '05',
        title: '今天',
        key: '0-0-1',
        type: 'todo',
        icon: 'AimOutlined',
        isLeaf: true,
      },
      {
        id: '04',
        title: '未来七天',
        key: '0-0-2',
        type: 'todo',
        icon: 'CalendarOutlined',
        isLeaf: true,
      },
      {
        id: '03',
        title: '待整理',
        key: '0-0-3',
        type: 'todo',
        icon: 'CheckCircleOutlined',
        isLeaf: true,
      },
      {
        id: '01',
        title: '已完成',
        key: '0-0-4',
        type: 'todo',
        icon: 'CheckCircleOutlined',
        isLeaf: true,
      },
      {
        id: '02',
        title: '自定义',
        key: '0-0-5',
        type: 'todo',
        icon: 'FolderOutlined',
        isLeaf: false,
      },
    ],
  },
  {
    id: 'note',
    title: '笔记本',
    key: 'note',
    type: 'note',
    icon: 'WalletFilled',
    children: [
      // {
      //   id: '00011',
      //   title: '自媒体文集',
      //   key: '0-1-3',
      //   type: 'note',
      //   icon: 'FolderOutlined',
      //   children: [
      //     {
      //       id: '000111',
      //       title: '飞往北京不可得',
      //       type: 'note',
      //       body: '## 飞往北京不可得',
      //       createAt: 13344445,
      //       key: '0-1-3-0',
      //       icon: 'ProfileOutlined',
      //       isLeaf: true,
      //     },
      //     {
      //       id: '000113',
      //       title: '什么情况下你请我',
      //       key: '0-3-3-1',
      //       type: 'note',
      //       body: '## 什么情况下你请我',
      //       createAt: 13344445,
      //       icon: 'ProfileOutlined',
      //       isLeaf: true,
      //     },
      //   ],
      // },
      // {
      //   id: '00012',
      //   title: '古都的秋',
      //   key: '0-1-0',
      //   type: 'note',
      //   body: '## 古都的秋',
      //   createAt: 13344445,
      //   icon: 'ProfileOutlined',
      //   isLeaf: true,
      // },
      // {
      //   id: '00014',
      //   title: '桨声灯影里的秦淮河',
      //   key: '0-1-1',
      //   type: 'note',
      //   body: '## 桨声灯影里的秦淮河',
      //   createAt: 13344445,
      //   icon: 'ProfileOutlined',
      //   isLeaf: true,
      // },
    ],
  },
  {
    id: 'aim',
    title: '打卡记录',
    key: 'aim',
    type: 'aim',
    icon: 'CarryOutFilled',
    children: [
      // {
      //   id: '011',
      //   title: 'leaf 0-0',
      //   key: '011',
      //   type: 'aim',
      //   icon: 'FolderOutlined',
      //   isLeaf: false,
      // },
      // {
      //   id: '012',
      //   title: 'leaf 0-1',
      //   key: '012',
      //   type: 'aim',
      //   icon: 'ProfileOutlined',
      //   isLeaf: true,
      // },
    ],
  },
  {
    id: 'amount',
    title: '记账本',
    key: 'amount',
    type: 'amount',
    icon: 'DollarCircleFilled',
    children: [
      // {
      //   id: '01044',
      //   title: 'leaf 1-0',
      //   key: '0-4-0',
      //   type: 'amount',
      //   icon: 'AccountBookOutlined',
      //   isLeaf: true,
      // },
      // {
      //   id: '010445',
      //   title: 'leaf 1-1',
      //   key: '0-4-1',
      //   type: 'amount',
      //   icon: 'AccountBookOutlined',
      //   isLeaf: true,
      // },
    ],
  },
  // {
  //   id: 'import',
  //   title: '导入',
  //   key: 'import',
  //   type: 'import',
  //   icon: 'ThunderboltFilled',
  //   isLeaf: true,
  // },
  {
    id: 'crash',
    title: '回收站',
    key: 'crash',
    type: 'crash',
    icon: 'DeleteFilled',
    isLeaf: true,
  },
  // {
  //   id: 'setting',
  //   title: '设置',
  //   key: 'setting',
  //   type: 'setting',
  //   icon: 'SettingFilled',
  //   isLeaf: true,
  // },
];

export const getIconByFileType = (type, isLeaf) => {
  if (!isLeaf) {
    return 'FolderOutlined';
  }
  switch (type) {
    case 'todo':
      return 'CheckCircleOutlined';
    case 'note':
      return 'ProfileOutlined';
    case 'aim':
      return 'ProfileOutline';
    case 'amount':
      return 'AccountBookOutlined';
    default:
      break;
  }
  return 'ProfileOutline';
};
