
const path = window.require('path');
const fs = window.require('fs-extra');

export const IMAGE_EXTENSIONS = Object.freeze([
  'jpeg',
  'jpg',
  'png',
  'gif',
  'svg',
  'webp',
]);

export const dataURItoBlob = function (dataURI) {
  const data = dataURI.split(';base64,');
  const byte = window.atob(data[1]);
  const mime = data[0].split(':')[1];
  const ab = new ArrayBuffer(byte.length);
  const ia = new Uint8Array(ab);
  const len = byte.length;
  let i;
  for (i = 0; i < len; i++) {
    ia[i] = byte.charCodeAt(i);
  }
  return new window.Blob([ab], { type: mime });
};

export const isFile = (filepath) => {
  try {
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isFile();
  } catch (_) {
    return false;
  }
};

export const isImageFile = (filepath) => {
  const extname = path.extname(filepath);
  return (
    isFile(filepath) &&
    IMAGE_EXTENSIONS.some((ext) => {
      const EXT_REG = new RegExp(ext, 'i');
      return EXT_REG.test(extname);
    })
  );
};

export const ensureDirSync = (dirPath) => {
  try {
    fs.ensureDirSync(dirPath);
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
};
