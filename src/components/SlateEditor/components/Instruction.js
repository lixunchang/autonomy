import React from 'react';
import { cx, css } from '@emotion/css';

const Instruction = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          white-space: pre-wrap;
          margin: 0 -20px 10px;
          padding: 10px 20px;
          font-size: 14px;
          background: #f8f8e8;
        `
      )}
    />
  )
);

export default Instruction;
