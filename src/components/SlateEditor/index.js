import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Transforms,
  createEditor,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
} from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import withShortcuts from './formatter/shortcuts';
import withImages from './formatter/images';
import Toolbar from './components/Toolbar';
import isHotkey from 'is-hotkey';
import styles from './index.less';
import RenderElement, { RenderLeaf } from './formatter';
import { BlockButton, MarkButton } from './components/Button';
import { toggleMark } from './formatter/utils';
import { DEFAULT_NOTE, HOTKEYS, SHORTCUTS } from './constant';
import ToolIcon from '../Icon';
import ColorPicker from './components/ColorPicker';
import InsertImage from './components/InsertImage';
import useDecorate from './hooks/useDecorate';
import SetNodeToDecorations from './components/SetNodeToDecorations';
import CodeBlockButton from './components/BlockCode/components/BlockCodeButton';
import { prismThemeCss } from './components/BlockCode/highlight.js';
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'

const parseValue = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    if (value.startsWith('[{') && value.endsWith('}]')) {
      return JSON.parse(value);
    }
    return [
      {
        type: 'paragraph',
        children: [
          {
            text: value,
          },
        ],
      },
    ];
  }
  return DEFAULT_NOTE;
};

// const initialValue = [
//   {
//     type: 'paragraph',
//     children: [
//       {
//         text: '请输入markdown...',
//       },
//     ],
//   },
// ];
//   // {
//   //   type: 'block-quote',
//   //   children: [{ text: 'A wise quote.', color: 'red' }],
//   // },
//   // {
//   //   type: 'image',
//   //   url: 'https://source.unsplash.com/kFrdX5IeQzI',
//   //   children: [{ text: '' }],
//   // },
//   // {
//   //   type: 'paragraph',
//   //   children: [
//   //     {
//   //       text: 'Order when you start a line with "## " you get a level-two heading, like this:',
//   //     },
//   //   ],
//   // },
//   // {
//   //   type: 'heading-two',
//   //   children: [{ text: 'Try it out!' }],
//   // },
//   // {
//   //   type: 'image',
//   //   url: 'https://source.unsplash.com/zOwZKwZOZq8',
//   //   children: [{ text: '' }],
//   // },
//   // {
//   //   type: 'paragraph',
//   //   textAlign: 'right',
//   //   children: [
//   //     {
//   //       text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
//   //     },
//   //   ],
//   // },
// ];

const SlateEditor = ({ id, page = 1, value, onChange, isLoaded }) => {
  const renderElement = useCallback(RenderElement, []);
  const renderLeaf = useCallback(RenderLeaf, []);
  const editor = useMemo(
    () => withShortcuts(withImages(withReact(withHistory(createEditor())))),
    []
  );

  // useEffect(() => {
  //   // editor.children = value;
  // }, [editor, value]);

  const decorate = useDecorate(editor)

  const handleSaveSelection = () => {
    editor.savedSelection = editor.selection;
  };

  const handleDOMBeforeInput = useCallback(
    (e) => {
      queueMicrotask(() => {
        const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

        const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
          if (!diff.text.endsWith(' ')) {
            return false;
          }

          const { text } = SlateNode.leaf(editor, path);
          const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1);
          console.log('handleDOMBeforeInput22', beforeText);
          if (!(beforeText in SHORTCUTS)) {
            return;
          }

          const blockEntry = Editor.above(editor, {
            at: path,
            match: (n) =>
              SlateElement.isElement(n) && Editor.isBlock(editor, n),
          });
          if (!blockEntry) {
            return false;
          }

          const [, blockPath] = blockEntry;
          return Editor.isStart(editor, Editor.start(editor, path), blockPath);
        });

        if (scheduleFlush) {
          ReactEditor.androidScheduleFlush(editor);
        }
      });
    },
    [editor]
  );
  console.log('SlateEditor', id, value);
  return (
    <Slate
      key={id + '-' + page}
      editor={editor}
      initialValue={parseValue(value)}
      // value={parseValue(value)}
      onChange={(value) => {
        console.log('values==', value);
        const isAstChange = editor.operations.some(
          (op) => 'set_selection' !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          // const content = JSON.stringify(value);
          // localStorage.setItem('content', content);
          onChange(value);
        }
      }}
    >
      <Toolbar className={styles.toolbar}>
        <InsertImage />
        <ColorPicker />
        {/* <MarkButton format="code" icon={<ToolIcon type="icon-editor-code" />} /> */}
        <CodeBlockButton />
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
        <MarkButton
          format="bold"
          icon={<ToolIcon type="icon-editor-fuhao-jiacu" />}
        />
        <MarkButton
          format="italic"
          icon={<ToolIcon type="icon-editor-italic" />}
        />
        <MarkButton
          format="underline"
          icon={<ToolIcon type="icon-editor-underline" />}
        />
        <MarkButton
          format="middleline"
          icon={<ToolIcon type="icon-editor-a-zhonghuaxian1" />}
        />
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
        <BlockButton
          format="heading-one"
          icon={<ToolIcon type="icon-editor-heading-h1" />}
        />
        <BlockButton
          format="heading-two"
          icon={<ToolIcon type="icon-editor-heading-h2" />}
        />
        <BlockButton
          format="heading-three"
          icon={<ToolIcon type="icon-editor-heading-h3" />}
        />
        <BlockButton
          format="heading-four"
          icon={<ToolIcon type="icon-editor-heading-h4" />}
        />
        <BlockButton
          format="heading-five"
          icon={<ToolIcon type="icon-editor-heading-h5" />}
        />
         <BlockButton
          format="heading-six"
          icon={<ToolIcon type="icon-editor-heading-h6" />}
        />
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
        <BlockButton
          format="check-list"
          icon={<ToolIcon type="icon-editor-checkbox-checked" />}
        />
        <BlockButton
          format="block-quote"
          icon={<ToolIcon type="icon-editor-text_quote" />}
        />
        <BlockButton
          format="numbered-list"
          icon={<ToolIcon type="icon-editor-format_list_numbered" />}
        />
        <BlockButton
          format="bulleted-list"
          icon={<ToolIcon type="icon-editor-format-list-bulleted" />}
        />
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
        <BlockButton
          format="center"
          icon={<ToolIcon type="icon-editor-align-center" />}
        />
        <BlockButton
          format="right"
          icon={<ToolIcon type="icon-editor-align-right" />}
        />
        <BlockButton
          format="left"
          icon={<ToolIcon type="icon-editor-align-left" />}
        />
        <BlockButton
          format="justify"
          icon={<ToolIcon type="icon-editor-align-justify" />}
        />
      </Toolbar>
      <SetNodeToDecorations />
      <Editable
        className={styles.slate_editor}
        decorate={decorate}
        onDOMBeforeInput={handleDOMBeforeInput}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (isHotkey('tab', event)) {
            event.preventDefault();
            Editor.insertText(editor, '  ')
          }
          if (isHotkey('mod+a', event)) {
            event.preventDefault();
            Transforms.select(editor, []);
          }
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
        placeholder={
          <p style={{ marginTop: 12 }}>
            请输入markdown...
          </p>
        }
        spellCheck
        autoFocus
        onBlur={handleSaveSelection}
      />
      <style>{prismThemeCss}</style>
    </Slate>
  );
};

export default SlateEditor;
