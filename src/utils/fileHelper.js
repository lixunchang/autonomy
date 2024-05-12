import { getSaveLocation } from './helper.js';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import {
  getPdfPageText,
  getPdfPageTextWithStatus,
  getPdfPageImages,
} from './pdf.js';

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
