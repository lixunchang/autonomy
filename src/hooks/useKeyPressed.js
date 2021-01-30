import { useState, useEffect } from 'react';

const useKeyPressed = (targetKeyCode) => {
  const [keyPressed, setKeyPressed] = useState(false);
  useEffect(() => {
    const keyDownHandler = ({ keyCode }) => {
      if (keyCode === targetKeyCode) {
        setKeyPressed(true);
      }
    };
    const keyUpHandler = ({ keyCode }) => {
      if (keyCode === targetKeyCode) {
        setKeyPressed(false);
      }
    };
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);
  return keyPressed;
};

export default useKeyPressed;
