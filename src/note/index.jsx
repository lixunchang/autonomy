/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState} from 'react';

import styles from './index.less';
// import { getSaveLocation } from '../utils/helper';
// import Editor from '../components/CKEditor'; 
import Editor from '../components/SlateEditor'; 


const Note = ({ activeFile, onChange }) => {
  const { id, body = '', isLoaded = false } = activeFile;
  // const [activeId, setActiveId]=useState(id);
  const [data, setData] = useState('');
  const handleContentChange = (data) => {
    if (data !== body) {
      onChange(id, data);
    }
  };
  // useEffect(() => {
  //     setData(body);
  // }, [id, isLoaded]);
  console.log('idid',id, activeFile, data)
  return (
    <div className={styles.Note}>
      {
        body&&
        <Editor id={id} value={body} onChange={handleContentChange} isLoaded={isLoaded}/>
      }
    </div>
  );
};

export default Note;
