import { getSaveLocation } from './helper.js';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import {
  getPdfPageText,
  getPdfPageTextWithStatus,
  getPdfPageImages,
} from './pdf.js';
const dirname = window.require('path').dirname;

const { join } = window.require('path');
const fs = window.require('fs');
const fsPs = fs.promises;
// Node API
const pdfjsLib = require('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const fileHelper = {
  readPdfPage: async (path, number) => {
    const data = new Uint8Array(fs.readFileSync(path));
    const pdf = await pdfjsLib.getDocument(data).promise;
    const page = await pdf.getPage(number);
    const operatorList = await page.getOperatorList();
    const { width, height } = await page.getViewport({ scale: 1 });

    console.log('pdf-page-status', path, number, pdf);
    return {
      page: number,
      data: await getPdfPageTextWithStatus(page, operatorList),
      images: await getPdfPageImages(page, operatorList),
      info: {
        size: pdf.numPages,
        width,
        height,
      },
    };
  },
  getPdfTotalText: async (path) => {
    // Object.assign(window, { pdfjsWorker: pdfjsWorker }); // added to fit 2.3.0
    const data = new Uint8Array(fs.readFileSync(path));
    const pdf = await pdfjsLib.getDocument(data).promise;
    const maxPages = pdf.numPages;
    const pagePromises = [];
    for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
      pagePromises.push(getPdfPageText(pdf, pageNo));
    }
    const pageTexts = await Promise.all(pagePromises);

    return pageTexts.join('/n/n/n');
  },
  readFile: (path) => {
    return fsPs.readFile(path, { encoding: 'utf-8' });
  },
  writeFile: (path, content) => {
    
    // 递归创建目录
    const mkdirP = (dir) => {
      if (fs.existsSync(dir)) {
        return;
      }
      mkdirP(dirname(dir));
      fs.mkdirSync(dir);
    };

    // 确保目录存在
    mkdirP(dirname(path));

    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    return fsPs.writeFile(path, content, { encoding: 'utf-8' });
  },
  writeCopyImage: (path, fileName, content)=>{
    if (!fs.existsSync(path)) {
      const saveLoaction = getSaveLocation();
      const imgPath = join(saveLoaction, 'images/')
      if(!fs.existsSync(imgPath)){
        fs.mkdirSync(imgPath)
      }
      fs.mkdirSync(path);
    }
    return fsPs.writeFile(join(path, fileName), content.split(',')[1], {encoding: 'base64'})
  },
  writeImage: (path, fileName, content) => {
    const mkdirP = (dir) => {
      if (fs.existsSync(dir)) {
        return;
      }
      mkdirP(dirname(dir));
      fs.mkdirSync(dir);
    };

    // 确保目录存在
    mkdirP(path);
    
    // 处理不同格式的图片数据
    let imageData = content;
    if (typeof content === 'string' && content.includes('base64')) {
      imageData = content.split(',')[1];
    } else if (content instanceof Uint8Array) {
      imageData = content;
    } else {
      throw new Error('不支持的图片数据格式');
    }
    
    return fsPs.writeFile(join(path, fileName), imageData, {encoding: 'base64'});
  },
  copyFile: (from, path, fileName)=>{
    if (!fs.existsSync(path)) {
      const saveLoaction = getSaveLocation();
      const imgPath = join(saveLoaction, 'images/')
      if(!fs.existsSync(imgPath)){
        fs.mkdirSync(imgPath)
      }
      fs.mkdirSync(path);
    }
    const newPath = join(path, fileName)
    if(fs.existsSync(newPath)){
      return;
    }
    return fsPs.copyFile(from, newPath)
  },
  renameFile: (path, newPath) => {
    // console.log(path, newPath);
    return fsPs.rename(path, newPath);
  },
  deleteFile: (path, isCached = false) => {
    if(isCached){
      // 移动到回收站，物理删除
      return fsPs.unlink(path);
    } 
    return Promise.resolve()
  },
  exists: (path) => {
    return fs.existsSync(path);
  },
  mkAppDirSync: (path) => {
    const saveLoaction = getSaveLocation();
    if (!fs.existsSync(saveLoaction)) {
      fs.mkdirSync(saveLoaction);
    }
    const targetLocation = `${saveLoaction}/${path}`;
    if (!fs.existsSync(targetLocation)) {
      fs.mkdirSync(targetLocation);
    }
  },
  mkdirIfNotExists: (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  },
};

export default fileHelper;
