import React, { Component } from 'react';
import Muya from '../components/Muya/lib';
import styles from './index.less';

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.editor = null;
  }

  shouldComponentUpdate({ activeFile: nextFile }) {
    const { activeFile } = this.props;
    if (
      activeFile.id !== nextFile.id ||
      activeFile.isLoaded !== nextFile.isLoaded
    ) {
      this.closeMuya();
      return true;
    }
    return false;
  }

  handleContentChange = (data) => {
    const { activeFile, onChange } = this.props;
    onChange(activeFile.id, data.markdown);
  };

  openMuya = () => {
    const { activeFile } = this.props;
    this.editor = new Muya(document.querySelector('#container'), {
      markdown: activeFile.body || '',
      imageAction: (image, id, alt = '') => {
        console.log('imageAction', image, id, alt);
        const src =
          'file:///Users/jacklee/Pictures/331f8d07-e219-461c-ba84-08ea78730220.png';
        //  'https://ss1.baidu.com/-4o3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/b64543a98226cffc7a951157b8014a90f703ea9c.jpg';
        // this.editor.insertImage({ src });
        return Promise.resolve(src);
      },
    });
    this.editor.on('change', this.handleContentChange);
  };

  closeMuya = () => {
    if (!this.editor) {
      return;
    }
    this.editor.off('change', this.handleContentChange);
    this.editor.destroy();
    this.editor = null;
  };

  componentDidUpdate() {
    this.openMuya();
  }

  componentDidMount() {
    this.openMuya();
  }

  componentWillUnmount() {
    this.closeMuya();
  }

  render() {
    return (
      <div style={{ padding: '6px 38px' }} className={styles.Note}>
        <div id="container" style={{ outline: 'none' }} />
      </div>
    );
  }
}

export default Note;
