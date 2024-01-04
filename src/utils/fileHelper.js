import { getSaveLocation } from './helper.js';

const fs = window.require('fs');
const fsPs = fs.promises;

const fileHelper = {
  readFile: (path) => {
    return fsPs.readFile(path, { encoding: 'utf-8' });
  },
  writeFile: (path, content) => {
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    return fsPs.writeFile(path, content, { encoding: 'utf-8' });
  },
  renameFile: (path, newPath) => {
    // console.log(path, newPath);
    return fsPs.rename(path, newPath);
  },
  deleteFile: (path) => {
    return fsPs.unlink(path);
  },
  exists: (path) => {
    return fs.existsSync(path);
  },
  mkAppDirSync: (path) => {
    const saveLoaction = getSaveLocation();
    if (!fs.existsSync(saveLoaction)) {
      fs.mkdirSync(saveLoaction);
    }
    const targetLocation = `${saveLoaction}${path}`;
    if (!fs.existsSync(targetLocation)) {
      fs.mkdirSync(targetLocation);
    }
  },
};

export default fileHelper;
