import React, { useState } from 'react';
// import { useIdb } from 'react-use-idb';
import moment from 'moment';
import styles from './index.less';
import AimList from './AimList';
import { EAimType, EAimSort, initAim } from './initial';
import { message } from 'antd';
import EditAim from './EditAim';
import EmptyStatus from '../../public/empty.png';

const Aim = (props) => {
  const initAims = initAim(moment());
  const [allAims, setAllAims] = useState(initAims);
  const { currentId = allAims.data[0].id, editId, data = [] } = allAims;
  const [currentAim] = data.filter((item) => item.id === currentId);
  console.log('currentAim', initAims, currentAim);
  const changeCurrentAim = (aim) => {
    const newDatas = data.filter((item) => item.id !== currentId);
    newDatas.push({ ...aim, modifyTime: moment().valueOf() });
    setAllAims({ ...allAims, editId: '', data: newDatas });
  };

  const addBranchTimes = (index) => {
    const { data } = allAims;
    const newData = data.map((item) => {
      if (item.id === currentId) {
        item.currentTimes += 1;
        if (index >= 0) {
          item.branchs[index].currentTimes += 1;
        }
      }
      return item;
    });

    setAllAims({
      ...allAims,
      data: newData,
    });
  };
  const onEditChange = (type, id, title) => {
    if (type === EAimType.start) {
      setAllAims({ ...allAims, editId: id });
      return;
    }
    const { data } = allAims;
    if (type === EAimType.delete) {
      const newData = data.filter((item) => item.id !== id);
      setAllAims({ ...allAims, data: newData });
      return;
    }
    if (type === EAimType.top) {
      const newData = data.map((item) => {
        if (item.id === id) {
          item.sort =
            item.sort === EAimSort.top ? EAimSort.normal : EAimSort.top;
          item.modifyTime = moment().valueOf();
        }
        return item;
      });
      setAllAims({ ...allAims, editId: '', data: newData });
      return;
    }
    if (type === EAimType.rename) {
      if (!title) {
        message.error('标题不能为空');
        return;
      }
      const newData = data.map((item) => {
        if (item.id === id) {
          item.title = title;
          item.modifyTime = moment().valueOf();
        }
        return item;
      });
      setAllAims({ ...allAims, editId: '', data: newData });
    }
  };

  return (
    <div className={styles.Aim}>
      <div className={styles.content}>
        <EditAim
          editId={editId}
          data={currentAim}
          onEditChange={onEditChange}
          onSubmit={changeCurrentAim}
        />
        <AimList data={currentAim} addBranchTimes={addBranchTimes} />
      </div>
    </div>
  );
};
export default Aim;
