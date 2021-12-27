/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Muya from '../components/muya/lib';
import TablePicker from '../components/muya/lib/ui/tablePicker';
import QuickInsert from '../components/muya/lib/ui/quickInsert';
import CodePicker from '../components/muya/lib/ui/codePicker';
import EmojiPicker from '../components/muya/lib/ui/emojiPicker';
import ImagePathPicker from '../components/muya/lib/ui/imagePicker';
import ImageSelector from '../components/muya/lib/ui/imageSelector';
import ImageToolbar from '../components/muya/lib/ui/imageToolbar';
import Transformer from '../components/muya/lib/ui/transformer';
import FormatPicker from '../components/muya/lib/ui/formatPicker';
import LinkTools from '../components/muya/lib/ui/linkTools';
import FootnoteTool from '../components/muya/lib/ui/footnoteTool';
import TableBarTools from '../components/muya/lib/ui/tableTools';
import FrontMenu from '../components/muya/lib/ui/frontMenu';

import { moveImageToFolder } from '../components/muya/lib/utils/fileSystem';
import { guessClipboardFilePath, animatedScrollTo } from '../utils/clipboard';
import styles from './index.less';

// Node API
const { shell, remote } = window.require('electron');
const Store = window.require('electron-store');

const settingStore = new Store({ name: 'settings' });
const savedLocation =
  settingStore.get('savedFileLocatiion') ||
  `${remote.app.getPath('documents')}/cloud-note/`;

const unsplashAccessKey =
  '123dd38b90fae4d7cb513b54d98612a4857eef30e7121aa46ebee6f0cad8404c';
// const secret_key =
//   'f3fca8e08dbd428eb9c675756346153f3e6b986669a8c6c78ad5a04cfeaf2ced';
const STANDAR_Y = 320;

const IMAGE_EXTENSIONS = Object.freeze([
  'jpeg',
  'jpg',
  'png',
  'gif',
  'svg',
  'webp',
]);

// use muya UI plugins
Muya.use(TablePicker);
Muya.use(QuickInsert);
Muya.use(CodePicker);
Muya.use(EmojiPicker);
Muya.use(ImagePathPicker);
Muya.use(ImageSelector, {
  unsplashAccessKey,
  photoCreatorClick: (url) => shell.openExternal(url),
});
Muya.use(Transformer);
Muya.use(ImageToolbar);
Muya.use(FormatPicker);
Muya.use(FrontMenu);
Muya.use(LinkTools, {
  jumpClick: (link) => {
    console.log('jumpClick', link);
  },
});
Muya.use(FootnoteTool);
Muya.use(TableBarTools);

const Note = ({ activeFile, onChange }) => {
  const { id, body = '', isLoaded = false } = activeFile;
  const editorWrapRef = useRef(null);
  const editorRef = useRef(null);
  // let editor = editorRef.current;

  const setCompareOption = (value, oldValue, key) => {
    if (value !== oldValue && editorRef.current) {
      editorRef.current.setOptions({ [key]: value });
    }
  };

  const typewriter = (value) => {
    if (value) {
      scrollToCursor();
    }
  };

  const scrollToCursor = (duration = 300) => {
    console.log('oooscroll', editorRef.current);
    if (!editorRef.current) return;
    const { container } = editorRef.current;
    const { y } = editorRef.current.getSelection().cursorCoords;
    console.log(
      'ooo0000我执行了2',
      container,
      y,
      container.scrollTop + y - STANDAR_Y
    );
    animatedScrollTo(container, container.scrollTop + y - STANDAR_Y, duration);
  };
  const setMarkdownToEditor = ({ markdown, cursor }) => {
    if (editorRef.current) {
      editorRef.current.clearHistory();
      if (cursor) {
        editorRef.current.setMarkdown(markdown, cursor, true);
      } else {
        editorRef.current.setMarkdown(markdown);
      }
    }
  };

  const options = useMemo(
    () => ({
      preferLooseListItem: (v, ov) =>
        setCompareOption(v, ov, 'preferLooseListItem'),
      autoPairBracket: (v, ov) => setCompareOption(v, ov, 'autoPairBracket'),
      autoPairMarkdownSyntax: (v, ov) =>
        setCompareOption(v, ov, 'autoPairMarkdownSyntax'),
      autoPairQuote: (v, ov) => setCompareOption(v, ov, 'autoPairQuote'),
      trimUnnecessaryCodeBlockEmptyLines: (v, ov) =>
        setCompareOption(v, ov, 'trimUnnecessaryCodeBlockEmptyLines'),
      bulletListMarker: (v, ov) => setCompareOption(v, ov, 'bulletListMarker'),
      orderListDelimiter: (v, ov) =>
        setCompareOption(v, ov, 'orderListDelimiter'),
      tabSize: (v, ov) => setCompareOption(v, ov, 'tabSize'),
      fontSize: (v, ov) => setCompareOption(v, ov, 'fontSize'),
      lineHeight: (v, ov) => setCompareOption(v, ov, 'lineHeight'),
      codeBlockLineNumbers: (v, ov) =>
        setCompareOption(v, ov, 'codeBlockLineNumbers'),
      listIndentation: (v, ov) => setCompareOption(v, ov, 'listIndentation'),
      frontmatterType: (v, ov) => setCompareOption(v, ov, 'frontmatterType'),
      superSubScript: (v, ov) => setCompareOption(v, ov, 'superSubScript'),
      footnote: (v, ov) => setCompareOption(v, ov, 'footnote'),
      isGitlabCompatibilityEnabled: (v, ov) =>
        setCompareOption(v, ov, 'isGitlabCompatibilityEnabled'),
      hideQuickInsertHint: (v, ov) =>
        setCompareOption(v, ov, 'hideQuickInsertHint'),
      hideLinkPopup: (v, ov) => setCompareOption(v, ov, 'hideLinkPopup'),
      autoCheck: (v, ov) => setCompareOption(v, ov, 'autoCheck'),
      sequenceTheme: (v, ov) => setCompareOption(v, ov, 'sequenceTheme'),
      typewriter: typewriter,
      clipboardFilePath: guessClipboardFilePath,
      disableHtml: false,
      imageAction: async (image, id, _alt = '') => {
        console.log('imageAction222', image);
        let result = image;
        if (!image.length) {
          result = await moveImageToFolder(
            `img_${id}`,
            image,
            `${savedLocation}/image/`
          );
          console.log('imageAction_moveImageToFolder', result);
        }
        return Promise.resolve(result);
      },
      imagePathPicker: async () => {
        const { filePaths } = await remote.dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            {
              name: 'Images',
              extensions: IMAGE_EXTENSIONS,
            },
          ],
          message: '选择添加图片',
        });
        if (filePaths && filePaths[0]) {
          return filePaths[0];
        } else {
          return '';
        }
      },
    }),
    []
  );

  const handleContentChange = (data) => {
    const { markdown } = data;
    if (markdown !== body && markdown !== '\n') {
      onChange(id, markdown);
    }
  };

  const closeMuya = () => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.off('change', handleContentChange);
    editorRef.current.destroy();
  };

  const initMuya = () => {
    if (!editorWrapRef.current) return;
    editorRef.current = new Muya(editorWrapRef.current, {
      ...options,
      markdown: body,
    });
    editorRef.current.on('change', handleContentChange);
  };

  useEffect(() => {
    initMuya();
    return () => {
      closeMuya();
    };
  }, [id]);

  useEffect(() => {
    if (editorRef.current) {
      setMarkdownToEditor({ markdown: body });
    }
  }, [isLoaded]);
  return (
    <div className={styles.Note}>
      <div
        ref={editorWrapRef}
        id="container"
        style={{
          padding: '6px 38px',
          outline: 'none',
          height: '100vh',
          overflow: 'auto',
        }}
      />
    </div>
  );
};

export default Note;
