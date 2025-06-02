import { useCallback } from 'react';
import { Editor, Transforms, Path, Element as SlateElement, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import isHotkey from 'is-hotkey';
import { isBlockActive, toggleMark } from '../formatter/utils';
import { CodeBlockType, CodeLineType, languageTypes, ParagraphType } from '../components/BlockCode/index.jsx';
import { isCanEditInTable } from '../utils/util.js';
import { HOTKEYS } from '../constant';

export const useKeyDown = (editor) => {
  return useCallback((event) => {
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

    if (isHotkey('tab', event)) {
      event.preventDefault();
      Editor.insertText(editor, '  ')
    }

    if (isHotkey('mod+a', event)) {
      event.preventDefault();
      Transforms.select(editor, []);
    }

    if(event.ctrlKey && event.key === '`'){
      event.preventDefault();
      if(isBlockActive(editor, 'code-block')){
        Transforms.unwrapNodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === 'code-block',
        });
        Transforms.setNodes(editor, { type: ParagraphType })
      } else {
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
      Editor.insertNode(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
      })
      if(Array.from(Node.levels(editor, editor.selection.focus.path)).length>3){
        Transforms.liftNodes(editor);
      }
    } else if(event.key ==='Enter') {
      const range = { anchor: editor.selection.anchor, focus:{ ...editor.selection.focus, offset: 0} };
      const beforeText = Editor.string(editor, range)
      const codePrefix = beforeText.startsWith('```')? languageTypes[beforeText.replace('```','')||'html']: '';

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

      const [imageNode] = Editor.nodes(editor, {
        match: n => n.type === 'image',
      });

      if (imageNode) {
        event.preventDefault();
        const [, path] = imageNode;
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: Path.next(path) }
        );
        Transforms.select(editor, Path.next(path));
        return;
      }
    }

    // 处理列表的回车和删除
    if (event.key === 'Enter' && !event.shiftKey) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'numbered-list' || n.type === 'bulleted-list' || n.type === 'check-list',
      });

      if (match) {
        const [node, path] = match;
        const isEmpty = Node.string(node).length === 0;

        if (isEmpty) {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' });
          return;
        }
      }
    }

    if (event.key === 'Backspace') {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'numbered-list' || n.type === 'bulleted-list' || n.type === 'check-list',
      });

      if (match) {
        const [node, path] = match;
        const isEmpty = Node.string(node).length === 0;

        if (isEmpty) {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' });
          return;
        }
      }
    }

    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }
  }, [editor]);
};
