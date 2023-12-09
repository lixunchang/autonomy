import React, { useState, useRef, useEffect } from 'react';
import styles from './FileSearch.less';
import { Input, Button } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import useKeyPressed from '../hooks/useKeyPressed';
import useIpcRenderer from '../hooks/useIpcRenderer';

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyPressed(13);
  const escPressed = useKeyPressed(27);
  const node = useRef(null);

  const closeSearch = () => {
    setInputActive(false);
    setValue('');
  };
  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value);
    }
    if (escPressed && inputActive) {
      closeSearch();
    }
  });
  // input 鑷姩鑾峰彇鐒︾偣
  useEffect(() => {
    if (inputActive) {
      node.current.focus();
    }
  }, [inputActive]);

  useIpcRenderer({
    'search-file': () => {
      setInputActive(true);
    },
  });

  return (
    <div className={styles.FileSearch}>
      {!inputActive ? (
        <div className={styles.noInputActive}>
          <span className={styles.title}>自治领</span>
          <Button
            style={{ width: 24 }}
            type="text"
            icon={<SearchOutlined style={{ color: 'white' }} />}
            onClick={() => setInputActive(true)}
          />
        </div>
      ) : (
        <div className={styles.inputActive}>
          <Input
            placeholder="搜索"
            ref={node}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              width: 'calc(100% - 30px)',
              height: 24,
              padding: '0 4px',
              background: '#5e5e5e',
              borderColor: '#9e9e9e',
              color: '#fff',
              caretColor: '#fff',
            }}
          />
          <Button
            style={{ width: 24 }}
            type="text"
            icon={<CloseOutlined style={{ color: 'white' }} />}
            onClick={closeSearch}
          />
        </div>
      )}
    </div>
  );
};

export default FileSearch;
