import { Button } from "../../Button"
import { useSlateStatic } from 'slate-react'
import { Element as SlateElement, Transforms, Editor } from 'slate'
import { CodeBlockType, CodeLineType, ParagraphType } from ".."
import ToolIcon from '../../../../Icon';
import { isBlockActive } from "../../../formatter/utils";

const CodeBlockButton = () => {
  const editor = useSlateStatic()
  const handleClick = () => {
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
        { type: CodeLineType },
        { match: n => SlateElement.isElement(n) && n.type === ParagraphType }
      )
    }
  }

  return (
    <Button
      data-test-id="code-block-button"
      active
      onMouseDown={event => {
        event.preventDefault()
        handleClick()
      }}
      style={{color: '#aaa'}}
    >
      <ToolIcon  type="icon-editor-code" />
    </Button>
  )
}


export default CodeBlockButton;