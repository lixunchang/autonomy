import React, { useCallback, useMemo } from 'react';
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
import formatter, { formatChildren } from './formatter';
import { BlockButton, MarkButton } from './components/Button';
import { toggleMark } from './formatter/utils';
import { HOTKEYS, SHORTCUTS } from './constant';
import ToolIcon from '../Icon';
import ColorPicker from './components/ColorPicker';
import InsertImage from './components/InsertImage';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: '请输入markdown...',
      },
    ],
  },
  // {
  //   type: 'block-quote',
  //   children: [{ text: 'A wise quote.', color: 'red' }],
  // },
  // {
  //   type: 'image',
  //   url: 'https://source.unsplash.com/kFrdX5IeQzI',
  //   children: [{ text: '' }],
  // },
  // {
  //   type: 'paragraph',
  //   children: [
  //     {
  //       text: 'Order when you start a line with "## " you get a level-two heading, like this:',
  //     },
  //   ],
  // },
  // {
  //   type: 'heading-two',
  //   children: [{ text: 'Try it out!' }],
  // },
  // {
  //   type: 'image',
  //   url: 'https://source.unsplash.com/zOwZKwZOZq8',
  //   children: [{ text: '' }],
  // },
  // {
  //   type: 'paragraph',
  //   textAlign: 'right',
  //   children: [
  //     {
  //       text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
  //     },
  //   ],
  // },
];

const SlateEditor = ({ id, value, onChange, isLoaded }) => {
  const renderElement = useCallback(formatter, []);
  const renderLeaf = useCallback(formatChildren, []);
  const editor = useMemo(
    () => withShortcuts(withImages(withReact(withHistory(createEditor())))),
    []
  );

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
      key={id}
      editor={editor}
      initialValue={
        typeof value === 'string' ? JSON.parse(value) : value || initialValue
      }
      onChange={(value) => {
        console.log('values==', value);
        const isAstChange = editor.operations.some(
          (op) => 'set_selection' !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          // localStorage.setItem('content', content);
          onChange(content);
        }
      }}
    >
      <Toolbar className={styles.toolbar}>
        <InsertImage />
        <ColorPicker />
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
        <MarkButton format="code" icon={<ToolIcon type="icon-editor-code" />} />
        <BlockButton
          format="heading-one"
          icon={<ToolIcon type="icon-editor-heading-h1" />}
        />
        <BlockButton
          format="heading-two"
          icon={<ToolIcon type="icon-editor-heading-h2" />}
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
        <BlockButton
          format="left"
          icon={<ToolIcon type="icon-editor-align-left" />}
        />
        <BlockButton
          format="center"
          icon={<ToolIcon type="icon-editor-align-center" />}
        />
        <BlockButton
          format="right"
          icon={<ToolIcon type="icon-editor-align-right" />}
        />
        <BlockButton
          format="justify"
          icon={<ToolIcon type="icon-editor-align-justify" />}
        />
      </Toolbar>
      <Editable
        className={styles.slate_editor}
        onDOMBeforeInput={handleDOMBeforeInput}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
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
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
        onBlur={handleSaveSelection}
      />
    </Slate>
  );
};

export default SlateEditor;
