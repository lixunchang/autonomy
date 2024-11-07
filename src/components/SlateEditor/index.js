import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Transforms,
  createEditor,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Text,
  Node
} from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import withShortcuts from './formatter/shortcuts';
import withImages from './formatter/images';
import {withTables} from './formatter/tables/index';
import Toolbar from './components/Toolbar';
import isHotkey from 'is-hotkey';
import styles from './index.less';
import RenderElement, { RenderLeaf } from './formatter';
import { BlockButton, MarkButton } from './components/Button';
import { isBlockActive, toggleMark } from './formatter/utils';
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
import { CodeBlockType, CodeLineType, languageTypes, ParagraphType } from './components/BlockCode/index.jsx';
import { isCanEditInTable } from './utils/util.js';
import { slateToMarkdown } from './utils/transformer.js';
// import copy from 'copy-to-clipboard';
// import { TableOutlined } from '@ant-design/icons';

const { clipboard } = require('electron')

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

  const copyMarkdown =()=>{
    clipboard.writeText(slateToMarkdown(value))
  }

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
        // onClick={handleEditableClick}
        onCopy={handleEditableCopy}
        onPaste={handleEditablePaste}
        onKeyDown={(event) => {
          const editorDom = ReactEditor.toDOMNode(editor, editor)
          if (
            !isCanEditInTable(editor) &&
            !isHotkey(['delete', 'backspace'], event) &&
            editorDom.getAttribute('contenteditable') === 'true'
          ) {
            // 非 delete backspace 按键时
            editorDom.setAttribute('contenteditable', 'false')
            Promise.resolve()
              .then(() => editorDom.setAttribute('contenteditable', 'true'))
              .catch(() => {})
          }
          if (isHotkey('tab', event)) {
            event.preventDefault();
            Editor.insertText(editor, '  ')
          }
          if (isHotkey('mod+a', event)) {
            event.preventDefault();
            Transforms.select(editor, []);
          }
          // console.log('event==>', event, event.metaKey&&event.code === 'Enter', event.ctrlKey && event.key ==='q')
          if(event.ctrlKey&&event.key === '`'){
            event.preventDefault();
            if(isBlockActive(editor, 'code-block')){
              Transforms.unwrapNodes(editor, {
                match: (n) =>
                  !Editor.isEditor(n) &&
                  SlateElement.isElement(n) &&
                  n.type === 'code-block',
              });
              Transforms.setNodes(
                editor,
                { type: ParagraphType }
              )
            }else{
              Transforms.wrapNodes(
                editor,
                { type: CodeBlockType, language: 'html', children: [] },
                {
                  match: n => SlateElement.isElement(n) && n.type === ParagraphType,
                  split: true,
                }
              )
              Transforms.setNodes(
                editor,
                { type: CodeLineType, children: [{text: ""}] },
                { match: n => SlateElement.isElement(n) && n.type === ParagraphType }
              )
            }
            return;
          }
          if(event.metaKey && event.key ==='Enter'){
            event.preventDefault();
            // let nextsilbingNode;
            // for(let node of Editor.levels(
            //   editor,
            //   {
            //     match:n=>!Editor.isEditor(n)&&n.type === 'code-block' ? true : false, 
            //     reverse:true
            //   }
            // )){
            //   nextsilbingNode = Editor.next(editor,{at:node[1]})
            // }
            // console.log('=====', nextsilbingNode);
            // if(nextsilbingNode){
            //   Transforms.select(editor, nextsilbingNode[1])
            //   Transforms.collapse(editor, {fedge:'end'})
            // }else{
              // Transforms.collapse(editor, {fedge:'end'})

            //   function getDepth(editor, at = editor.selection) {
            //     const { anchor } = at;
            //     if (anchor.depth === 0) {
            //         return 0;
            //     }
            //     let depth = 1;
            //     let block = editor.value.document.getParent(anchor.path);
            //     while (block && block.type !== editor.value.document.type) {
            //         block = editor.value.document.getParent(block.parent.path);
            //         depth += 1;
            //     }
            //     return depth;
            // }

              Editor.insertNode(editor, {
                type: 'paragraph',
                children: [{ text: '' }],
              })
              // 将光标移动到编辑器末尾
              // Transforms.moveToEnd(editor);?
              // Transforms.collapse(editor, {fedge:'end'})
              if(Array.from(Node.levels(editor, editor.selection.focus.path)).length>3){
                Transforms.liftNodes(editor);
              }
              // 插入新块
              // Transforms.insertNodes(editor, {
              //   type: 'paragraph',
              //   children: [{ text: '' }],
              // });
              // Transforms.setNodes(editor, {type:'paragraph'})
            // }
          }else if(event.key ==='Enter') {
            // const textBeforeCursor = Editor.before(editor, editor.selection.anchor, { unit: 'block' });
            // const start = Editor.start(editor, textBeforeCursor.path);
            const range = { anchor: editor.selection.anchor, focus:{ ...editor.selection.focus, offset: 0} };
            const beforeText = Editor.string(editor, range)
            const codePrefix = beforeText.startsWith('```')? languageTypes[beforeText.replace('```','')||'html']: '';
            // 获取当前选区中的块级节点
            // const [ node ] = Editor.nodes(editor, {
            //   match: (n) => Editor.isBlock(editor, n),
            //   mode: 'all',
            // });
            // const [match] = Editor.nodes(editor, {
            //   match: n => n.type === 'code-block',
            // })
            // Range.isCollapsed(range),
            console.log('node===>', codePrefix, Editor.isStart(editor, editor.selection))
            if(codePrefix){
              event.preventDefault();
              Transforms.insertText(editor, '', {at: range})
              if(isBlockActive(editor, 'code-block')){
                Transforms.liftNodes(editor);
                Transforms.setNodes(editor, {type:'paragraph'})
                return;
              }
              Transforms.wrapNodes(
                editor,
                { type: CodeBlockType, language: codePrefix, children: [] },
                {
                  match: n => SlateElement.isElement(n) && n.type === ParagraphType,
                  split: true,
                }
              )
              Transforms.setNodes(
                editor,
                { type: CodeLineType, children: [{text: ""}] },
                { match: n => SlateElement.isElement(n) && n.type === ParagraphType }
              )
            }
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
