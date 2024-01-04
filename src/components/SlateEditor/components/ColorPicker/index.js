'use strict';

import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import EditorIcon from '../../../Icon';
import { Editor } from 'slate';
import styles from './index.less';
import { useSlate } from 'slate-react';

const popover = {
  position: 'absolute',
  zIndex: '2',
};
const cover = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
};

function ColorPicker() {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState({ hex: '#520520' });

  const handleChange = (color, event) => {
    setColor(color);
    Editor.addMark(editor, 'color', color.hex);
  };

  const handleOpenColorPicker = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <span>
      <EditorIcon
        type="icon-editor-text-color"
        onClick={handleOpenColorPicker}
        style={{ userSelect: 'none', color: '#aaaaaa' }}
      />
      {visible ? (
        <div className={styles.chrome_picker} style={popover}>
          <div style={cover} onClick={handleClose} />
          <ChromePicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </span>
  );
}

export default ColorPicker;
