import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Transforms,
  createEditor,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Text,
  Node,
  Path
} from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import withShortcuts from './formatter/shortcuts';
import withImages from './formatter/images';
import {withTables} from './formatter/tables/index';
import Toolbar from './components/Toolbar';
import isHotkey from 'is-hotkey';
import { HOTKEYS } from './constant';
import styles from './index.less';
import RenderElement, { RenderLeaf } from './formatter';
import { BlockButton, MarkButton } from './components/Button';
import { isBlockActive, toggleMark } from './formatter/utils';
import { DEFAULT_NOTE, SHORTCUTS } from './constant';
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
import { CodeBlockType, CodeLineType, languageTypes, ParagraphType } from './components/BlockCode/index.jsx';
import { isCanEditInTable } from './utils/util.js';
import { slateToMarkdown } from './utils/transformer.js';
import { message } from 'antd';

const { clipboard } = window.require('electron');
const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const path = window.require('path');

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
// ];

const SlateEditor = ({ id, page = 1, value, onChange, isLoaded, title }) => {

  const [editorEventState, setEditorEventState] = useState({
    mouseDown: false,
    mouseUp: false,
    blur: false,
    resetSelection: false
  })


  const renderElement = useCallback((p)=>RenderElement({...p, editorEventState}), [editorEventState]);
  const renderLeaf = useCallback(RenderLeaf, []);
  const editor = useMemo(
    () => withShortcuts(withTables(withImages(withReact(withHistory(createEditor()))))),
    []
  );

  // useEffect(() => {
  //   // editor.children = value;
  // }, [editor, value]); 这是副标题文本呢

  const handleEditableCopy=()=>{
    // const selectedText = Editor.string(editor, editor.selection, {voids: true});
    // SlateNode.texts(editor, editor.selection)
    // console.log('selectedText====>22', editor, selectedText, editor.selection, editor.selection.anchor.path, editor.selection.focus.path);
    // // 获取编辑器的值
    // const value = editor.value;
    
    // // 如果没有选中的文本，直接返回空字符串
    // if (value.isBlurred || editor.selection.isBlurred) {
    //     return '';
    // }

    const { anchor, focus } = editor.selection;
    let from = anchor.path;
    let fromOffset = anchor.offset;
    let to  = focus.path;
    let toOffset = focus.offset;
    if(from[0] > to[0]){
      from = focus.path;
      fromOffset = focus.offset;
      to = anchor.path;
      toOffset = anchor.offset;
    }
    const selectedText = Array.from(SlateNode.texts(editor, {from, to})).reduce((result, ite, index, list)=>{

      const item = ite[0]
      if(index === 0){
        return item.text.slice(fromOffset)
      }else if(index === list.length - 1){
        console.log('item===', item)
        return result + '\n' + item.text.slice(0, toOffset)
      }
      return result + '\n' + item.text;
    },'')

    // for (let number of SlateNode.texts(editor, {from, to})) {
    //   console.log('----', number);
    // }
    // 获取选中的文本
    // const selectedText2 = SlateNode.texts(editor, editor.selection).reduce((text, node) => {
    //     console.log('=====>', node)
    //     return text + node.text.split('\n').join('\n' + node.indent);
    // }, '');

    clipboard.writeText(selectedText)
  }

  const decorate = useDecorate(editor)

  const handleSaveSelection = () => {
    editor.savedSelection = editor.selection;
  };

  const handleEditablePaste =(e)=>{
    console.log('paste=', e)
  }

  const copyMarkdown = async () => {
    const markdownContent = slateToMarkdown(value);
    // clipboard.writeText(markdownContent); // 添加复制到剪贴板

    try {
      const result = await dialog.showSaveDialog({
        title: '导出 Markdown',
        defaultPath: `${title}.md`,
        filters: [
          { name: 'Markdown Files', extensions: ['md'] }
        ]
      });

      if (result.filePath) {
        fs.writeFileSync(result.filePath, markdownContent, 'utf-8');
        message.success('导出成功');
      }
    } catch (err) {
      message.error('导出失败：' + err.message);
    }
  }

  const handleEditableClick = (event) => {
    if (event.target.getAttribute('data-slate-editor')) {
      const lastNode = editor.children[editor.children.length - 1];
      
      if (lastNode.type === 'code-block') {
        try {
          // 获取编辑器根节点
          const path = [editor.children.length];
          
          // 在末尾插入新段落
          Transforms.insertNodes(
            editor,
            { 
              type: 'paragraph',
              children: [{ text: '' }]
            },
            { at: path }
          );

          Transforms.select(editor, Editor.start(editor, path));
          
          event.preventDefault();
          return;
        } catch (err) {
          console.error('Error inserting new paragraph:', err);
        }
      }
    }

    // 处理图片节点的原有逻辑
    const [imageNode] = Editor.nodes(editor, {
      match: n => n.type === 'image',
    });

    if (imageNode) {
      const [, path] = imageNode;
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: Path.next(path) }
      );
      Transforms.select(editor, Path.next(path));
    }
  };

  // const handleEditableClick=(event)=>{
  //   const lastNodeType = editor.children[editor.children.length - 1].type;

  //   console.log('==========>>>>>>', event, editor.selection, Editor.start(editor, editor.selection.path))
  //   if(event.target.getAttribute('data-slate-editor')&&['code-block', 'image'].includes(lastNodeType)){
  //     // // Editor.isNormalizing(editor)
  //     console.log('==========>>>>>>', 'handleEditableClick', 
  //       editor, editor.selection,
  //       Editor.isEnd(editor, editor.selection.focus, editor.selection.focus.path)
  //     )
  //     Editor.insertNode(editor, {
  //       type: 'paragraph',
  //       children: [{ text: '' }],
  //     })
  //     if(['code-block'].includes(lastNodeType)){
  //       Transforms.liftNodes(editor);
  //     }
  //   }
  // }

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

  const handleKeyDown = useCallback((event) => {
    const editorDom = ReactEditor.toDOMNode(editor, editor)
    if (
      !isCanEditInTable(editor) &&
      !isHotkey(['delete', 'backspace'], event) &&
      editorDom.getAttribute('contenteditable') === 'true'
    ) {
      editorDom.setAttribute('contenteditable', 'false')
      Promise.resolve()
        .then(() => editorDom.setAttribute('contenteditable', 'true'))
        .catch(() => {})
    }

    // 处理列表的删除键退出
    if (event.key === 'Backspace') {
      const [currentListItem] = Editor.nodes(editor, {
        match: n => n.type === 'list-item',
        mode: 'lowest'
      });

      if (currentListItem) {
        const [itemNode] = currentListItem;
        const itemText = Node.string(itemNode).trim();

        if (itemText === '') {
          event.preventDefault();
          const [parentList] = Editor.parent(editor, currentListItem[1]);
          
          if (['numbered-list', 'bulleted-list', 'check-list'].includes(parentList.type)) {
            Transforms.setNodes(editor, { type: 'paragraph' });
            Transforms.unwrapNodes(editor, {
              match: n => ['numbered-list', 'bulleted-list', 'check-list'].includes(n.type),
              split: true
            });
          }
          return;
        }
      }
    }
    
    // 其他键盘事件处理
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }
  }, [editor]);

  return (
    <Slate
      key={id + '-' + page}
      editor={editor}
      initialValue={parseValue(value)}
      // value={parseValue(value)}
      onChange={(value) => {
        const isAstChange = editor.operations.some(
          (op) => 'set_selection' !== op.type
        );
        console.log('values==', value, isAstChange);
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
        <BlockButton
          format="table"
          icon={<ToolIcon type="icon-editor-biaoge" style={{color: '#aaa'}} />}
        />
        <CodeBlockButton />
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
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
        <ToolIcon type="icon-editor-fengexian" className={styles.fengexian}/>
        <BlockButton
          onClick={copyMarkdown}
          icon={<ToolIcon type="icon-editor-markdown" />}
        />
      </Toolbar>
      <SetNodeToDecorations />
      <Editable
        className={styles.slate_editor}
        decorate={decorate}
        onDOMBeforeInput={handleDOMBeforeInput}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onClick={handleEditableClick}
        onCopy={handleEditableCopy}
        onPaste={handleEditablePaste}
        onKeyDown={handleKeyDown}
        placeholder={
          <span style={{display: 'inline-block', marginTop: 12 }}>
            写点什么...
          </span>
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
