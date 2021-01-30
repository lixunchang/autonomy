const fs = window.require('fs').promises;

const fileHelper = {
  readFile: (path) => {
    return fs.readFile(path, { encoding: 'utf-8' });
  },
  writeFile: (path, content) => {
    return fs.writeFile(path, content, { encoding: 'utf-8' });
  },
  renameFile: (path, newPath) => {
    console.log(path, newPath);
    return fs.rename(path, newPath);
  },
  deleteFile: (path) => {
    return fs.unlink(path);
  },
};

export default fileHelper;
