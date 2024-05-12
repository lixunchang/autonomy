const paragraphEnds = ['？', '！', '。', '：', '?', '!', '.'];
const noParagraphStarts = ['[', '”'];

const noParagraphStart = ({ str = '' }) => {
  return noParagraphStarts.some((symbol) => str.startsWith(symbol));
};

const checkParagraphEnd = (item, info, startX) => {
  return paragraphEnds.some((symbol) => item.str.endsWith(symbol));
  // ||
  // (startX === 72 && info.width - (startX * 2 + item.width) > item.height)
};

const checkNewLine = (info, item, paragraph, positionX, positionY, index) => {
  // (paragraph.isEnd ||
  //   paragraph.positionX === 0 ||
  //   positionX === paragraph.positionX) &&
  // // ||
  // // paragraph.positionX + paragraph.width !== positionX
  // // checkParagraphStart(item) &&
  // Math.abs(paragraph.positionX + paragraph.width - positionX) < 1
  const isFirst = index === 0;
  const isFullLine =
    info.width - (paragraph.positionX * 2 + paragraph.width) <
    paragraph.height * 1.5;
  const sameStartX = Math.abs(positionX - paragraph.positionX) < 1;
  const samePointY =
    Math.abs(positionY - paragraph.positionY) < paragraph.height;
  /**
   * 收尾相连
   */
  const isEndToEnd =
    Math.abs(paragraph.positionX + paragraph.width - positionX) < 1;
  console.log(
    info,
    item,
    paragraph,
    positionX,
    positionY,
    'isFullLine=',
    isFullLine,
    'sameStartX',
    sameStartX,
    'samePointY',
    samePointY,
    'isEndToEnd',
    isEndToEnd
  );

  if (isFirst) {
    return true;
  }

  if (noParagraphStart(item) || isFullLine) {
    return false;
  }

  if (!isFullLine && sameStartX) {
    return true;
  }

  if (!isEndToEnd && !sameStartX) {
    return true;
  }

  if (samePointY && isEndToEnd) {
    return false;
  }

  if (paragraph.isEnd && !samePointY) {
    return true;
  }

  return false;
};

const checkInsertImage = (
  info,
  textY,
  nextTextY,
  len,
  index,
  images,
  imageIndex
) => {
  if (images.length <= 0 || imageIndex >= images.length) {
    return {};
  }

  // 第一段文字
  if (index === 0 && info.height - textY > 100) {
    return images[imageIndex];
  }
  // 中间段
  if (nextTextY - textY > 60) {
    return images[imageIndex];
  }
  // 最后一段文字
  if (index === len - 1 && textY > 100) {
    return images[imageIndex];
  }
  return {};
};

export const combinePdfTextToRichText = (data = [], info, images = []) => {
  if (data.length === 0 && images.length > 0) {
    return {
      result: images
        .filter(({ src }) => src)
        .map((item) => ({
          type: 'image',
          url: item.src,
          style: {
            maxWidth: '100%',
            maxHeight: '100%',
          },
          children: [{ text: '' }],
        })),
    };
  }
  let imgIndex = 0;
  return data.reduce(
    (total, { item, fontFace, status }, index) => {
      const { result, paragraph } = total;
      const positionX = item.transform[4];
      const positionY = item.transform[5];
      console.log('isEnd==', positionX, positionY, paragraph);
      if (checkNewLine(info, item, paragraph, positionX, positionY, index)) {
        const { src } = checkInsertImage(
          info,
          positionY,
          paragraph.positionY,
          data.length,
          index,
          images,
          imgIndex
        );
        if (src) {
          imgIndex++;
        }
        return {
          result: [
            ...result,
            ...(src
              ? [
                  {
                    type: 'image',
                    url: src,
                    children: [{ text: '' }],
                  },
                ]
              : []),
            {
              type: 'paragraph',
              style: {
                // color: `rgb(${status.currentColor.toString()})`,
                // fontFamily: fontFace.fallbackName,
                fontSize: item.height,
                fontWeight: item.height > 18 ? 500 : 400,
              },
              children: [
                {
                  text: item.str,
                  style: {
                    // color: `rgb(${status.currentColor.toString()})`,
                    // fontFamily: fontFace.fallbackName,
                    fontSize: item.height,
                    fontWeight: item.height > 18 ? 500 : 400,
                  },
                },
              ],
            },
          ],
          paragraph: {
            positionX,
            positionY,
            width: item.width,
            height: item.height,
            fontSize: item.height,
            isEnd: checkParagraphEnd(item, info, positionX),
          },
        };
      }
      console.log('logloglog==>', result.length);
      result[result.length - 1].children = result[
        result.length - 1
      ].children.concat([
        {
          text: item.str,
          style: {
            // color: `rgb(${status.currentColor.toString()})`,
            fontFamily: fontFace.fallbackName,
            fontSize: item.height,
          },
        },
      ]);
      return {
        result,
        paragraph: {
          ...paragraph,
          positionX,
          positionY,
          width: item.width,
          isEnd: checkParagraphEnd(item, info, positionX),
        },
      };
    },
    {
      result: [],
      paragraph: {
        positionX: 0,
        isEnd: true,
      },
    }
  );
};
