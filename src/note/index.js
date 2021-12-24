import React, { Component, useRef } from 'react';
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

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.editor = null;
  }

  // shouldComponentUpdate({ activeFile: nextFile }) {
  //   const { activeFile } = this.props;
  //   console.log(
  //     'shouldComponentUpdate:if-closeMuya',
  //     activeFile.id !== nextFile.id || activeFile.isLoaded !== nextFile.isLoaded
  //   );
  //   if (
  //     activeFile.id !== nextFile.id ||
  //     activeFile.isLoaded !== nextFile.isLoaded ||
  //     activeFile.body !== nextFile.body
  //   ) {
  //     // this.openMuya();
  //     return true;
  //   }
  //   return false;
  // }

  handleContentChange = (data) => {
    const { activeFile, onChange } = this.props;
    console.log('oooo', data);
    // onChange(activeFile.id, data.markdown);
  };

  handleImagePathPicker = async () => {
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
  };

  setCompareOption = (value, oldValue, key) => {
    const { editor } = this;
    if (value !== oldValue && editor) {
      editor.setOptions({ [key]: value });
    }
  };

  typewriter = (value) => {
    if (value) {
      this.scrollToCursor();
    }
  };

  scrollToCursor = (duration = 300) => {
    if (!this.editor) {
      return;
    }
    const { container } = this.editor;
    const { y } = this.editor.getSelection().cursorCoords;
    console.log(
      '0000我执行了2',
      container,
      y,
      container.scrollTop + y - STANDAR_Y
    );
    animatedScrollTo(container, container.scrollTop + y - STANDAR_Y, duration);
  };

  openMuya = () => {
    const { activeFile } = this.props;
    this.editor = new Muya(document.querySelector('#container'), {
      preferLooseListItem: (v, ov) =>
        this.setCompareOption(v, ov, 'preferLooseListItem'),
      autoPairBracket: (v, ov) =>
        this.setCompareOption(v, ov, 'autoPairBracket'),
      autoPairMarkdownSyntax: (v, ov) =>
        this.setCompareOption(v, ov, 'autoPairMarkdownSyntax'),
      autoPairQuote: (v, ov) => this.setCompareOption(v, ov, 'autoPairQuote'),
      trimUnnecessaryCodeBlockEmptyLines: (v, ov) =>
        this.setCompareOption(v, ov, 'trimUnnecessaryCodeBlockEmptyLines'),
      bulletListMarker: (v, ov) =>
        this.setCompareOption(v, ov, 'bulletListMarker'),
      orderListDelimiter: (v, ov) =>
        this.setCompareOption(v, ov, 'orderListDelimiter'),
      tabSize: (v, ov) => this.setCompareOption(v, ov, 'tabSize'),
      fontSize: (v, ov) => this.setCompareOption(v, ov, 'fontSize'),
      lineHeight: (v, ov) => this.setCompareOption(v, ov, 'lineHeight'),
      codeBlockLineNumbers: (v, ov) =>
        this.setCompareOption(v, ov, 'codeBlockLineNumbers'),
      listIndentation: (v, ov) =>
        this.setCompareOption(v, ov, 'listIndentation'),
      frontmatterType: (v, ov) =>
        this.setCompareOption(v, ov, 'frontmatterType'),
      superSubScript: (v, ov) => this.setCompareOption(v, ov, 'superSubScript'),
      footnote: (v, ov) => this.setCompareOption(v, ov, 'footnote'),
      isGitlabCompatibilityEnabled: (v, ov) =>
        this.setCompareOption(v, ov, 'isGitlabCompatibilityEnabled'),
      hideQuickInsertHint: (v, ov) =>
        this.setCompareOption(v, ov, 'hideQuickInsertHint'),
      hideLinkPopup: (v, ov) => this.setCompareOption(v, ov, 'hideLinkPopup'),
      autoCheck: (v, ov) => this.setCompareOption(v, ov, 'autoCheck'),
      sequenceTheme: (v, ov) => this.setCompareOption(v, ov, 'sequenceTheme'),
      typewriter: this.typewriter,
      clipboardFilePath: guessClipboardFilePath,
      disableHtml: false,
      markdown: activeFile.body || '',
      imageAction: async (image, id, alt = '') => {
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
      imagePathPicker: this.handleImagePathPicker,
    });

    if (this.typewriter) {
      this.scrollToCursor();
    }
    this.editor.on('change', this.handleContentChange);
  };



  componentDidUpdate() {
    console.log(
      'componentDidUpdate:openMuya,scrollCursor',
      this.props.activeFile
    );
    this.openMuya();
    // if (this.typewriter) {
    //   this.scrollToCursor();
    // }
  }

  // componentDidMount() {
  //   console.log('componentDidMount:openMuya', this.props.activeFile);
  //   // this.openMuya();
  // }

  componentWillUnmount() {
    console.log('componentWillUnmount:closeMuya');
    this.closeMuya();
  }

  render() {
    return (
      <div className={styles.Note}>
        <div
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
  }
}

export default Note;
