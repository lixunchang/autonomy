import fileHelper from './fileHelper';
import { getSaveLocation } from './helper';

const pdfjsLib = require('pdfjs-dist');

const savedLocation = getSaveLocation();

export const getPdfPageText = async (pdf, pageNo) => {
  const page = await pdf.getPage(pageNo);
  const tokenizedText = await page.getTextContent();
  const pageText = tokenizedText.items.map((token) => token.str).join('');
  return pageText;
};

export const getPdfPageTextWithStatus = async (page, operatorList) => {
  // const page = await pdf.getPage(pageNo);
  const tokenizedText = await page.getTextContent();
  // const operatorList = await page.getOperatorList();

  console.log('pdfjs-page-content', tokenizedText);
  return tokenizedText.items.map((token) => ({
    item: token,
    fontFace: page?.commonObjs?.get(token.fontName),
    // status: getTextStatus(token, operatorList, pdfjsLib.OPS),
  }));
};

export const getPdfPageImages = async (page, operatorList) => {
  // page.getAnnotations().then(function (items) {
  //   console.log('getAnnotations', items);
  // });
  // const resources = page.commonObjs.get('Resources');
  console.log('bmp: ', page, page.commonObjs);
  // 提取图片
  return operatorList.fnArray
    .reduce((acc, curr, i) => {
      if (
        [
          pdfjsLib.OPS.paintImageXObject,
          pdfjsLib.OPS.paintJpegXObject,
        ].includes(curr)
      ) {
        acc.push(operatorList.argsArray[i][0]);
        console.log(
          'xxxx=>>>',
          i,
          acc,
          curr,
          operatorList,
          operatorList.argsArray,
          operatorList.argsArray[i]
        );
      }
      return acc;
    }, [])
    .map((item) => {
      // const [x, y] = resources.get(item).get('BBox');
      const image = page.objs.get(item);
      console.log('getImageStatus===>', item, image);
      if (image.currentSrc) {
        return {
          src: image.currentSrc,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          // x,
          // y,
        };
      }
      if (image.data instanceof Uint8ClampedArray) {
        const canvas = document.createElement('canvas'); // ;new OffscreenCanvas(image.width, image.height);
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        // now you need a new clamped array because the original one, may not contain rgba data, and when you insert you want to do so in rgba form, I think that a simple check of the size of the clamped array should work, if it's 3 times the size aka width*height*3 then it's rgb and shall be converted, if it's 4 times, then it's rgba and can be used as it is; in my case it had to be converted, and I think it will be the most common case
        const data = new Uint8ClampedArray(image.width * image.height * 4);
        let k = 0;
        let i = 0;
        while (i < image.data.length) {
          data[k] = image.data[i]; // r
          data[k + 1] = image.data[i + 1]; // g
          data[k + 2] = image.data[i + 2]; // b
          data[k + 3] = 255; // a

          i += 3;
          k += 4;
        }

        // now here I create the image data context
        const imgData = ctx.createImageData(image.width, image.height);
        imgData.data.set(data);
        ctx.putImageData(imgData, 0, 0);
        // get myself a buffer
        // const buff = canvas.toBuffer('image/png');
        const filePath = savedLocation + '/image/33' + item + '.png';
        // and I wrote the file, worked like charm, but this buffer encodes for a png image, which can be rather large, with an image conversion utility like sharp.js you may get better results by compressing the thing.

        const src = canvas.toDataURL('image/png');
        const base64 = src
          .replace(/^data:image\/\w+;base64,/, '')
          .replace(/s/g, '+');
        const buff = Buffer.from(base64, 'base64');

        fileHelper.writeFile(filePath, buff);
        console.log('ddddd', base64 === buff.toString('base64'), {
          src, //(await canvas.convertToBlob()) || filePath,
          base64,
          naturalWidth: image.width,
          naturalHeight: image.height,
        });
        return {
          src,
          naturalWidth: image.width,
          naturalHeight: image.height,
        };
      }
      // const bmp = image.bitmap;
      // console.log('bmp: ', bmp, image.src);
      // // OffscreenCanvas
      // const resizeScale = 1 / 4; // 这个可以控制转换后的图片大小
      // const width = bmp.width * resizeScale;
      // const height = bmp.height * resizeScale;
      // const canvas = new OffscreenCanvas(width, height);
      // // 获取 canvas bitmaprenderer 上下文
      // const ctx = canvas.getContext('bitmaprenderer');
      // // 把 ImageBitmap 渲染到 OffscreenCanvas
      // ctx.transferFromImageBitmap(bmp);
      // // 把 canvas 画布转化为 Blob 对象
      // // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob
      // // const blob = await canvas.convertToBlob();
      // // console.log('blob: ', blob); // blob
      // // 最后使用 Blob 作为 URL.createObjectURL 的参数，渲染出 img 图片
      // // 如果不需要渲染，则可以讲 Blob 数据上传到云存储
      // const buffer = canvas.toBuffer('image/png');
      // // fs.writeFileSync('./test.png', buffer);
      // fileHelper.writeFile(savedLocation + 'image/test.png', buffer);
      // page.objs.get(item, (image) => {
      //   console.log('bmp:image: ', item, image);
      //   // lastImage = image;
      //   (async function () {

      //   })();
      // });
    });
};

export function getTextStatus(item, operatorList, OPS) {
  // 记录状态的堆栈
  const stack = [];
  // 当前状态记录
  let currentStatus = {};

  // 按顺序分析页面指令
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];
    switch (fn) {
      //保存
      case OPS.save:
        stack.push(currentStatus);
        currentStatus = { ...currentStatus };
        break;
      //还原
      case OPS.restore:
        currentStatus = stack.pop() ?? {};
        break;
      //设置文本填充颜色
      case OPS.setFillRGBColor:
        currentStatus.currentColor = [args[0], args[1], args[2]];
        break;
      //设置文本区域
      case OPS.setTextMatrix:
        currentStatus.currentMatrix = [args[4], args[5]];
        currentStatus.currentXY = [args[4], args[5]];
        break;
      //设置行距
      case OPS.setLeading:
        currentStatus.leading = args[0];
        break;
      //设置字体类型和大小
      case OPS.setFont:
        currentStatus.font = [args[0], args[1]];
        break;
      //计算换行, 换行时当前坐标需要跳到下一行的开头
      case OPS.nextLine:
      case OPS.nextLineShowText:
      case OPS.nextLineSetSpacingShowText:
        if (currentStatus.leading && currentStatus.currentXY) {
          currentStatus.currentXY = [
            currentStatus.currentXY[0],
            currentStatus.currentXY[1] - currentStatus.leading,
          ];
        }
        break;
      //移动文本坐标
      case OPS.moveText:
        if (currentStatus.currentXY) {
          currentStatus.currentXY = [
            currentStatus.currentXY[0] + args[0],
            currentStatus.currentXY[1] + args[1],
          ];
        }
        break;
      //显示文本
      case OPS.showText:
        if (currentStatus.currentXY) {
          let x = currentStatus.currentXY[0];
          let y = currentStatus.currentXY[1];
          // 判断文本是否匹配定位
          const isMatch = () =>
            Math.abs(x - item.transform[4]) < item.height / 5 &&
            Math.abs(y - item.transform[5]) < item.height / 5;
          if (isMatch()) {
            return currentStatus.currentColor;
          }
          if (args[0]) {
            // 计算打印的每个字的实际坐标, 然后和item的坐标进行配对
            for (let charInfo of args[0]) {
              if (typeof charInfo?.width == 'number' && currentStatus.font) {
                if (isMatch()) {
                  return currentStatus.currentColor;
                }
                x += (charInfo?.width / 1000) * currentStatus.font[1];
              } else if (typeof charInfo == 'number' && currentStatus.font) {
                if (isMatch()) {
                  return currentStatus.currentColor;
                }
                x -= (charInfo / 1000) * currentStatus.font[1];
              }
            }
          }
        }
        break;
      default:
        break;
    }
  }
  return currentStatus;
}

export function getImageStatus(item, operatorList, OPS) {
  // 记录状态的堆栈
  const stack = [];
  // 当前状态记录
  let currentStatus = {};

  // 按顺序分析页面指令
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];
    switch (fn) {
      //保存
      case OPS.save:
        stack.push(currentStatus);
        currentStatus = { ...currentStatus };
        break;
      //还原
      case OPS.restore:
        currentStatus = stack.pop() ?? {};
        break;
      //设置文本区域
      case OPS.setTextMatrix:
        currentStatus.currentMatrix = [args[4], args[5]];
        currentStatus.currentXY = [args[4], args[5]];
        currentStatus.args = args;
        currentStatus.index = i;
        break;
      case OPS.paintImageXObject:
      case OPS.paintJpegXObject:
        if (args[0] === item) {
          console.log('getImageStatus===>', currentStatus, i);
          return currentStatus;
        }
        break;
      default:
        break;
    }
  }
  return {};
}
