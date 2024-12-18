import React from 'react';
import { cx, css } from '@emotion/css';
import { useSlate } from 'slate-react';
import {
  isBlockActive,
  isMarkActive,
  toggleBlock,
  toggleMark,
} from '../formatter/utils';
import { TEXT_ALIGN_TYPES } from '../constant';

export const Button = React.forwardRef(
  ({ className, active, reversed, ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'white'
              : '#aaa'
            : active
            ? 'black'
            : '#ccc'};
        `
      )}
    />
  )
);

export const BlockButton = ({ format, icon, onClick }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'textAlign' : 'type'
      )}
      onMouseDown={(event) => {
        if(!format){
          onClick&&onClick()
          return;
        }
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

export const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        if(!format){
          return;
        }
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

export default Button;
