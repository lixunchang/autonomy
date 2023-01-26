import React from 'react';

const Iframe = (props) => (
  <iframe
    width="100%"
    height="100%"
    style={{ width: '100%', height: '100%', background: '#000' }}
    title="iframe"
    {...props}
    src="https://music.163.com/"
  />
);

export default Iframe;
