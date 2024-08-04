import React from 'react';
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
import { DeleteOutlined } from '@ant-design/icons';
import { getSaveLocation } from '../../../utils/helper';
import moment from 'moment';
import fileHelper from '../../../utils/fileHelper';

const { join } = window.require('path');
const savedLocation = getSaveLocation();
const imagePathPrefix = `${savedLocation}images/paste`;
const imageCopyPrefix = `${savedLocation}images/copy`;

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
  console.log('iiiImage=====>00000', url)
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
            fileHelper.writeImage(imagePathPrefix, fileName, url).then(res=>{
              insertImage(editor, 'file://'+join(imagePathPrefix, fileName));
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

export const Image = ({ attributes, children, element, style }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
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
            display: inline-block;
            position: relative;
          `}>
          <img
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
          />
          <Button
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
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withImages;
