import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import { builtinPlugins } from './config';
// import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './index.less';
export default function CKEditor5 ({value, onChange}){

  return (
      <CKEditor
          editor={ DecoupledDocumentEditor }
          data={ value || "正在加载..." }
          config={{
            toolbar: false,
            plugins: builtinPlugins
          }}
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
