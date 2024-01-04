import { useSlateStatic } from 'slate-react';
import EditorIcon from '../../Icon';
import imageExtensions from 'image-extensions';
import { insertImage, isImageUrl } from '../formatter/images';

const { remote } = window.require('electron');

const InsertImage = () => {
  const editor = useSlateStatic();

  const handleSelectFolder = () => {
    remote.dialog
      .showOpenDialog({
        title: '选择选择图片',
        filters: [
          {
            name: 'Image Files',
            extension: imageExtensions || ['png', 'jpg', 'jpeg'],
          },
        ],
        properties: ['openFile'],
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          const [url] = filePaths;
          const imgUrl = 'file://' + url;
          // setPath(path);
          if (imgUrl && !isImageUrl(imgUrl)) {
            return;
          }
          imgUrl && insertImage(editor, imgUrl);
        }
      });
  };

  return (
    <EditorIcon
      style={{ color: '#aaaaaa' }}
      type="icon-editor-image"
      onClick={handleSelectFolder}
    />
  );
};
export default InsertImage;
