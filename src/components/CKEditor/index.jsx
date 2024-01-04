import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';
// import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block';
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import { builtinPlugins, defaultConfig } from './config';
// import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './index.less';
export default function CKEditor5 ({value, onChange, isLoaded}){

  return (
      <CKEditor
          editor={ DecoupledDocumentEditor }
          data={ value || (isLoaded? "请输入...": "正在加载...") }
          config={{
            ...defaultConfig,
            plugins: builtinPlugins
          }}
          // config={{
          //   // plugins: builtinPlugins,
          //   toolbar: {
          //     items: [
          //         'heading',
          //         '|', 'fontSize', 'fontColor', 'fontBackgroundColor', 'fontFamily',
          //         '|', 'bold', 'italic', 'underline', 'blockQuote',
          //         '|', 'link', 'bulletedList', 'numberedList', 'todoList','horizontalLine', // 'outdent', 'indent',
          //         '|', 'codeBlock', 'uploadImage', 'insertTable', 'mediaEmbed',
          //     ]
          //   },
          //   language: 'zh-cn',
          //   image: {
          //     toolbar: [
          //       'imageTextAlternative',
          //       'toggleImageCaption',
          //       'imageStyle:inline',
          //       'imageStyle:block',
          //       'imageStyle:side',
          //     ],
          //   },
          //   table: {
          //     contentToolbar: [
          //       'tableColumn',
          //       'tableRow',
          //       'mergeTableCells',
          //       'tableCellProperties',
          //       'tableProperties',
          //     ],
          //   },
          //   // cloudServices: {
          //   //     // All predefined builds include the Easy Image feature.
          //   //     // Provide correct configuration values to use it.
          //   //     tokenUrl: 'https://example.com/cs-token-endpoint',
          //   //     uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
          //   //     // Read more about Easy Image - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html.
          //   //     // For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
          //   // }
          // }}
          onChange={ ( event, editor ) => {
              const data = editor.getData();
              onChange(data);

          } }
          // onReady={ editor => {
          //     // You can store the "editor" and use when it is needed.
          //     console.log( 'Editor is ready to use!', editor );
          // } }
          // onBlur={ ( event, editor ) => {
          //     console.log( 'Blur.', editor );
          // } }
          // onFocus={ ( event, editor ) => {
          //     console.log( 'Focus.', editor );
          // } }
      />
  );
}
