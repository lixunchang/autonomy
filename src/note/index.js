import React from 'react';
import useIcpRenderer from '../hooks/useIpcRenderer';
import VEditor from '../components/VEditor';
import styles from './index.less';

const Note = ({ onChange, activeFile }) => {
  const { id, body } = activeFile;

  return (
    <div className={styles.Note}>
      <VEditor
        value={body}
        onSave={(val) => {
          onChange(id, val);
        }}
      />
    </div>
  );
};

export default Note;
