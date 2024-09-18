import React, { useState } from 'react';
import { Image as AntdImage, Slider } from 'antd';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { Transforms } from 'slate';
import {
  useSlateStatic,
  useSelected,
  useFocused,
  ReactEditor,
} from 'slate-react';
import { css } from '@emotion/css';
import Button from '../components/Button';
import { PlusOutlined, DeleteOutlined, FullscreenOutlined } from '@ant-design/icons';
import moment from 'moment';
import fileHelper from '../../../utils/fileHelper';
import { imageCopyPrefix, imagePastePrefix } from '../constant';
import styles from './images.less';

const { join } = window.require('path');

const fallback = "data:image/png;base64,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"


// join(
//   `${savedLocation}${'images'}/`,
//   `${newId}.json` //${type === 'note' ? '.md' : '.json'}
// );

export const isImageUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext);
};

export const insertImage = (editor, url) => {
  const text = { text: '' };
  const image = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image);
};

const withImages = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    const { files } = data;
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', (event) => {
            const url = reader.result;

            console.log('files==', file, reader, event);
            const fileName = moment().format('YYYYMMDDHHmmss.SSS')+'.png';
            // const imgPath = join(imagePathPrefix, moment().format('YYYYMMDDHHmmss.SSS')+'.png');
            fileHelper.writeImage(imagePastePrefix, fileName, url).then(res=>{
              insertImage(editor, 'file://'+join(imagePastePrefix, fileName));
            })
            
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      const [fileName] = text.split('/').reverse();
      const newPath = join(imageCopyPrefix, fileName);
      fileHelper.copyFile(text, newPath);
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const Image = ({ attributes, scaleSize, children, element, style, onChange }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const formatter = (value) => `${value}%`;
  const selected = useSelected();
  const focused = useFocused();
  console.log('images===>>', attributes, scaleSize)
  const [ imageScale, setImageScale ] = useState(scaleSize||80);
  const [ previewVisible, setPreviewVisible ] = useState(false);

  const handleScaleImage=(v)=>{
    setImageScale(v);
    onChange({scaleSize:v})
  }
  return (
    <div className={styles.antd_img} {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
          text-align: center;
          margin-bottom: 14px;
        `}
      >
        <div className={css`
            width: 100%;
            display: inline-block;
            position: relative;
            border: ${selected ? '1px solid #9999994a' : 'none'}
          `}>
          <AntdImage
            alt=""
            fallback={fallback}
            src={element.url}
            style={{
              ...style,
              width: imageScale +'%',
            }}
            preview={{
              visible: previewVisible,
              onVisibleChange: ()=>setPreviewVisible(false)
            }}
          />
          {/* <img
            alt=""
            src={element.url}
            style={style}
            className={css`
              display: inline-block;
              max-width: 100%;
              max-height: 20em;
              min-width: 10em;
              min-height: 10em;
              border: 1px solid #e2e2e2;
              box-shadow: ${selected && focused ? '0 0 0 1px #6e6e6e' : 'none'};
            `}
          /> */}
          {/* TODO 画廊 */}
          {/* <Button
            active
            onClick={() => Transforms.removeNodes(editor, { at: path })}
            className={css`
              display: ${selected && focused ? 'inline' : 'none'};
              position: absolute;
              top: 0.5em;
              left: 0.5em;
              background-color: #00000066;
              color: white !important;
              padding: 0 4px;
            `}
          >
            <PlusOutlined />
          </Button> */}
          <Button
            active
            onClick={() => Transforms.removeNodes(editor, { at: path })}
            className={css`
              display: ${selected && focused ? 'inline' : 'none'};
              position: absolute;
              top: 0.5em;
              left: 2.5em;
              background-color: #00000066;
              color: white !important;
              padding: 0 4px;
            `}
          >
            <DeleteOutlined />
          </Button>
          <Button
            active
            className={css`
              display: ${selected ? 'inline' : 'none'};
              position: absolute;
              top: 0.5em;
              right: 2.5em;
              background-color: #00000080;
              color: white !important;
              padding: 0 4px;
              width: 100px;
            `}
          >
            <Slider style={{marginBlock: 5}} min={6} value= {imageScale} tooltip={{ formatter }} onChange={handleScaleImage}/>
          </Button>
          <Button
            active
            onClick={() => setPreviewVisible(true)}
            className={css`
              display: ${selected ? 'inline' : 'none'};
              position: absolute;
              top: 0.5em;
              right: 0.5em;
              background-color: #00000080;
              color: white !important;
              padding: 0 4px;
            `}
          >
            <FullscreenOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withImages;
