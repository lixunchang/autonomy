import { Component, useEffect } from 'react';
import Vditor from 'vditor';
import './VEditor.css';

const VEditor = ({ value, onSave }) => {
  console.log('value', value);
  useEffect(() => {
    const vditor = new Vditor('vditor', {
      toolbar: [],
      toolbarConfig: {
        pin: false,
        hide: false,
      },
      mode: 'ir',
      outline: false,
      preview: {
        theme: 'wechat',
        markdown: {
          codeBlockPreview: false,
        },
        hljs: {
          enable: true,
          lineNumber: true,
        },
      },
      value,
      typewriterMode: true,
      cache: {
        enable: false,
      },
      input(val) {
        console.log('onsave', val, value);
        // if (val && val !== value) {
        onSave(val);
        // }
      },
    });
  }, [value]);

  return <div id="vditor" />;
};

// class VEditor extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       value: props.value,
//     };
//   }
//   componentDidUpdate() {}
//   componentDidMount() {
//     const { value } = this.state;
//     const { onSave } = this.props;
//     const vditor = new Vditor('vditor', {
//       toolbar: [],
//       toolbarConfig: {
//         pin: false,
//         hide: false,
//       },
//       mode: 'ir',
//       outline: false,
//       preview: {
//         theme: 'wechat',
//         markdown: {
//           codeBlockPreview: false,
//         },
//         hljs: {
//           enable: true,
//           lineNumber: true,
//         },
//       },
//       typewriterMode: true,
//       cache: {
//         enable: false,
//       },
//       blur(val) {
//         onSave(val);
//       },
//       after() {
//         vditor.setValue(value);
//       },
//     });
//   }

//   render() {
//     return <div id="vditor" className="vditor-reset" />;
//   }
// }

export default VEditor;
