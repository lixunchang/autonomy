/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState} from 'react';

import styles from './index.less';
// import { getSaveLocation } from '../utils/helper';
import Editor from '../components/CKEditor'; 


const Note = ({ activeFile, onChange }) => {
  const { id, body = '', isLoaded = false } = activeFile;
  const [data, setData] = useState('');
  const handleContentChange = (data) => {
    if (data !== body) {
      onChange(id, data);
    }
  };

  useEffect(() => {
      setData(body);
  }, [id, isLoaded]);

  return (
    <div className={styles.Note}>
      <Editor value={data} onChange={handleContentChange}/>
    </div>
  );
};

export default Note;
