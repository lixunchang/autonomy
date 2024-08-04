import { useSlateStatic } from 'slate-react';
import EditorIcon from '../../Icon';
import imageExtensions from 'image-extensions';
import { insertImage, isImageUrl } from '../formatter/images';
import fileHelper from '../../../utils/fileHelper';
import { getSaveLocation } from '../../../utils/helper';

const { join } = window.require('path');
const { remote } = window.require('electron');

const savedLocation = getSaveLocation();
const imageCopyPrefix = `${savedLocation}images/copy`;

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
        properties: ['openFile', 'multiSelections'],
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          console.log('iiiImage=====>bbbbbb',filePaths)
          filePaths.forEach(url=>{
            if(!url){
              return;
            }
            if (!isImageUrl('file://' + url)) {
              remote.dialog.showMessageBox({
                type: 'error',
                title: `格式不支持`,
                message: `暂不支持${url.split('.').pop()}格式的图片`,
              });
              return;
            }      
            const [fileName] = url.split('/').reverse();
            console.log('iiiImage=====>bbbbbb', url, fileName)
            fileHelper.copyFile(url, imageCopyPrefix, fileName);
            insertImage(editor, 'file://' + join(imageCopyPrefix, fileName));
          })
          // setPath
          // const [url] = filePaths;


          
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
