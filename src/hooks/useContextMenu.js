import { useEffect, useRef } from 'react';
import { getParentNode } from '../utils/helper';
// import nodejs modules
const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const useContextMenu = (menus, targetClass) => {
  const clickElement = useRef(null);
  useEffect(() => {
    const menu = new Menu();
    menus.forEach((item) => {
      menu.append(new MenuItem(item));
    });
    const handleContextMenu = ({ target }) => {
      // 只有 e.target被 target 包裹时才出现
      // const targetEle = document.querySelector(target);
      // if (targetEle && targetEle.contains(e.target)) {
      //if (target.classList.contains(targetClass)) {
      const parentNode = getParentNode(target, targetClass);
      if (parentNode) {
        clickElement.current = parentNode;
        menu.popup({ window: remote.getCurrentWindow() });
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  return clickElement;
};

export default useContextMenu;
